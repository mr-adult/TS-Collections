import {ExtendedIterable} from "./Collections";

export class LLNode<TElement> {
    public next: LLNode<TElement> | undefined;
    public previous: LLNode<TElement> | undefined;
    public item: TElement;

    constructor(item: TElement) {
        this.item = item;
    }
}

export class DoublyLinkedList<TElement> extends ExtendedIterable<TElement> {
    // Documented in base class
    public get length(): number {
        return this._length;
    };
    private _length: number = 0;

    public first: LLNode<TElement> | undefined;
    public last: LLNode<TElement> | undefined;

    public addItemAfter(nodeToAddAfter: LLNode<TElement>, itemToAdd: TElement): void {
        this.addNodeAfter(nodeToAddAfter, new LLNode(itemToAdd));
    }

    public addNodeAfter(nodeToAddAfter: LLNode<TElement>, nodeToAdd: LLNode<TElement>): void {
        if (nodeToAddAfter.next) {
            if (nodeToAddAfter.next.next) {
                nodeToAddAfter.next.next.previous = nodeToAdd;
            }
            nodeToAdd.next = nodeToAddAfter.next;
        }
        nodeToAddAfter.next = nodeToAdd;
        this._length++;
    }

    public addItemFirst(item: TElement) {
        this.addNodeFirst(new SinglyLLNode(item));
    }

    public addNodeFirst(node: SinglyLLNode<TElement>): this {
        if (this.first) {
            node.next = this.first;
        }

        // this.first = node;
        return this;
    }

    public addItemLast(item: TElement) {
        const nodeToAddAfter = this.getNodesForward()
            .findLast(() => true);

        this.addItemAfter(nodeToAddAfter, item);
    }

    public addNodeLast(nodeToAdd: LLNode<TElement>): this {
        const nodeToAddAfter = this.getNodesForward()
            .findLast(() => true);

        this.addNodeAfter(nodeToAddAfter, nodeToAdd);
        return this;
    }

    public clear(): void {
        this.first = undefined;
    }

    public removeItem(item: TElement): boolean {
        const nodeBeforeItemToRemove = this.getNodesForward()
            .find(node => node.next?.item === item);

        if (!nodeBeforeItemToRemove) { return false; }

        nodeBeforeItemToRemove.next = nodeBeforeItemToRemove.next?.next;
        return true;
    }

    public removeNode(node: SinglyLLNode<TElement>): boolean {
        const nodeBeforeNodeToRemove = this.getNodesForward()
            .find(currentNode => currentNode.next === node);

        if (!nodeBeforeNodeToRemove) { return false; }
        
        nodeBeforeNodeToRemove.next = nodeBeforeNodeToRemove.next?.next;
        return true;
    }

    public removeFirst(): this {
        this.first = this.first?.next;
        return this;
    }

    public removeLast(): this {
        let secondToLastNode: SinglyLLNode<TElement> | undefined = undefined;

        for (const node of this.getNodesForward()) {
            if (node.next) { secondToLastNode = node; }
        }

        if (secondToLastNode) {
            secondToLastNode.next = undefined;
        }
        return this;
    }

    protected getNodesForward(): ExtendedIterable<SinglyLLNode<TElement>> {
        if (!this.first) {
            return ExtendedIterable.empty<SinglyLLNode<TElement>>();
        }
        return new ForwardLLNodeIterable<SinglyLLNode<TElement>, TElement>(this.first);
    }

    public [Symbol.iterator](): Iterator<TElement> {
        return this.getNodesForward()
            .map(node => node.item)
            [Symbol.iterator]();
    }
}

class BackwardLLNodeIterable<TNode extends LLNode<TElement>, TElement> extends ExtendedIterable<TNode> {
    private _startingNode: TNode;

    constructor(startingNode: TNode) {
        super();
        this._startingNode = startingNode;
    }

    [Symbol.iterator](): Iterator<TNode> {
        return new BackwardLLNodeIterator(this._startingNode);
    }
}

/** An iterator for iterating through the elements of a linked list */
class LLElementIterator<TNode extends SinglyLLNode<TElement>, TElement> implements Iterator<TElement> {
    protected _nodeIterator: LLNodeIterator<TNode>;

    constructor(nodeIterator: LLNodeIterator<TNode>) {
        this._nodeIterator = nodeIterator;
    }

    public next(): IteratorResult<TElement> {      
        // Grab our node iterator result.
        const iterResult = this._nodeIterator.next();
        
        if (iterResult.done) {
            // The node iterator is done, so we're also done.
            return iterResult;
        }

        // The node iterator had a value, extract its 'item' field.
        return {
            done: false,
            value: iterResult.value.item
        };
    }
}

export class SinglyLinkedList<TElement> extends ExtendedIterable<TElement> {
    // Documented in base class
    public get length(): number {
        return this._length;
    };
    private _length: number = 0;

    public first: SinglyLLNode<TElement> | undefined;

    public addItemAfter(node: SinglyLLNode<TElement>, itemToAdd: TElement): void {
        this.addNodeAfter(node, new SinglyLLNode(itemToAdd));
    }

    public addNodeAfter(node: SinglyLLNode<TElement>, nodeToAdd: SinglyLLNode<TElement>): void {
        if (node.next) {
            nodeToAdd.next = node.next;
        }
        node.next = nodeToAdd;
        this._length++;
    }

    public addItemFirst(item: TElement) {
        this.addNodeFirst(new SinglyLLNode(item));
    }

    public addNodeFirst(node: SinglyLLNode<TElement>): this {
        if (this.first) {
            node.next = this.first;
        }

        this.first = node;
        return this;
    }

    public addItemLast(item: TElement) {
        const nodeToAddAfter = this.getNodes()
            .findLast(() => true);

        this.addItemAfter(nodeToAddAfter, item);
    }

    public addNodeLast(nodeToAdd: SinglyLLNode<TElement>): this {
        const nodeToAddAfter = this.getNodes()
            .findLast(() => true);

        this.addNodeAfter(nodeToAddAfter, nodeToAdd);
        return this;
    }

    public clear(): void {
        this.first = undefined;
    }

    public removeItem(item: TElement): boolean {
        const nodeBeforeItemToRemove = this.getNodes()
            .find(node => node.next?.item === item);

        if (!nodeBeforeItemToRemove) { return false; }

        nodeBeforeItemToRemove.next = nodeBeforeItemToRemove.next?.next;
        return true;
    }

    public removeNode(node: SinglyLLNode<TElement>): boolean {
        const nodeBeforeNodeToRemove = this.getNodes()
            .find(currentNode => currentNode.next === node);

        if (!nodeBeforeNodeToRemove) { return false; }
        
        nodeBeforeNodeToRemove.next = nodeBeforeNodeToRemove.next?.next;
        return true;
    }

    public removeFirst(): SinglyLLNode<TElement> | undefined {
        const oldFirst = this.first;
        this.first = this.first?.next;
        return oldFirst;
    }

    public removeLast(): SinglyLLNode<TElement> | undefined {
        let secondToLastNode: SinglyLLNode<TElement> | undefined = undefined;

        for (const node of this.getNodes()) {
            if (node.next) { secondToLastNode = node; }
        }

        let lastNode: SinglyLLNode<TElement> | undefined = undefined;
        if (secondToLastNode) {
            lastNode = secondToLastNode.next;
            secondToLastNode.next = undefined;
        }
        return lastNode;
    }

    protected getNodes(): ExtendedIterable<SinglyLLNode<TElement>> {
        if (!this.first) {
            return ExtendedIterable.empty<SinglyLLNode<TElement>>();
        }
        return new ForwardLLNodeIterable<SinglyLLNode<TElement>, TElement>(this.first);
    }

    public [Symbol.iterator](): Iterator<TElement> {
        return this.getNodes()
            .map(node => node.item)
            [Symbol.iterator]();
    }
}

class ForwardLLNodeIterable<TNode extends SinglyLLNode<TElement>, TElement> extends ExtendedIterable<TNode> {
    private _startingNode: TNode;
    
    constructor(startingNode: TNode) {
        super();
        this._startingNode = startingNode;
    }

    [Symbol.iterator](): Iterator<TNode> {
        return new ForwardLLNodeIterator(this._startingNode);
    }
}

export class SinglyLLNode<TElement> {
    public next: SinglyLLNode<TElement> | undefined;
    public item: TElement;

    constructor(item: TElement) {
        this.item = item;
    }
}

/** An iterator for iterating through the nodes of a linked list */
abstract class LLNodeIterator<TNode> implements Iterator<TNode> {
    private _first: TNode | undefined;
    private _current: TNode | undefined;
    private _getNext: (node: TNode) => TNode;

    constructor(first: TNode, getNext: (node: TNode) => TNode) {
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
        if (!next) {
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

export class Queue<TElement> extends ExtendedIterable<TElement> {
    private _start: SinglyLLNode<TElement> | undefined;
    private _end: SinglyLLNode<TElement> | undefined;
    /** 
     * Gets the length of the queue.
     */
    public get length() {
        return this._length;
    }
    private _length: number = 0;

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
        return oldStart.item;
    }

    /** 
     * Adds the element to the back of the queue. 
     */
    public enqueue(item: TElement) {
        if (this._start === undefined && this._end === undefined) {
            this._start = new SinglyLLNode(item);
            this._end = this._start;
        }
        else {
            const newNode = new SinglyLLNode(item);
            this._end.next = newNode;
            this._end = newNode;
        }
        this._length++;
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
        return new LLElementIterator<SinglyLLNode<TElement>, TElement>(
            new ForwardLLNodeIterator<SinglyLLNode<TElement>, TElement>(this._start)
        );
    }
}