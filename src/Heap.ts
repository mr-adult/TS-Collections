import { BinaryTreeNode } from "./TreeNode";

abstract class Heap<T = number> {
    /**
     * This method is used to decide whether first should be sunk in the heap when compared with second.
     * It should return true if the first should be below second in the heap.
     */
    protected abstract _sinkStrategy: (first: T, second: T) => boolean;
    protected _comparer: (first: T, second: T) => number;

    public get length() {
        return this._heap.length;
    }
    private _heap: T[] = [];

    /**
     * Creates a new Heap instance.
     * @param comparer A function used to compare two elements in the heap. This function should return 
     * a number less than 0 if first is before second in the sort order, a number greater than zero if 
     * the first element is after second in the sort order, or 0 if the two elements are equal. The default
     * will use > and < operators.
     */
    constructor(comparer?: (first: T, second: T) => number) {
        this._comparer = comparer ?? Heap._defaultComparer;
    }

    /**
     * Pushes an element into the heap.
     */
    public push(element: T): void {
        this._heap.push(element);
        this._heapifyUp(this._heap.length - 1);
    }

    /**
     * Pops an element from the heap.
     */
    pop(): T | undefined {
        if (this._heap.length < 1) {
            return this._heap.pop();
        }

        const oldTop = this._heap[0];
        this._heap[0] = this._heap.pop()!;
        this._heapifyDown(0);
        return oldTop;
    }

    /**
     * Converts this heap into a tree structure that can be traversed.
     */
    public toTree(): HeapNode<T> | undefined {
        if (this.length === 0) { return undefined; }
        return new HeapNode<T>(
            this._heap[0]!,
            (Heap.getLeft as Function).bind(undefined, this, 0) as () => HeapNode<T>,
            (Heap.getRight as Function).bind(undefined, this, 0) as () => HeapNode<T>,
        );
    }

    private _heapifyUp(index: number): void {
        while (index !== 0) {
            const parentIndex = this.getParentIndex(index);
            const parentValue = this._heap[parentIndex];
            const currentValue = this._heap[index]

            if (this._sinkStrategy(parentValue!, currentValue!)) {
                this._heap[index] = parentValue!;
                this._heap[parentIndex] = currentValue!;
                index = parentIndex;
            }
            else { break; }
        }
    }

    private _heapifyDown(index: number): void {
        while (index < this._heap.length) {
            const leftIndex = this.getLeftChildIndex(index);
            // If this is true, we're at the bottom
            if (leftIndex >= this._heap.length) { break; }
            const rightIndex = this.getRightChildIndex(index);
            const leftValue = this._heap[leftIndex]!;
            const rightValue = this._heap[rightIndex];

            const mostExtremeChild = rightValue === undefined || this._sinkStrategy(rightValue, leftValue);
            const minChild = mostExtremeChild ? leftValue : rightValue;
            if (this._sinkStrategy(this._heap[index]!, minChild!)) {
                if (mostExtremeChild) {
                    this._heap[leftIndex] = this._heap[index]!;
                    this._heap[index] = minChild;
                    index = leftIndex;
                }
                else {
                    this._heap[rightIndex] = this._heap[index]!;
                    this._heap[index] = minChild;
                    index = rightIndex;
                }
            }
            else { break; }
        }
    }

    private getParentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private getLeftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    private getRightChildIndex(index: number): number {
        return 2 * index + 2;
    }  

    private static _defaultComparer<T>(first: T, second: T): number {
        return first < second ? -1 : first > second? 1 : 0;
    }

    private static getLeft<T>(heap: Heap<T>, index: number): HeapNode<T> | undefined {
        const leftChildIndex = heap.getLeftChildIndex(index);
        if (leftChildIndex > heap.length - 1) { return undefined; }
        const getLeft = (Heap.getLeft as Function).bind(undefined, heap, leftChildIndex) as () => HeapNode<T> | undefined;
        const getRight = (Heap.getRight as Function).bind(undefined, heap, leftChildIndex) as () => HeapNode<T> | undefined;

        return new HeapNode<T>(
            heap._heap[leftChildIndex]!, 
            getLeft, 
            getRight
        );
    }

    private static getRight<T>(heap: Heap<T>, index: number): HeapNode<T> | undefined {
        const getRightChildIndex = heap.getRightChildIndex(index);
        if (getRightChildIndex > heap.length - 1) { return undefined; }
        const getLeft = (Heap.getLeft as Function).bind(undefined, heap, getRightChildIndex) as () => HeapNode<T> | undefined;
        const getRight = (Heap.getRight as Function).bind(undefined, heap, getRightChildIndex) as () => HeapNode<T> | undefined;

        return new HeapNode<T>(
            heap._heap[getRightChildIndex]!, 
            getLeft, 
            getRight
        );
    }
}

class HeapNode<T> extends BinaryTreeNode<HeapNode<T>> {
    value: T;
    getLeft: () => HeapNode<T> | undefined;
    getRight: () => HeapNode<T> | undefined;

    constructor(value: T, getLeft: () => HeapNode<T> | undefined, getRight: () => HeapNode<T> | undefined) {
        super();
        this.value = value;
        this.getLeft = getLeft;
        this.getRight = getRight;
    }
}

/**
 * An implementation of a min heap data structure.
 */
export class MinHeap<T> extends Heap<T> {
    protected override _sinkStrategy = (first: T, second: T) => this._comparer(first, second) > 0;
}

/**
 * An implementation of a max heap data structure.
 */
export class MaxHeap<T> extends Heap<T> {
    protected override _sinkStrategy = (first: T, second: T) => this._comparer(first, second) < 0;
}