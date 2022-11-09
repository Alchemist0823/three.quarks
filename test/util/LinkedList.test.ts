import {CircularLinkedList, LinkedList} from "../../src/util/LinkedList";


describe('Linked List', function () {
    describe('Normal Linked List', function () {
        test('values', function() {
            const list = new LinkedList<number>();
            list.push(1);
            list.push(10);
            list.push(5);
            let iter = list.values();
            expect(iter.next().value).toBe(1);
            expect(iter.next().value).toBe(10);
            let cur = iter.next();
            expect(cur.value).toBe(5);
            expect(cur.done).toBe(false);
            cur = iter.next();
            expect(cur.value).toBe(undefined);
            expect(cur.done).toBe(true);
        })

        test('basic', function () {
            const list = new LinkedList<number>();
            list.push(1);
            list.push(10);
            list.push(5);
            expect(Array.from(list.values())).toEqual([1, 10, 5]);
            expect(list.dequeue()).toBe(1);
            expect(Array.from(list.values())).toEqual([10, 5]);
            expect(list.dequeue()).toBe(10);
            expect(list.dequeue()).toBe(5);
            expect(list.dequeue()).toBeUndefined();
            expect(Array.from(list.values())).toEqual([]);
            list.push(5);
            list.push(10);
            list.push(1);
            expect(Array.from(list.values())).toEqual([5, 10, 1]);
            expect(list.pop()).toBe(1);
            expect(list.dequeue()).toBe(5);
            expect(list.pop()).toBe(10);
            expect(list.pop()).toBeUndefined();
            expect(list.dequeue()).toBeUndefined();
            expect(Array.from(list.values())).toEqual([]);
        });

        test('remove', function () {
            let list = new LinkedList<number>();
            list.push(1);
            list.push(10);
            list.push(5);
            list.remove(10);
            expect(Array.from(list.values())).toEqual([1, 5]);

            list = new LinkedList<number>();
            list.push(1);
            list.push(10);
            list.push(5);
            list.remove(5);
            expect(Array.from(list.values())).toEqual([1, 10]);

            list = new LinkedList<number>();
            list.push(1);
            list.push(10);
            list.push(5);
            list.remove(1);
            expect(Array.from(list.values())).toEqual([10, 5]);
        });
    });
    describe('Circular Linked List', function () {
        test('basic', function () {
            const list = new CircularLinkedList<number>();
            list.push(1);
            const node10 = list.push(10);
            const node5 = list.push(5);
            expect(Array.from(list.values())).toEqual([1, 10, 5]);

            list.insertAfter(node10, 15);
            expect(Array.from(list.values())).toEqual([1, 10, 15, 5]);
            list.insertAfter(node5, 20);
            expect(Array.from(list.values())).toEqual([1, 10, 15, 5, 20]);
        });
    });
});
