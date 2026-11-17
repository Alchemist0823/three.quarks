/**
 * CPU side bookkeeping of the particle slots of a GPU simulated system.
 *
 * Every particle's lifetime is known when it is spawned (emission stays on the CPU), so the CPU knows when each slot
 * becomes free without reading anything back from the GPU:
 *
 * - free slots live in a min-heap, so a new particle always takes the lowest free slot. Live particles stay packed
 *   at the start of the buffer and one dispatch / draw over `[0, highWater)` covers all of them;
 * - spawned slots are pushed on a min-heap of death times and released when the simulation clock passes them;
 * - a per-block (64 slots) live count gives the high-water mark.
 *
 * A slot freed here may still hold a (dead) particle on the GPU, and a slot that died on the CPU a rounding error
 * before the GPU agrees is still drawn for at most one more frame. Neither can show a stale particle: a free slot
 * below `highWater` is processed by the update kernel every step, and the high-water mark can only move past a free
 * slot by allocating it first (lowest free slot first), which overwrites it.
 */
export class GPUSlotAllocator {
    static readonly BLOCK_SHIFT = 6;

    /** number of slots */
    capacity: number;
    /** simulation clock in seconds */
    time = 0;
    /** number of live particles */
    liveCount = 0;

    private free_: Int32Array;
    private freeCount_ = 0;
    private deathTime_: Float64Array;
    private deathSlot_: Int32Array;
    private deathCount_ = 0;
    private blockLive_: Int32Array;
    private topBlock_ = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.free_ = new Int32Array(capacity);
        this.deathTime_ = new Float64Array(capacity);
        this.deathSlot_ = new Int32Array(capacity);
        this.blockLive_ = new Int32Array(GPUSlotAllocator.blockCount(capacity));
        this.clear();
    }

    private static blockCount(capacity: number): number {
        return (capacity + (1 << GPUSlotAllocator.BLOCK_SHIFT) - 1) >> GPUSlotAllocator.BLOCK_SHIFT;
    }

    /**
     * Slots `[0, highWater)` hold every live particle (rounded up to a block of 64, at most `capacity`).
     */
    get highWater(): number {
        return Math.min(this.capacity, this.topBlock_ << GPUSlotAllocator.BLOCK_SHIFT);
    }

    /** number of free slots */
    get freeCount(): number {
        return this.freeCount_;
    }

    /** Frees every slot and resets the clock. */
    clear() {
        // an ascending array is a valid min-heap
        for (let i = 0; i < this.capacity; i++) this.free_[i] = i;
        this.freeCount_ = this.capacity;
        this.deathCount_ = 0;
        this.blockLive_.fill(0);
        this.topBlock_ = 0;
        this.liveCount = 0;
        this.time = 0;
    }

    /**
     * Takes the lowest free slot for a particle that lives `life` seconds from the current clock.
     * @returns the slot, or -1 when all slots are in use (see {@link grow})
     */
    allocate(life: number): number {
        if (this.freeCount_ === 0) return -1;
        const slot = this.popFree();
        this.pushDeath(this.time + (life > 0 ? life : 0), slot);
        const block = slot >> GPUSlotAllocator.BLOCK_SHIFT;
        this.blockLive_[block]++;
        if (block >= this.topBlock_) this.topBlock_ = block + 1;
        this.liveCount++;
        return slot;
    }

    /**
     * Advances the clock and frees the slots of the particles that died.
     * @returns the number of freed slots
     */
    advance(delta: number): number {
        this.time += delta;
        let freed = 0;
        while (this.deathCount_ > 0 && this.deathTime_[0] <= this.time) {
            const slot = this.popDeath();
            this.pushFree(slot);
            this.blockLive_[slot >> GPUSlotAllocator.BLOCK_SHIFT]--;
            this.liveCount--;
            freed++;
        }
        while (this.topBlock_ > 0 && this.blockLive_[this.topBlock_ - 1] === 0) this.topBlock_--;
        return freed;
    }

    /** Adds slots `[capacity, newCapacity)`; live slots keep their index. */
    grow(newCapacity: number) {
        if (newCapacity <= this.capacity) return;
        const free = new Int32Array(newCapacity);
        free.set(this.free_.subarray(0, this.freeCount_));
        // the new slots are larger than every free slot: appending them in order keeps the heap valid
        for (let i = this.capacity; i < newCapacity; i++) free[this.freeCount_++] = i;
        this.free_ = free;
        const deathTime = new Float64Array(newCapacity);
        deathTime.set(this.deathTime_.subarray(0, this.deathCount_));
        this.deathTime_ = deathTime;
        const deathSlot = new Int32Array(newCapacity);
        deathSlot.set(this.deathSlot_.subarray(0, this.deathCount_));
        this.deathSlot_ = deathSlot;
        const blockLive = new Int32Array(GPUSlotAllocator.blockCount(newCapacity));
        blockLive.set(this.blockLive_);
        this.blockLive_ = blockLive;
        this.capacity = newCapacity;
    }

    // ---- binary heaps ---------------------------------------------------------------------------------------

    private popFree(): number {
        const heap = this.free_;
        const top = heap[0];
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
        return top;
    }

    private pushFree(slot: number) {
        const heap = this.free_;
        let i = this.freeCount_++;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= slot) break;
            heap[i] = heap[parent];
            i = parent;
        }
        heap[i] = slot;
    }

    private pushDeath(time: number, slot: number) {
        const times = this.deathTime_;
        const slots = this.deathSlot_;
        let i = this.deathCount_++;
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

    private popDeath(): number {
        const times = this.deathTime_;
        const slots = this.deathSlot_;
        const top = slots[0];
        const n = --this.deathCount_;
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
        return top;
    }
}
