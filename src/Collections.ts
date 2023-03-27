/**
 * A class that provides utility methods for any 
 * Iterable object. These methods are evaluated lazily,
 * so they can have poor performance if called several 
 * times in succession on a complex Iterable.
 */
export abstract class ExtendedIterable<TElement> implements Iterable<TElement> {
    abstract [Symbol.iterator](): Iterator<TElement>;

    /** 
     * A singleton instance of an empty iterable. This object's behavior is always the same,
     * so we can reference share across instances to cut down on its memory footprint.
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

    protected _enableDebugging: boolean = false;
    // @ts-expect-error This should only be used in debugging. Do not access it!
    protected _asArray: TElement[]

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
    public static empty<TElement = any>(): ExtendedIterable<TElement> {
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

    public find(predicate?: Predicate<this, TElement>): TElement | undefined {
        let index = 0;
        for(const element of this) {            
            if (!predicate || predicate(element, index, this)) {
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

    public findLast(predicate?: Predicate<this, TElement>): TElement | undefined {
        let index = 0
        let match: TElement | undefined = undefined;
        for (const element of this) {
            if (!predicate || predicate(element, index, this)) {
                match = element;
            }
        }
        return match;
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

    public join(delimeter?: string): string {
        return this.toArray().join(delimeter);
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

    public reverseOrder(): ExtendedIterable<TElement> {
        const stack = new Stack<TElement>()
        
        for (const item of this) {
            stack.push(item);
        }
        
        return stack;
    }

    public skip(numberToSkip: number): ExtendedIterable<TElement> {
        return new SkipIterable(this, numberToSkip);
    }

    public slice(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public some(predicate: Predicate<this, TElement>): boolean {
        let index = -1;
        for (const element of this) {
            index++;
            if (predicate(element, index, this)) { return true; }
        }
        return false;
    }

    public sort(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public toArray(): TElement[] {
        const result = [];
        for(const item of this) {
            result.push(item);
        }
        return result;
    }

    public toLocaleString(): never {
        // TODO
        throw new Error("Not Implemented");
    }

    public toString(): string {
        // TODO: make this faster
        return this.toArray().toString();
    }

    public values(): never {
        // TODO
        throw new Error("Not Implemented");
    }
}

/**
 * Wraps an iterable, attaching all of the ExtendedIterable methods to it
 */
export class WrappedIterable<TElement> extends ExtendedIterable<TElement> {
    private _iterable: Iterable<TElement>;
    
    constructor(iterable: Iterable<TElement>) {
        super();
        this._iterable = iterable;
        if (this._enableDebugging) this._asArray = this.toArray();
    }

    public [Symbol.iterator]() {
        return this._iterable[Symbol.iterator]();
    }
}

export abstract class BidirectionalIterable<TElement> extends ExtendedIterable<TElement> {
    abstract [Symbol.iterator](): Iterator<TElement>;
    abstract getReverseIterator(): Iterator<TElement>;
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
        if (this._enableDebugging) this._asArray = this.toArray();
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

// class FlatMappedIterator<TSource, TResult, TSourceIterable extends Iterable<TSource>> implements Iterator<TResult> {
//     private _sourceIterable: TSourceIterable
//     private _sourceIterator: Iterator<TSource>;

//     private _currentlyActiveChildIterator: Iterator<TResult> | undefined;

//     private _selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>;
//     private _index = 0;

//     constructor(sourceIterable: TSourceIterable, selector: (element: TSource, index: number, iterable: TSourceIterable) => Iterable<TResult>) {
//         this._sourceIterable = sourceIterable;
//         this._sourceIterator = sourceIterable[Symbol.iterator]();
//         this._selector = selector;
//     }

//     public next(): IteratorResult<TResult> {
//         let childIterResult: IteratorResult<TResult> | undefined = undefined
//         while (!this._currentlyActiveChildIterator || childIterResult?.done) {
//             childIterResult = this._currentlyActiveChildIterator?.next();

//             if (childIterResult && !childIterResult.done) {
//                 return { done: false, value: childIterResult.value }
//             }
    
//             if (!childIterResult || childIterResult?.done) {
//                 const parentIterResult = this._sourceIterator.next();
//                 if (parentIterResult.done) { return { done: true, value: undefined }; }
        
//                 this._currentlyActiveChildIterator = 
//                     this._selector(
//                         parentIterResult.value, 
//                         this._index++, 
//                         this._sourceIterable
//                     )[Symbol.iterator]();
//             }
//         }
//     }
// }

class SkipIterable<TElement> extends ExtendedIterable<TElement> {
    private _sourceIterable: Iterable<TElement>;
    private _numberToSkip: number;
    constructor(sourceIterable: Iterable<TElement>, numberToSkip: number) {
        super();
        this._sourceIterable = sourceIterable;
        this._numberToSkip = numberToSkip;
        if (this._enableDebugging) this._asArray = this.toArray();
    }

    [Symbol.iterator]() {
        return new SkipIterator(this._sourceIterable[Symbol.iterator](), this._numberToSkip);
    }
}

class SkipIterator<TElement> implements Iterator<TElement, undefined> {
    private _sourceIterable: Iterator<TElement>;
    private _numberToSkip: number;
    private _isFirstIteration = true;

    constructor(sourceIterator: Iterator<TElement>, numberToSkip: number) {
        this._sourceIterable = sourceIterator;
        this._numberToSkip = numberToSkip;
    }

    next(): IteratorResult<TElement, undefined> {
        if (!this._isFirstIteration) {
            return this._sourceIterable.next();
        }

        this._isFirstIteration = false;
        let iterResult: IteratorResult<TElement, undefined> = { done: true, value: undefined };
        for (let i = 0; i <= this._numberToSkip; i++) {
            iterResult = this._sourceIterable.next();
            if (iterResult.done) { break; }
        }
        return iterResult;
    }
}

/** A stack data structure built on top of a linked list */
export class Stack<TElement> extends ExtendedIterable<TElement> {
    /** The number of elements in the Stack */
    public override get length(): number {
        return this._length;
    }
    private _length: number = 0;

    /** The Linked List that actually handles our push/pop operations */
    private _top?: StackElement<TElement>;

    constructor() {
        super();
        if (this._enableDebugging) this._asArray = [];
    }

    /** Puts an item on the top of the stack */
    push(item: TElement): this {
        this._length++;
        if (this._enableDebugging) this._asArray.push(item);

        if (this._top === undefined) {
            this._top = new StackElement(item);
            return this;
        }

        const newElement = new StackElement(item)
        newElement.next = this._top;
        this._top = newElement;
        return this;
    }

    /** Removes and returns the item on top of the stack */
    pop(): TElement | undefined {
        if (this._enableDebugging) this._asArray.pop();
        const oldTop = this._top;
        this._top = this._top?.next;
        this._length--;
        return oldTop?.item;
    }

    /** Returns the item on top of the stack without removing it */
    peek(): TElement | undefined {
        return this._top?.item;
    }

    /** Clears the stack so that there are no elements in it. */
    clear() {
        this._top = undefined;
        this._length = 0;
    }

    public override toString(): string {
        return this.toArray().toString();
    }

    [Symbol.iterator](): Iterator<TElement> {
        return new StackElementIterator(this._top);
    }
}

class StackElementIterator<T> implements Iterator<T> {
    private _current: StackElement<T> | undefined;

    constructor(top: StackElement<T> | undefined) {
        this._current = top;
    }

    public next(): IteratorResult<T> {
        const valToReturn = this._current;
        this._current = this._current?.next;
        
        if (valToReturn === undefined || this._current === undefined) {
            return { done: true, value: undefined };
        }

        return { done: false, value: this._current.item };
    }
}

class StackElement<T> {
    /** The next node down the stack */
    public next?: StackElement<T>;

    /** This node's contained value/item */
    item: T;

    constructor(item: T) {
        this.item = item;
    }
}

export default ExtendedIterable;