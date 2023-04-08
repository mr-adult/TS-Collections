/**
 * A class that provides utility methods for any 
 * Iterable object. These methods are evaluated lazily,
 * so they can have unexpected behavior or poor 
 * performance if called several times in succession on 
 * a complex Iterable.
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
     * Retrieves the element at the given index.
     * @param index The index of the element to retrieve.
     * @returns The element at the given index.
     */
    public at(index: number): TElement | undefined {
        return this.find(
            (_, i) => i === index
        );
    }

    /**
     * Concatenates the other iterable onto the end of this one.
     * @param otherIterable The iterable to concatenate onto the end of this one.
     * @returns the resulting iterable
     */
    public concat(otherIterable: Iterable<TElement>): ExtendedIterable<TElement> {
        return new ConcatenatedIterable(this, otherIterable);
    }

    /** Gets an empty iterable object. This should be used in place of null/undefined. */
    public static empty<TElement = any>(): ExtendedIterable<TElement> {
        if (!ExtendedIterable._emptyIterable) {
            ExtendedIterable._emptyIterable = new EmptyIterable();
        }
        return ExtendedIterable._emptyIterable as ExtendedIterable<TElement>;
    }

    /**
     * Decides whether or not every element in the iterable satisfies the given predicate.
     * @param predicate the condition that each element in the iterable must satisfy.
     * @returns True if every element in the iterable satisfies the given predicate, false otherwise.
     */
    public every(predicate: Predicate<this, TElement>): boolean {
        return !this.some(
            (element, index, iterable) => !predicate(element, index, iterable)
        );
    }

    /**
     * Filters the elements in the iterable using the given predicate.
     * @param predicate the condition that each element in the iterable must satisfy.
     * @returns The filtered iterable containing only elements that satisfy the predicate.
     */
    public filter(predicate: Predicate<this, TElement>): ExtendedIterable<TElement> {
        return new FilteredIterable(this, predicate);
    }

    /**
     * Finds the first element in the iterable that satisfies the given predicate and returns it.
     * @param predicate The predicate. If no predicate is provided, the predicate will be treated as always true.
     * @returns The first element in the iterable that satisfies the given predicate, or undefined if no element
     * satisfies the predicate.
     */
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

    /**
     * Finds the first element in the iterable that satisfies the given predicate and returns its index.
     * @param predicate The predicate
     * @returns The index of the first element in the iterable that satisfies the given predicate, or -1 if no
     * element satisfies the predicate.
     */
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

    /**
     * Finds the last element in the iterable that satisfies the given predicate and returns it.
     * @param predicate The predicate. If no predicate is provided, the predicate will be treated as always true.
     * @returns The last element in the iterable that satisfies the given predicate, or undefined if no element
     * satisfies the predicate.
     */
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

    /**
     * Finds the last element in the iterable that satisfies the given predicate and returns its index.
     * @param predicate The predicate
     * @returns The index of the last element in the iterable that satisfies the given predicate, or -1 if no
     * element satisfies the predicate.
     */
    public findLastIndex(predicate: Predicate<this, TElement>): number {
        let lastIndex = -1;

        this.forEach((element, index, iterable) => {
            if (!predicate || predicate(element, index, iterable)) {
                lastIndex = index;
            }
        });

        return lastIndex;
    }

    /**
     * Flattens nested iterables into a continuous iterable. For example, [[0,1,2,3],[4,5,6],[7,8,9]] would yield
     * an iterable with the shape [0,1,2,3,4,5,6,7,8,9]. This is not done recursively, so an array of shape [[[0,1,2]]]
     * would yield an iterable with the shape [[0,1,2,3]].
     */
    public flat<TElement extends Iterable<any>>(): ExtendedIterable<TElement extends Iterable<infer TSubElement> ? TSubElement : never> {
        type TSubElement = TElement extends Iterable<infer TSubElement> ? ExtendedIterable<TSubElement> : never;
        // TS can't quite infer all of this, so we have to leave the type system for this line of code and come back.
        return new FlatIterable<Iterable<TSubElement>>(
            this as ExtendedIterable<Iterable<TSubElement>>
        ) as any as (TElement extends Iterable<infer TSubElement> ? ExtendedIterable<TSubElement> : ExtendedIterable<TElement>);
    }

    /**
     * This method is the equivalent of calling .map() followed by .flat().
     * @param selector The selector to map an element to its new shape.
     * @returns The resulting iterable.
     */
    public flatMap<TResult>(selector: (element: TElement, index: number, iterable: this) => Iterable<TResult>): ExtendedIterable<TResult> {
        return this.map(selector).flat();
    }

    /**
     * Performs a foreach loop over the elements in the iterable. The elements are provided in the same order as
     * a for ... of loop, but their index is also provided.
     * @param action The action to perform on each element.
     */
    public forEach(action: (element: TElement, index: number, iterable: this) => void): void {        
        this.find(
            (element: TElement, index: number, iterable: this) => {
                action(element, index, iterable);
                return false;
            }
        );
    }

    /**
     * Searches the iterable for the element. Equality is determined using '==='.
     * @param element The element to search for.
     */
    public includes(value: TElement): boolean {
        return this.some(element => element === value)
    }

    /**
     * Finds the index of the first instance of the element in the iterable. Equality is determined using '==='.
     * @returns The index of the first instance of the element in the iterable, or -1 if the element is not in 
     * the iterable.
     */
    public indexOf(element: TElement): number {
        let index = -1;
        
        this.find((elementInIterable, i) => {
            if (element === elementInIterable) {
                index = i;
                return true;
            }
            return false;
        });
        
        return index;
    }

    /**
     * Identical to array.join().
     * @param delimeter 
     * @returns 
     */
    public join(delimeter?: string): string {
        return this.toArray()
            .join(delimeter);
    }

    /**
     * Finds the index of the last instance of the element in the iterable. Equality is determined using '==='.
     * @returns The index of the last instance of the element in the iterable, or -1 if the element is not in 
     * the iterable.
     */
    public lastIndexOf(element: TElement): number {
        let index = -1;
        
        this.forEach((elementInIterable, i) => {
            if (element === elementInIterable) {
                index = i;
            }
        });
        
        return index;
    }

    /**
     * The map() method creates a new iterable populated with the results of calling a provided function on every element in the calling array.
     * This new iterable is evaluated lazily.
     */
    public map<TResult>(selector: (element: TElement, index: number, iterable: this) => TResult): ExtendedIterable<TResult> {
        return new MappedIterable(this, selector);
    }

    /**
     * The reduce() method executes a user-supplied "reducer" callback function on each element of the array, in 
     * order, passing in the return value from the calculation on the preceding element. The final result of 
     * running the reducer across all elements of the array is a single value.
     *
     * The first time that the callback is run there is no "return value of the previous calculation". If 
     * supplied, an initial value may be used in its place. Otherwise the array element at index 0 is used as 
     * the initial value and iteration starts from the next element (index 1 instead of index 0).
     * @param reducer 
     * @param initialValue 
     * @returns 
     */
    public reduce<TResult>(reducer: (previousValue: typeof initialValue extends undefined ? TResult | undefined : TResult, currentElement: TElement, index: number, iterable: this) => TResult, initialValue?: TResult): typeof initialValue extends undefined ? TResult | undefined : TResult {
        let result = initialValue as TResult;
        this.forEach((element, index, iterable) => {
            result = reducer(result, element, index, iterable);
        });
        return result;
    }

    /**
     * The reduceRight() method applies a function against an accumulator and each value of the array (from 
     * right-to-left) to reduce it to a single value.
     * 
     * See also ExtendedIterable.prototype.reduce() for left-to-right.
     * @param reducer 
     * @param initialValue 
     * @returns 
     */
    public reduceRight<TResult>(reducer: (previousValue: typeof initialValue extends undefined ? TResult | undefined : TResult, currentElement: TElement, index: number, iterable: this) => TResult, initialValue?: TResult): typeof initialValue extends undefined ? TResult | undefined : TResult {
        // We have to iterate to the end anyway, so just use toArray() and use array's 
        // reduceRight instead of reimplementing.
        // We lose "this" context in the function, so save its type here.
        type Iterable = this;
        return this.toArray()
            .reduceRight<TResult>(
                function(this: Iterable, previousValue: TResult, element: TElement, index: number) {
                    return reducer(previousValue as TResult, element, index, this);
                }.bind(this), 
                initialValue as TResult
            );
    }

    /**
     * Reverses the order of the elements in the iterable as a new instance of an iterable and returns 
     * the resulting iterable.
     */
    public reverseOrder(): ExtendedIterable<TElement> {
        return new ReverseIterable(this);
    }

    /**
     * Skips the first N elements of the iterable, returning the resulting iterable.
     * @param numberToSkip The number of elements to skip.
     * @returns The resulting iterable.
     */
    public skip(numberToSkip: number): ExtendedIterable<TElement> {
        return new SkipIterable(this, numberToSkip);
    }

    /**
     * Decides whether or not any element in the iterable satisfies the given predicate.
     * @param predicate the condition that at least one element in the iterable must satisfy.
     * @returns True if at least one element in the iterable satisfies the given predicate OR the iterable is empty, false otherwise.
     */
    public some(predicate: Predicate<this, TElement>): boolean {
        let index = -1;
        // Based on set theory, the false predicate of the null set is true.
        let atLeastOneDidNotSatisfy = false;
        for (const element of this) {
            index++;
            if (predicate(element, index, this)) { return true; }
            else { atLeastOneDidNotSatisfy = true; }
        }
        return !atLeastOneDidNotSatisfy;
    }

    /**
     * Sorts an iterable. This method creates a new array and returns a reference to it.
     */
    public sort(compareFn?: (a: TElement, b: TElement) => number): TElement[] {
        // In place sorts are always faster, so just call toArray and sort
        return this.toArray()
            .sort(compareFn);
    }

    /**
     * Converts the iterable to an array.
     */
    public toArray(): TElement[] {
        const result = [];
        for(const item of this) {
            result.push(item);
        }
        return result;
    }

    /**
     * Equivalent to calling .toArray().toLocaleString()
     */
    public toLocaleString(): string {
        return this.toArray()
            .toLocaleString();
    }

    /**
     * Equivalent to calling .toArray().toString()
     */
    public toString(): string {
        return this.toArray()
            .toString();
    }

    /**
     * Returns an iterable of values in the array
     */
    public values(): IterableIterator<TElement> {
        let result: IterableIterator<TElement> = this[Symbol.iterator]() as IterableIterator<TElement>;
        result[Symbol.iterator] = (this[Symbol.iterator].bind(this) as () => IterableIterator<TElement>);
        return result;
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

type Predicate<TIterable extends Iterable<TElement> | TElement[], TElement> = 
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

class ConcatenatedIterable<TElement> extends ExtendedIterable<TElement> {
    private _first: Iterable<TElement>;
    private _second: Iterable<TElement>;

    constructor(firstIterable: Iterable<TElement>, secondIterable: Iterable<TElement>) {
        super();
        this._first = firstIterable;
        this._second = secondIterable;
    }

    [Symbol.iterator](): Iterator<TElement, undefined> {
        return new ConcatenatedIterator(this._first[Symbol.iterator](), this._second[Symbol.iterator]());
    }
}

class ConcatenatedIterator<TElement> implements Iterator<TElement, undefined> {
    private _first: Iterator<TElement>;
    private _second: Iterator<TElement>;
    private _firstIsDone: boolean = false;

    constructor(first: Iterator<TElement>, second: Iterator<TElement>) {
        this._first = first;
        this._second = second;
    }

    public next(): IteratorResult<TElement, undefined> {
        if (!this._firstIsDone) {
            let iterResult = this._first.next();
            if (!iterResult.done) {
                return iterResult;
            }
            this._firstIsDone = true;
        }

        return this._second.next();
    }
}

class FilteredIterable<TIterable extends Iterable<TElement>, TElement> extends ExtendedIterable<TElement> {
    private _predicate: Predicate<TIterable, TElement>;
    private _source: TIterable;

    constructor(source: TIterable, predicate: Predicate<TIterable, TElement>) {
        super();
        this._source = source;
        this._predicate = predicate;
    }

    [Symbol.iterator](): Iterator<TElement, undefined> {
        return new FilteredIterator(this._source, this._predicate);
    }
}

class FilteredIterator<TIterable extends Iterable<TElement>, TElement> implements Iterator<TElement, undefined> {
    private _source: TIterable;
    private _sourceIterator: Iterator<TElement>;
    private _predicate: Predicate<TIterable, TElement>;
    private _index: number = -1;

    constructor(source: TIterable, predicate: Predicate<TIterable, TElement>) {
        this._source = source;
        this._sourceIterator = source[Symbol.iterator]();
        this._predicate = predicate;
        this._index = -1;
    }

    next(): IteratorResult<TElement, undefined> {
        let iterResult = this._sourceIterator.next();
        while(!iterResult.done && !this._predicate(iterResult.value, ++this._index, this._source)) {
            iterResult = this._sourceIterator.next();
        }

        return iterResult;
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
    private _index = -1;

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
            value: this._selector(iterResult.value, ++this._index, this._sourceIterable)
        }
    }
}

class FlatIterable<TSource extends Iterable<any>> extends ExtendedIterable<TSource extends Iterable<infer TSubElement> ? TSubElement : never> {
    private _sourceIterable: Iterable<TSource>;

    constructor(source: Iterable<TSource>) {
        super();
        this._sourceIterable = source;
    }

    [Symbol.iterator]() {
        return new FlatIterator(this._sourceIterable[Symbol.iterator]()) as any as TSource extends Iterable<infer TSubElement> ? TSubElement : unknown;
    }
}

class FlatIterator<TSource> implements Iterator<TSource extends Iterable<infer TSubElement> ? TSubElement : never> {
    private _sourceIterator: Iterator<TSource>;
    private _subIterator?: Iterator<TSource extends Iterable<infer TSubElement> ? TSubElement : never>;

    constructor(source: Iterator<TSource>) {
        this._sourceIterator = source;
    }

    public next(): IteratorResult<TSource extends Iterable<infer TSubElement> ? TSubElement : never, undefined> {
        let subIterResult: undefined | IteratorResult<TSource extends Iterable<infer TSubElement> ? TSubElement : never>
        do {
            subIterResult = this._subIterator?.next();
            if (!subIterResult || subIterResult.done) {
                const sourceIterResult = this._sourceIterator.next();
                if (sourceIterResult.done) {
                    return { done: true, value: undefined };
                }
                this._subIterator = (sourceIterResult.value as Iterable<TSource extends Iterable<infer TSubElement> ? TSubElement : never>)[Symbol.iterator]() as Iterator<TSource extends Iterable<infer TSubElement> ? TSubElement : never>;
            }
        } while (!subIterResult || subIterResult.done)

        return subIterResult;
    }
}

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

class ReverseIterable<TElement> extends ExtendedIterable<TElement> {
    private _sourceIterable: Iterable<TElement>;

    constructor(sourceIterable: Iterable<TElement>) {
        super();
        this._sourceIterable = sourceIterable;
    }

    [Symbol.iterator]() {
        return new ReverseIterator(this._sourceIterable);
    }
}

class ReverseIterator<TElement> implements Iterator<TElement, undefined> {
    private _sourceIterable: Iterable<TElement>;
    private _stack?: Stack<TElement>;

    constructor(sourceIterator: Iterable<TElement>) {
        this._sourceIterable = sourceIterator;
    }

    next(): IteratorResult<TElement, undefined> {
        // In the first iteration, the stack is empty, so populate it.
        if (!this._stack) {
            this._stack = new Stack<TElement>();
            for (const element of this._sourceIterable) {
                this._stack.push(element);
            }
        }
        
        // All subsequent iterations, the stack is populated so just pop.
        let topElement = this._stack.pop();
        return { 
            done: this._stack.length === 0, 
            value: topElement 
        } as IteratorResult<TElement, undefined>;
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

export default { ExtendedIterable, Stack };