/**
 * Free particle slots of a GPU buffer shared by several systems.
 *
 * Free slots live in a min-heap, so a new particle always takes the lowest free slot. Live particles stay packed at the
 * start of the buffer and one dispatch / draw over `[0, highWater)` covers all of them. A per-block (64 slots) count of
 * used slots gives the high-water mark.
 *
 * A slot freed here may still hold a (dead) particle on the GPU. That never shows: a free slot below `highWater` is
 * processed by the update kernel (which skips dead particles) and drawn collapsed, and the high-water mark can only
 * move past a free slot by allocating it first (lowest free slot first), which overwrites it.
 */
export class GPUSlotPool {
    static readonly BLOCK_SHIFT = 6;

    /** number of slots */
    capacity: number;
    /** number of slots in use */
    usedCount = 0;

    private free_: Int32Array;
    private freeCount_ = 0;
    private blockUsed_: Int32Array;
    private topBlock_ = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.free_ = new Int32Array(capacity);
        this.blockUsed_ = new Int32Array(GPUSlotPool.blockCount(capacity));
        this.clear();
    }

    private static blockCount(capacity: number): number {
        return (capacity + (1 << GPUSlotPool.BLOCK_SHIFT) - 1) >> GPUSlotPool.BLOCK_SHIFT;
    }

    /** Slots `[0, highWater)` hold every used slot (rounded up to a block of 64, at most `capacity`). */
    get highWater(): number {
        return Math.min(this.capacity, this.topBlock_ << GPUSlotPool.BLOCK_SHIFT);
    }

    /** number of free slots */
    get freeCount(): number {
        return this.freeCount_;
    }

    /** Frees every slot. */
    clear() {
        // an ascending array is a valid min-heap
        for (let i = 0; i < this.capacity; i++) this.free_[i] = i;
        this.freeCount_ = this.capacity;
        this.blockUsed_.fill(0);
        this.topBlock_ = 0;
        this.usedCount = 0;
    }

    /** Takes the lowest free slot, or returns -1 when all slots are in use (see {@link grow}). */
    allocate(): number {
        if (this.freeCount_ === 0) return -1;
        const heap = this.free_;
        const slot = heap[0];
        const last = heap[--this.freeCount_];
        const n = this.freeCount_;
        let i = 0;
        for (;;) {
            const l = 2 * i + 1;
            if (l >= n) break;
            const r = l + 1;
            const c = r < n && heap[r] < heap[l] ? r : l;
            if (heap[c] >= last) break;
            heap[i] = heap[c];
            i = c;
        }
        heap[i] = last;
        const block = slot >> GPUSlotPool.BLOCK_SHIFT;
        this.blockUsed_[block]++;
        if (block >= this.topBlock_) this.topBlock_ = block + 1;
        this.usedCount++;
        return slot;
    }

    /** Returns a slot to the pool. */
    free(slot: number) {
        const heap = this.free_;
        let i = this.freeCount_++;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= slot) break;
            heap[i] = heap[parent];
            i = parent;
        }
        heap[i] = slot;
        this.blockUsed_[slot >> GPUSlotPool.BLOCK_SHIFT]--;
        this.usedCount--;
        while (this.topBlock_ > 0 && this.blockUsed_[this.topBlock_ - 1] === 0) this.topBlock_--;
    }

    /** Adds slots `[capacity, newCapacity)`; used slots keep their index. */
    grow(newCapacity: number) {
        if (newCapacity <= this.capacity) return;
        const free = new Int32Array(newCapacity);
        free.set(this.free_.subarray(0, this.freeCount_));
        // the new slots are larger than every free slot: appending them in order keeps the heap valid
        for (let i = this.capacity; i < newCapacity; i++) free[this.freeCount_++] = i;
        this.free_ = free;
        const blockUsed = new Int32Array(GPUSlotPool.blockCount(newCapacity));
        blockUsed.set(this.blockUsed_);
        this.blockUsed_ = blockUsed;
        this.capacity = newCapacity;
    }
}

/**
 * Death times of the particles of one system, on the system's own simulation clock.
 *
 * Every particle's lifetime is known when it is spawned (emission stays on the CPU), so the CPU knows when each slot
 * becomes free without reading anything back from the GPU.
 */
export class GPUDeathQueue {
    /** simulation clock of the system, seconds */
    time = 0;

    private times_ = new Float64Array(64);
    private slots_ = new Int32Array(64);
    private count_ = 0;

    /** number of live particles */
    get size(): number {
        return this.count_;
    }

    /** Records a particle in `slot` that lives `life` more seconds. */
    push(life: number, slot: number) {
        if (this.count_ === this.times_.length) {
            const times = new Float64Array(this.count_ * 2);
            times.set(this.times_);
            this.times_ = times;
            const slots = new Int32Array(this.count_ * 2);
            slots.set(this.slots_);
            this.slots_ = slots;
        }
        const time = this.time + (life > 0 ? life : 0);
        const times = this.times_;
        const slots = this.slots_;
        let i = this.count_++;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (times[parent] <= time) break;
            times[i] = times[parent];
            slots[i] = slots[parent];
            i = parent;
        }
        times[i] = time;
        slots[i] = slot;
    }

    /**
     * Advances the clock and reports the slots of the particles that died.
     * @returns the number of dead particles
     */
    advance(delta: number, onDead: (slot: number) => void): number {
        this.time += delta;
        let dead = 0;
        const times = this.times_;
        const slots = this.slots_;
        while (this.count_ > 0 && times[0] <= this.time) {
            const top = slots[0];
            const n = --this.count_;
            const lastTime = times[n];
            const lastSlot = slots[n];
            let i = 0;
            for (;;) {
                const l = 2 * i + 1;
                if (l >= n) break;
                const r = l + 1;
                const c = r < n && times[r] < times[l] ? r : l;
                if (times[c] >= lastTime) break;
                times[i] = times[c];
                slots[i] = slots[c];
                i = c;
            }
            times[i] = lastTime;
            slots[i] = lastSlot;
            onDead(top);
            dead++;
        }
        return dead;
    }

    /** Calls `f` for every live particle with its slot and remaining life. */
    forEach(f: (slot: number, remainingLife: number) => void) {
        for (let i = 0; i < this.count_; i++) f(this.slots_[i], this.times_[i] - this.time);
    }

    /** Removes every particle and resets the clock. */
    clear() {
        this.count_ = 0;
        this.time = 0;
    }
}

/**
 * Slot bookkeeping of a single system: a {@link GPUSlotPool} and a {@link GPUDeathQueue}.
 */
export class GPUSlotAllocator {
    readonly pool: GPUSlotPool;
    readonly deaths = new GPUDeathQueue();

    constructor(capacity: number) {
        this.pool = new GPUSlotPool(capacity);
    }

    get capacity(): number {
        return this.pool.capacity;
    }

    get time(): number {
        return this.deaths.time;
    }

    get liveCount(): number {
        return this.deaths.size;
    }

    get highWater(): number {
        return this.pool.highWater;
    }

    get freeCount(): number {
        return this.pool.freeCount;
    }

    clear() {
        this.pool.clear();
        this.deaths.clear();
    }

    /** Takes the lowest free slot for a particle that lives `life` seconds, or -1 when full. */
    allocate(life: number): number {
        const slot = this.pool.allocate();
        if (slot >= 0) this.deaths.push(life, slot);
        return slot;
    }

    /** Advances the clock and frees the slots of the particles that died; returns their number. */
    advance(delta: number): number {
        return this.deaths.advance(delta, (slot) => this.pool.free(slot));
    }

    grow(newCapacity: number) {
        this.pool.grow(newCapacity);
    }
}
