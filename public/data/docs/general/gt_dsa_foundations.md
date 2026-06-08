# Data Structures and Algorithms Foundations

Welcome to the foundational module on Data Structures and Algorithms (DSA)! This topic is crucial for any aspiring software developer, as it underpins efficient problem-solving and scalable software design. Understanding DSA allows you to write optimized code that performs well under various conditions.

## 1. Introduction to Data Structures and Algorithms

*   **Data Structure:** A particular way of organizing data in a computer so that it can be accessed and modified efficiently. It's about storing data in a specific layout.
*   **Algorithm:** A set of well-defined instructions to solve a particular problem or perform a specific task. It's about the steps taken to process data.

## 2. Big O Notation: Complexity Analysis

Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. In DSA, it's used to classify algorithms according to how their running time or space requirements grow as the input size grows.

*   **Time Complexity:** Measures the amount of time an algorithm takes to run as a function of the input size (n).
*   **Space Complexity:** Measures the amount of memory an algorithm uses as a function of the input size (n).

**Common Time Complexities:**
*   **O(1) - Constant Time:** The operation takes a constant amount of time, regardless of the input size (e.g., accessing an array element by index).
*   **O(log n) - Logarithmic Time:** The time taken grows logarithmically with the input size (e.g., binary search).
*   **O(n) - Linear Time:** The time taken grows directly proportional to the input size (e.g., linear search).
*   **O(n log n) - Linearithmic Time:** Often seen in efficient sorting algorithms (e.g., merge sort, quick sort).
*   **O(n²) - Quadratic Time:** The time taken grows quadratically with the input size (e.g., nested loops, bubble sort).
*   **O(2^n) - Exponential Time:** The time taken grows exponentially with the input size (e.g., solving the traveling salesman problem via brute force).
*   **O(n!) - Factorial Time:** The time taken grows factorially, extremely inefficient (e.g., permutations).

## 3. Fundamental Data Structures

### 3.1 Arrays
*   **Concept:** A collection of items stored at contiguous memory locations. Each item can be accessed using an index.
*   **Characteristics:** Fixed-size (in many languages), random access (O(1)).
*   **Operations:** Access (O(1)), Insertion/Deletion at end (O(1)), Insertion/Deletion at beginning/middle (O(n) due to shifting).
*   **Pros:** Fast access, cache-friendly.
*   **Cons:** Fixed size, expensive insertions/deletions in the middle.

### 3.2 Linked Lists
*   **Concept:** A linear collection of data elements called *nodes*, where each node points to the next node in the sequence. Nodes are not stored at contiguous memory locations.
*   **Types:**
    *   **Singly Linked List:** Each node has data and a pointer to the next node.
    *   **Doubly Linked List:** Each node has data, a pointer to the next node, and a pointer to the previous node.
    *   **Circular Linked List:** The last node points back to the first node.
*   **Operations:** Insertion/Deletion (O(1) once position found, O(n) to find position), Access (O(n)).
*   **Pros:** Dynamic size, efficient insertions/deletions.
*   **Cons:** No random access, extra memory for pointers.

### 3.3 Stacks
*   **Concept:** A linear data structure that follows the **LIFO (Last-In, First-Out)** principle.
*   **Analogy:** A stack of plates.
*   **Operations:**
    *   `push(item)`: Adds an item to the top of the stack.
    *   `pop()`: Removes and returns the top item from the stack.
    *   `peek()`: Returns the top item without removing it.
    *   `isEmpty()`: Checks if the stack is empty.
*   **Applications:** Function call stack, undo/redo features, browser history.

### 3.4 Queues
*   **Concept:** A linear data structure that follows the **FIFO (First-In, First-Out)** principle.
*   **Analogy:** A line of people waiting.
*   **Operations:**
    *   `enqueue(item)`: Adds an item to the rear of the queue.
    *   `dequeue()`: Removes and returns the front item from the queue.
    *   `peek()`: Returns the front item without removing it.
    *   `isEmpty()`: Checks if the queue is empty.
*   **Applications:** Task scheduling, breadth-first search, printer queues.

### 3.5 Hash Maps (Hash Tables / Dictionaries)
*   **Concept:** A data structure that stores key-value pairs. It uses a *hash function* to compute an index into an array of buckets or slots, from which the desired value can be found.
*   **Hashing:** The process of converting a key into an index.
*   **Collision Resolution:** Methods to handle different keys hashing to the same index (e.g., chaining, open addressing).
*   **Operations:** Insertion, Deletion, Search (average O(1), worst-case O(n) if many collisions).
*   **Pros:** Very fast lookups, insertions, and deletions on average.
*   **Cons:** Worst-case performance can be O(n), memory overhead, sensitive to hash function quality.

### 3.6 Trees
*   **Concept:** A hierarchical data structure consisting of nodes connected by edges. It simulates a tree structure with a root value and subtrees of children.
*   **Terminology:** Root (top-most node), Child (a node directly connected to another node one level below it), Parent (the converse), Sibling (nodes with the same parent), Leaf (node with no children), Edge (connection between nodes).
*   **Binary Tree:** Each node has at most two children, typically referred to as left and right children.
*   **Applications:** File systems, databases (B-trees), abstract syntax trees.

## 4. Basic Algorithms

### 4.1 Searching Algorithms

#### 4.1.1 Linear Search
*   **Concept:** Sequentially checks each element of the list until a match is found or the end of the list is reached.
*   **Time Complexity:** O(n) in worst and average cases, O(1) in best case (first element is target).
*   **Prerequisites:** None (works on unsorted data).

#### 4.1.2 Binary Search
*   **Concept:** An efficient algorithm for finding an item from a *sorted* list of items. It repeatedly divides the search interval in half.
*   **How it works:** Start with the middle element. If it's the target, return. If the target is smaller, search the left half. If larger, search the right half. Repeat until target is found or interval is empty.
*   **Time Complexity:** O(log n).
*   **Prerequisites:** The data must be sorted.

### 4.2 Sorting Algorithms

#### 4.2.1 Bubble Sort
*   **Concept:** Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Passes through the list are repeated until no swaps are needed, which indicates that the list is sorted.
*   **Time Complexity:** O(n²) in worst and average cases, O(n) in best case (already sorted).
*   **Stability:** Stable.
*   **Use Case:** Educational, rarely used in practice for large datasets due to inefficiency.

#### 4.2.2 Selection Sort
*   **Concept:** Divides the list into two parts: a sorted part and an unsorted part. It repeatedly finds the minimum element from the unsorted part and puts it at the beginning of the sorted part.
*   **How it works:** Find the minimum element in the unsorted array and swap it with the element at the beginning of the unsorted array.
*   **Time Complexity:** O(n²) in all cases (best, average, worst).
*   **Stability:** Unstable.
*   **Use Case:** Small lists, or when memory writes are costly (minimal swaps).

#### 4.2.3 Insertion Sort
*   **Concept:** Builds the final sorted array (or list) one item at a time. It iterates through the input elements and, for each element, finds the position within the sorted part of the array and inserts it there.
*   **How it works:** Assume the first element is sorted. Take the next element and insert it into the correct position within the already sorted part by shifting larger elements.
*   **Time Complexity:** O(n²) in worst and average cases, O(n) in best case (already sorted).
*   **Stability:** Stable.
*   **Use Case:** Small lists, or nearly sorted lists.

## 5. Code Example: Binary Search (Python)

```python
def binary_search(arr, target):
    """
    Performs binary search on a sorted array.
    Args:
        arr (list): A sorted list of numbers.
        target (int): The number to search for.
    Returns:
        int: The index of the target if found, otherwise -1.
    """
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2  # Calculate middle index
        if arr[mid] == target:
            return mid  # Target found
        elif arr[mid] < target:
            low = mid + 1  # Target is in the right half
        else:
            high = mid - 1 # Target is in the left half
    return -1 # Target not found

# Example Usage:
sorted_numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(f"Index of 12: {binary_search(sorted_numbers, 12)}")
print(f"Index of 72: {binary_search(sorted_numbers, 72)}")
print(f"Index of 30: {binary_search(sorted_numbers, 30)}")
```

## 6. Quick Understanding Checklist/Exercise

1.  Explain the key difference between a Stack and a Queue in terms of how elements are added and removed.
2.  What is the primary advantage of using Binary Search over Linear Search, and what prerequisite must be met for Binary Search to work?
3.  Describe a real-world scenario where a Hash Map (Hash Table) would be a more efficient data structure choice than an Array for storing and retrieving data.