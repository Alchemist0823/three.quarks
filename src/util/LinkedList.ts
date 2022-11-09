export class LinkedListNode<T> {
    data: T;
    next: LinkedListNode<T> | null;
    prev: LinkedListNode<T> | null;

    constructor(data: T) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }

    hasPrev(): boolean {
        return this.prev !== null;
    }

    hasNext(): boolean {
        return this.next !== null;
    }
}

export class CircularLinkedList<T> {
    length: number;
    head: LinkedListNode<T> | null;

    constructor() {
        this.length = 0;
        this.head = null;
    }

    isEmpty() {
        return this.head === null;
    }

    start(): T | null {
        if (this.head === null)
            return null;
        return this.head.data;
    }

    push(data: T): LinkedListNode<T> {
        const node = new LinkedListNode(data);
        if (!this.head) {
            this.head = node;
            node.prev = node;
            node.next = node;
        } else {
            node.prev = this.head.prev;
            node.next = this.head;
            this.head.prev!.next = node;
            this.head.prev = node;
        }
        this.length++;
        return node;
    }

    insertAfter(prevNode: LinkedListNode<T>, data: T): LinkedListNode<T>{
        const node = new LinkedListNode(data);
        node.prev = prevNode;
        node.next = prevNode.next;
        prevNode.next!.prev = node;
        prevNode.next = node;
        this.length++;
        return node;
    }

    last(): LinkedListNode<T> | undefined {
        if (this.head) {
            return this.head.prev!;
        } else
            return undefined;
    }
    /**
     * Returns an iterator over the values
     */
    * values() {
        let current = this.head;
        if (current !== null) {
            yield current.data;
            while (current!.next !== this.head) {
                current = current!.next;
                yield current!.data;
            }
        }
    }
}

export class LinkedList<T> {
    length: number;
    head: LinkedListNode<T> | null;
    tail: LinkedListNode<T> | null;

    constructor() {
        this.length = 0;
        this.head = this.tail = null;
    }

    isEmpty() {
        return this.head === null;
    }

    clear() {
        this.length = 0;
        this.head = this.tail = null;
    }

    front(): T | null {
        if (this.head === null)
            return null;
        return this.head.data;
    }

    back(): T | null {
        if (this.tail === null)
            return null;
        return this.tail.data;
    }


    /**
     * remove at head in O(1)
     */
    dequeue(): T | undefined {
        if (this.head) {
            const value = this.head.data;
            this.head = this.head.next;
            if (!this.head) {
                this.tail = null;
            } else {
                this.head.prev = null;
            }
            this.length--;
            return value;
        }
        return undefined;
    }

    /**
     * remove at tail in O(1)
     */
    pop(): T | undefined {
        if (this.tail) {
            const value = this.tail.data;
            this.tail = this.tail.prev;
            if (!this.tail) {
                this.head = null;
            } else {
                this.tail.next = null;
            }
            this.length--;
            return value;
        }
        return undefined;
    }

    /**
     * add at head in O(1)
     */
    queue(data: T): void {
        const node = new LinkedListNode(data);
        if (!this.tail) {
            this.tail = node;
        }
        if (this.head) {
            this.head.prev = node;
            node.next = this.head;
        }
        this.head = node;
        this.length++;
    }

    /**
     * add at tail in O(1)
     */
    push(data: T): void {
        const node = new LinkedListNode(data);
        if (!this.head) {
            this.head = node;
        }
        if (this.tail) {
            this.tail.next = node;
            node.prev = this.tail;
        }
        this.tail = node;
        this.length++;
    }

    insertBefore(node: LinkedListNode<T>, data: T) {
        const newNode = new LinkedListNode(data);
        newNode.next = node;
        newNode.prev = node.prev;

        if (newNode.prev !== null) {
            newNode.prev.next = newNode;
        }
        newNode.next.prev = newNode;

        if (node == this.head) {
            this.head = newNode;
        }
        this.length++;
    }

    remove(data: T): void {
        if (this.head === null || this.tail === null) {
            return;
        }
        let tempNode: LinkedListNode<T> = this.head;

        if (data === this.head.data) {
            this.head = this.head.next;
        }
        if (data === this.tail.data) {
            this.tail = this.tail.prev;
        }

        while (tempNode.next !== null && tempNode.data !== data) {
            tempNode = tempNode.next;
        }
        if (tempNode.data === data) {
            if (tempNode.prev !== null)
                tempNode.prev.next = tempNode.next;
            if (tempNode.next !== null)
                tempNode.next.prev = tempNode.prev;
            this.length--;
        }
    }


    /**
     * Returns an iterator over the values
     */
    * values() {
        let current = this.head;
        while (current !== null) {
            yield current.data;
            current = current.next;
        }
    }
}
