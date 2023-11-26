# TS-Collections
An collection of TypeScript classes that can be used to work with data structures in TypeScript more easily.

## Classes
### ExtendedIterable (Collections.ts)
ExtendedIterable is an abstract class that can be used to attach Array prototype-like methods onto other objects that follow the JavaScript Iteration Protocols. This protocol is part of the the ES6/ECMAScript2015 standard, so this library only supports the ES6/ECMAScript2015 standard and later. In order to add these methods, simply extend the ExtendedIterable class and implement the JavaScript Iteration Protocols on that type. This class will then attach the other array prototype-like methods to your object (ex. filter, map, reduce, some, etc.).

### Heap (Heap.ts)
This file includes 2 classes: MinHeap and MaxHeap. These can be used to implement priority queues or other Heap-based data structures.

### LinkedList (LinkedList.ts)
This is a LinkedList implementation in TypeScript. It was modeled closely after the [.Net equivalent class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1?view=net-8.0).

### TreeNode (TreeNode.ts)
TreeNode is a base class that can be implemented to gain iterators for the various tree traversal types. The only method required is getChildren(), which should handling getting the current node's children. Once this is implemented, this library take care of the implementations of Depth-First Pre-, In-, Post-Order, and Breadth-First Searches. Each of these do not handle circular-reference checking. If your "tree" contains circular references, use GraphNode.

### GraphNode (GraphNode.ts)
GraphNode is basically identical to TreeNode except its required method is getAdjacentNodes(). Its iterators for the various traversal type _do_ handle circular reference checking.