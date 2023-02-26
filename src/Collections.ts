/**
 * A class that provides utility methods for any 
 * Iterable object. These methods are evaluated lazily,
 * so they can have poor performance if called several 
 * times in succession on a complex Iterable.
 */
export abstract class ExtendedIterable<TElement> implements Iterable<TElement> {
    abstract [Symbol.iterator](): Iterator<TElement>;

    /** 
     * A singleton instance of an empty iterable. This objects behavior is always the same,
     * so we can reference share instances to cut down on its memory footprint.
     */
    private static _emptyIterable: EmptyIterable | undefined;

    /** 
     * Gets the length of the iterable. This is a number one higher than the highest index in the 
     * iterable. Getting this value will iterate the iterable, which is an O(N) operation.
     */
    public get length() {
        let length = 0;

        for (const _ of this) {
            length++;
        }

        return length;
    }

    /**
     * 
     * @param index 
     * @returns 
     */
    public at(index: number): TElement | undefined {
        return this.find(
            (_, i) => i === index
        );
    }

    public concat(otherIterable: Iterable<TElement>): never {
        // TODO
        throw new Error("Not Implemented");
    }

    /** Gets an empty iterable object. This should be used in place of null/undefined. */
    public static empty<TElement>(): ExtendedIterable<TElement> {
        if (!ExtendedIterable._emptyIterable) {
            ExtendedIterable._emptyIterable = new EmptyIterable();
        }

        return ExtendedIterable._emptyIterable;
    }

    public entries(): Iterator<TElement> {
        return this[Symbol.iterator]();
    }

    public every(predicate: Predicate<this, TElement>): boolean {
        return !this.some(
            (element, index, iterable) => !predicate(element, index, iterable)
        );
    }

    public filter(predicate: Predicate<this, TElement>): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public find(predicate: Predicate<this, TElement>): TElement | undefined {
        
        let index = 0;

        for(const element of this) {            
            if (predicate(element, index, this)) {
                return element;
            }
            
            index++;
        }

        return undefined;
    }

    public findIndex(predicate: Predicate<this, TElement>): number {
        let index = -1;
        
        this.find((element, index, iterable) => {
            if (predicate(element, index, iterable)) {
                index = index;
                return true;
            }
            return false;
        });

        return index;
    }

    public findLast(predicate: Predicate<this, TElement>): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public findLastIndex(): never {
        // TODO
        throw new Error("Not Implemented");
    }
    
    public flat(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public flatMap(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public forEach(action: (element: TElement, index: number, iterable: this) => void): void {        
        this.find(
            (element: TElement, index: number, iterable: this) => {
                action(element, index, iterable);
                return false;
            }
        );
    }

    public includes(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public indexOf(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public join(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public keys(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public lastIndexOf(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public map<TResult>(selector: (element: TElement, index: number, iterable: this) => TResult): ExtendedIterable<TResult> {
        return new MappedIterable(this, selector);
    }

    public reduce(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public reduceRight(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public reverseOrder(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public slice(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public some(predicate: Predicate<this, TElement>): boolean {
        return !!this.find(
            (element, index, iterable) => predicate(element, index, iterable),
        );
    }

    public sort(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public toLocaleString(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public toString(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public values(): never {
        // TODO
        throw new Error("Not Implemented");
    }
}

type Predicate<TIterable extends ExtendedIterable<TElement> | TElement[], TElement> = 
    (element: TElement, index: number, iterable: TIterable) => boolean;

class EmptyIterable<TElement = any> extends ExtendedIterable<TElement> {
    [Symbol.iterator](): Iterator<TElement> {
        return {
            next: function() {
                return { done: true, value: undefined };
            }
        }
    }
}

class MappedIterable<TSource, TResult, TSourceIterable extends Iterable<TSource>> extends ExtendedIterable<TResult> {
    private _sourceIterable: TSourceIterable
    private _selector: (element: TSource, index: number, iterable: TSourceIterable) => TResult;

    constructor(sourceIterable: TSourceIterable, selector: (element: TSource, index: number, iterable: TSourceIterable) => TResult) {
        super();
        this._sourceIterable = sourceIterable;
        this._selector = selector;
    }

    [Symbol.iterator]() {
        return new MappedIterator(this._sourceIterable, this._selector);
    }
}

class MappedIterator<TSource, TResult, TSourceIterable extends Iterable<TSource>> implements Iterator<TResult> {
    private _sourceIterable: TSourceIterable
    private _sourceIterator: Iterator<TSource>;
    private _selector: (element: TSource, index: number, iterable: TSourceIterable) => TResult;
    private _index = 0;

    constructor(sourceIterable: TSourceIterable, selector: (element: TSource, index: number, iterable: TSourceIterable) => TResult) {
        this._sourceIterable = sourceIterable;
        this._sourceIterator = sourceIterable[Symbol.iterator]();
        this._selector = selector;
    }

    public next(): IteratorResult<TResult> {
        const iterResult = this._sourceIterator.next();
        if (iterResult.done) { return { done: true, value: undefined }; }

        return {
            done: false,
            value: this._selector(iterResult.value, this._index++, this._sourceIterable)
        }
    }
}

// @ts-ignore
class FlatMappedIterable<TSource, TResult, TSourceIterable extends Iterable<TSource>> extends ExtendedIterable<TResult> {
    private _sourceIterable: TSourceIterable
    private _selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>;
    
    constructor(sourceIterable: TSourceIterable, selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>) {
        super();
        this._sourceIterable = sourceIterable;
        this._selector = selector;
    }
}

class FlatMappedIterator<TSource, TResult, TSourceIterable extends Iterable<TSource>> implements Iterator<TResult> {
    private _sourceIterable: TSourceIterable
    private _sourceIterator: Iterator<TSource>;

    private _currentlyActiveChildIterator: Iterator<TResult> | undefined;

    private _selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>;
    private _index = 0;

    constructor(sourceIterable: TSourceIterable, selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>) {
        this._sourceIterable = sourceIterable;
        this._sourceIterator = sourceIterable[Symbol.iterator]();
        this._selector = selector;
    }

    public next(): IteratorResult<TResult> {
        let childIterResult: IteratorResult<TResult> | undefined = undefined
        while (!this._currentlyActiveChildIterator || childIterResult?.done) {
            childIterResult = this._currentlyActiveChildIterator?.next();

            if (childIterResult && !childIterResult.done) {
                return { done: false, value: childIterResult.value }
            }
    
            if (!childIterResult || childIterResult?.done) {
                const parentIterResult = this._sourceIterator.next();
                if (parentIterResult.done) { return { done: true, value: undefined }; }
        
                this._currentlyActiveChildIterator = 
                    this._selector(
                        parentIterResult.value, 
                        this._index++, 
                        this._sourceIterable
                    )[Symbol.iterator]();
            }
        }
    }
}

export class SinglyLLNode<TElement> {
    public next: SinglyLLNode<TElement> | undefined;
    public item: TElement;

    constructor(item: TElement) {
        this.item = item;
    }
}

export class LLNode<TElement> extends SinglyLLNode<TElement> {
    public next: LLNode<TElement> | undefined;
    public previous: LLNode<TElement> | undefined;
    public item: TElement;

    constructor(item: TElement) {
        super(item);
    }
}

/** An iterator for iterating through the nodes of a linked list */
abstract class LLNodeIterator<TNode extends SinglyLLNode<TElement>, TElement> implements Iterator<TNode> {
    private _first: TNode | undefined;
    private _current: TNode | undefined;
    protected abstract _movementStrategy: (node: TNode) => TNode;
    
    constructor(first: TNode) {
        this._first = first;
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

        const next = this._movementStrategy(this._current);
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

class ForwardLLNodeIterator<TNode extends SinglyLLNode<TElement>, TElement> extends LLNodeIterator<TNode, TElement> {
    protected override _movementStrategy = (node: TNode) => node.next as TNode;

    constructor(first: TNode) {
        super(first);
    }
}

class BackwardLLNodeIterator<TNode extends LLNode<TElement>, TElement> extends LLNodeIterator<TNode, TElement> {
    protected override _movementStrategy = (node: TNode) => node.previous as TNode;

    constructor(last: TNode) {
        super(last);
    }
}

/** An iterator for iterating through the elements of a linked list */
class LLElementIterator<TNode extends SinglyLLNode<TElement>, TElement> implements Iterator<TElement> {
    protected _nodeIterator: LLNodeIterator<TNode, TElement>;

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

// export class Queue<TElement> extends ExtendedIterable<TElement> {
//     private start: LLNode<TElement> | undefined;
//     private end: LLNode<TElement> | undefined;

//     public dequeue(): TElement | undefined {
//         if (!this.start) {
//             return undefined;
//         }

//         const oldStart = this.start;
//         this.start = this.start.next;
//         return oldStart.item;
//     }

//     public enqueue(item: TElement) {
//         this.end?.next = 
//     }
// }

export class Stack<TElement> extends ExtendedIterable<TElement> {
    /** The Linked List that actually handles our push/pop operations */
    private _linkedList: SinglyLinkedList<TElement> = new SinglyLinkedList<TElement>();

    /** Puts an item on the top of the stack */
    push(item: TElement) {
        this._linkedList.addItemFirst(item);
    }

    /** Removes and returns the item on top of the stack */
    pop(): TElement | undefined {
        return this._linkedList.removeFirst()?.item;
    }

    /** Returns the item on top of the stack without removing it */
    peek(): TElement | undefined {
        return this._linkedList.first?.item;
    }

    [Symbol.iterator](): Iterator<TElement> {
        return this._linkedList[Symbol.iterator]();
    }
}

export default ExtendedIterable;