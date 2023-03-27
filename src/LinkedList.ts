import {ExtendedIterable} from "./Collections";

/** A doubly-linked list */
export class LinkedList<TElement> extends ExtendedIterable<TElement> {
    // Documented in base class
    /** Gets the length of the LinkedList */
    public override get length(): number {
        return this._length;
    };
    private _length: number = 0;

    /** Gets the first node in the linked list (or undefined if the list is empty) */
    public get first(): LLNode<TElement> | undefined {
        return this._first;
    };
    private _first: LLNode<TElement> | undefined;

    /** Gets the last node in the linked list (or undefined if the list is empty) */
    public get last(): LLNode<TElement> | undefined {
        return this._last;
    }
    private _last: LLNode<TElement> | undefined;


    /** 
     * Adds the node after nodeToAddAfter 
     * @param nodeToAddAfter The target node after which to add the item
     * @param itemToAdd The item to be added to the LinkedList
     */
    public addItemAfter(nodeToAddAfter: LLNode<TElement>, itemToAdd: TElement): this {
        return this.addNodeAfter(nodeToAddAfter, new LLNode(itemToAdd));
    }

    /** 
     * Adds the node after nodeToAddAfter 
     * @param nodeToAddAfter The target node after which to add the node
     * @param nodeToAdd The node to be added to the LinkedList
     */
    public addNodeAfter(nodeToAddAfter: LLNode<TElement>, nodeToAdd: LLNode<TElement>): this {
        if (nodeToAddAfter.list !== this) return this;
        if (nodeToAddAfter.next) {
            nodeToAdd.next = nodeToAddAfter.next;
            if (nodeToAddAfter.next.next) {
                nodeToAddAfter.next.next.previous = nodeToAdd;
            }
        } else {
            nodeToAdd.next = undefined;
        }
        nodeToAddAfter.next = nodeToAdd;
        nodeToAdd.previous = nodeToAddAfter;
        nodeToAdd.list = this;
        this._length++;
        if (nodeToAddAfter === this.last) this._last = nodeToAdd;
        return this;
    }

    /** 
     * Adds the node before nodeToAddBefore 
     * @param nodeToAddBefore The target node before which to add the item
     * @param itemToAdd The item to be added to the LinkedList
     */
    public addItemBefore(nodeToAddBefore: LLNode<TElement>, itemToAdd: TElement): this {
        return this.addNodeBefore(nodeToAddBefore, new LLNode(itemToAdd));
    }

    /** 
     * Adds the node before nodeToAddBefore 
     * @param nodeToAddBefore The target node before which to add the node
     * @param nodeToAdd The node to be added to the LinkedList
     */
    public addNodeBefore(nodeToAddBefore: LLNode<TElement>, nodeToAdd: LLNode<TElement>): this {
        if (nodeToAddBefore.list !== this) return this;
        nodeToAdd.list = this;
        if (nodeToAddBefore.previous) {
            if (nodeToAddBefore.previous.previous) {
                nodeToAddBefore.previous.previous.next = nodeToAdd;
            }
            nodeToAdd.previous = nodeToAddBefore.previous;
        } else {
            nodeToAdd.previous = undefined;
        }

        nodeToAddBefore.previous = nodeToAdd;
        nodeToAdd.next = nodeToAddBefore;
        nodeToAdd.list = this;
        this._length++;
        if (nodeToAddBefore === this.first) this._first = nodeToAdd;
        return this;
    }

    /**
     * Adds the item to the front of the LinkedList
     * @param itemToAdd The item to be added to the LinkedList
     */
    public addItemFirst(item: TElement): this {
        return this.addNodeFirst(new LLNode(item));
    }

    /**
     * Adds the node to the front of the LinkedList
     * @param nodeToAdd The node to be added to the LinkedList
     */
    public addNodeFirst(nodeToAdd: LLNode<TElement>): this {
        nodeToAdd.list = this;
        if (this.first) {
            this.first.previous = nodeToAdd;
            nodeToAdd.next = this.first;
        } else {
            this._last = nodeToAdd;
        }
        this._first = nodeToAdd;
        this._length++;
        return this;
    }

    /**
     * Adds the item to the back of the LinkedList
     * @param itemToAdd The item to be added to the LinkedList
     */
    public addItemLast(itemToAdd: TElement): this {
        return this.addNodeLast(new LLNode(itemToAdd));
    }

    /**
     * Adds the node to the back of the LinkedList
     * @param nodeToAdd The node to be added to the LinkedList
     */
    public addNodeLast(nodeToAdd: LLNode<TElement>): this {
        nodeToAdd.list = this;
        if (this.last) {
            this.last.next = nodeToAdd;
            nodeToAdd.previous = this.first;
        } else {
            this._first = nodeToAdd;
        }
        this._last = nodeToAdd;
        this._length++;
        return this;
    }

    /** 
     * Clears the LinkedList. Nodes are not cleaned up in this process to keep it an O(1) operation. 
     */
    public clear(): void {
        this._first = undefined;
        this._last = undefined;
        this._length = 0;
    }

    /**
     * Removes the first occurrence of the specified item from the LinkedList.
     * This involves searching the LinkedList for the specified item and removing it.
     * This operation is O(n).
     */
    public removeItem(item: TElement): boolean {
        const nodeBeforeItemToRemove = this.getNodes()
            .find(node => node.next?.item === item);

        if (!nodeBeforeItemToRemove) { return false; }

        // snip it out of the list
        nodeBeforeItemToRemove.next = nodeBeforeItemToRemove.next?.next;
        if (nodeBeforeItemToRemove.next) nodeBeforeItemToRemove.next.previous = nodeBeforeItemToRemove;
        this._length--;
        return true;
    }

    /**
     * Removes the node from the LinkedList. This operation is O(1).
     */
    public removeNode(nodeToRemove: LLNode<TElement>): this {
        if (nodeToRemove.list !== this) { return this; }
        nodeToRemove.list = undefined;
        if (nodeToRemove.previous) nodeToRemove.previous.next = nodeToRemove.next;
        if (nodeToRemove.next) nodeToRemove.next.previous = nodeToRemove.previous;
        return this;
    }

    /**
     * Removes and returns the first item from the LinkedList.
     */
    public removeFirst(): TElement | undefined {
        if (this.first) this._length--;
        const oldFirst = this.first?.item;
        this._first = this.first?.next;
        if (this.first) this.first.previous = undefined;
        else this._last = undefined;
        return oldFirst;
    }

    /**
     * Removes and returns the last item from the LinkedList.
     */
    public removeLast(): TElement | undefined {
        if (this.last) this._length--;
        const oldLast = this.last?.item;
        this._last = this.last?.previous;
        if (this.last) this.last.next = undefined;
        else this._first = undefined;
        return oldLast;
    }

    /**
     * Gets an iterable for traversing the nodes in the LinkedList.
     */
    public getNodes(): ExtendedIterable<LLNode<TElement>> {
        if (!this.first) {
            return ExtendedIterable.empty<LLNode<TElement>>();
        }
        return new LLNodeIterable(this.first, node => node.next);
    }

    /**
     * Gets an iterable for traversing the nodes in the LinkedList in reversed order.
     */
    public getNodesInReverse(): ExtendedIterable<LLNode<TElement>> {
        if (!this.last) {
            return ExtendedIterable.empty<LLNode<TElement>>();
        }
        return new LLNodeIterable(this.last, node => node.previous);
    }

    public [Symbol.iterator](): Iterator<TElement> {
        return this.getNodes()
            .map(node => node.item)
            [Symbol.iterator]();
    }
}

/** A class that represents a Node in a doubly-linked list */
export class LLNode<TElement> {
    /** The next node in the list */
    public next: LLNode<TElement> | undefined;

    /** The previous node in the list */
    public previous: LLNode<TElement> | undefined;

    /** This node's contained value/item */
    public item: TElement;

    /** The LinkedList of which this is a part */
    public list: LinkedList<TElement> | undefined;

    /** 
     * A default implementation of toJSON to prevent infinite loops from serializing 
     * the linked list using JSON.stringify() 
     */
    public toJSON(): LLNodeForSerialization<TElement> {
        return {
            item: this.item,
            next: this.next?.toJSON()
        };
    }

    constructor(item: TElement) {
        this.item = item;
    }
}

/**
 * An implementation of a queue that uses a linked list
 */
export class Queue<TElement> extends ExtendedIterable<TElement> {
    /** The start of the queue. This is where elements should be removed from */
    private _start: SinglyLLNode<TElement> | undefined;

    /** The end of the queue. This is where elements should be added to */
    private _end: SinglyLLNode<TElement> | undefined;

    /** Gets the length of the queue. */
    public override get length() {
        return this._length;
    }
    private _length: number = 0;

    constructor() {
        super();
        if (this._enableDebugging) this._asArray = [];
    }

    // Provide a JavaScript Array-like API
    /** 
     * Removes and returns the item from the front of the queue. 
     * If the queue is empty, returns undefined.
     */
    public shift(): TElement | undefined {
        return this.dequeue();
    }

    // Provide a more standard API
    /** 
     * Removes and returns the item from the front of the queue. 
     * If the queue is empty, returns undefined.
     */
    public dequeue(): TElement | undefined {
        if (!this._start) {
            return undefined;
        }

        const oldStart = this._start;
        this._start = this._start.next;
        if (this._start === undefined) {
            this._end = undefined;
        }
        this._length--;
        if (this._enableDebugging) this._asArray.shift();
        return oldStart.item;
    }

    // Provide a JavaScript Array-like API
    /** 
     * Adds the element to the back of the queue. 
     */
    public push(item: TElement): void {
        this.enqueue(item);
    }

    // Provide a more standard API
    /** 
     * Adds the element to the back of the queue. 
     */
    public enqueue(item: TElement): void {
        if (this._start === undefined && this._end === undefined) {
            this._start = new SinglyLLNode(item);
            this._end = this._start;
        }
        else {
            const newNode = new SinglyLLNode(item);
            this._end!.next = newNode;
            this._end = newNode;
        }
        this._length++;
        if (this._enableDebugging) this._asArray.push(item);
    }

    /** 
     * Returns the item from the front of the queue, 
     * leaving the queue unchanged. If the queue is empty, 
     * returns undefined.
     */
    public peek(): TElement | undefined {
        return this._start?.item;
    }

    /** Clears the queue so that there are no items in it. */
    public clear(): void {
        this._start = undefined;
        this._end = undefined;
        this._length = 0;
    }

    [Symbol.iterator](): Iterator<TElement, undefined> {
        if (!this._start) { 
            return ExtendedIterable.empty<TElement>()[Symbol.iterator](); 
        }
        return new LLNodeIterable(this._start, node => node.next)
            .map(node => node.item)
            [Symbol.iterator]();
    }
}

/** A class that represents a Node in a singly-linked list */
export class SinglyLLNode<TElement> {
    /** The next node in the list */
    public next: SinglyLLNode<TElement> | undefined;
    
    /** This node's contained value/item */
    public item: TElement;

    constructor(item: TElement) {
        this.item = item;
    }
}

interface LLNodeForSerialization<TElement> {
    item: TElement;
    next: LLNodeForSerialization<TElement> | undefined;
}

export class LLNodeIterable<TNode> extends ExtendedIterable<TNode> {
    private _first: TNode;
    private _getNext: (node: TNode) => TNode | undefined | null;
    constructor(first: TNode, getNext: (node: TNode) => TNode | undefined | null) {
        super();
        this._first = first;
        this._getNext = getNext;
        if (this._enableDebugging) this._asArray = this.toArray();
    }

    [Symbol.iterator]() {
        return new LLNodeIterator(this._first, this._getNext);
    }
}

/** An iterator for iterating through the nodes of a linked list */
class LLNodeIterator<TNode> implements Iterator<TNode> {
    private _first: TNode | undefined;
    private _current: TNode | undefined;
    private _getNext: (node: TNode) => TNode | undefined | null;

    constructor(first: TNode, getNext: (node: TNode) => TNode | undefined | null) {
        this._first = first;
        this._getNext = getNext;
    }

    public next(): IteratorResult<TNode> {        
        if (!this._current) {
            this._current = this._first;
            this._first = undefined;

            if (!this._current) {
                return {
                    done: true,
                    value: undefined
                }
            }

            return { 
                done: false, 
                value: this._current 
            };
        }

        const next = this._getNext(this._current);
        if (next === null || next === undefined) {
            return { 
                done: true, 
                value: undefined 
            };
        }

        this._current = next;
        return { 
            done: false, 
            value: this._current
        };
    }
}