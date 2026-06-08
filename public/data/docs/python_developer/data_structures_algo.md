# Data Structures & Algorithms (Basics)

Knowing the right data structure for the job is the difference between code that scales and code that crawls. This guide covers Python's built-in structures and fundamental algorithm concepts.

---

## Python's Built-in Data Structures

### Lists

Dynamic arrays — ordered, mutable, and the most used collection.

```python
nums = [3, 1, 4, 1, 5]
nums.append(9)       # O(1) amortised
nums.insert(0, 0)    # O(n) — shifts everything
nums.sort()          # O(n log n) — Timsort
```

### Dictionaries

Hash maps providing average O(1) key lookup.

```python
user = {"name": "Alice", "age": 25}
user["email"] = "alice@example.com"   # O(1) insert
print(user.get("phone", "N/A"))      # safe access with default
```

Since Python 3.7+, dicts **preserve insertion order**.

### Sets

Unordered collections of unique elements — perfect for membership tests and deduplication.

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a & b)   # intersection: {3, 4}
print(a | b)   # union: {1, 2, 3, 4, 5, 6}
print(a - b)   # difference: {1, 2}
```

### Tuples

Immutable sequences — use as dict keys, function return values, or when data shouldn't change.

```python
point = (10, 20)
x, y = point     # unpacking
```

### Other Useful Structures

| Structure | Module | Use Case |
|---|---|---|
| `deque` | `collections` | Fast append/pop from both ends — O(1) |
| `defaultdict` | `collections` | Dict with automatic default values |
| `Counter` | `collections` | Frequency counting |
| `heapq` | `heapq` | Priority queue / min-heap |
| `namedtuple` | `collections` | Lightweight immutable records |

```python
from collections import Counter

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
freq = Counter(words)
print(freq.most_common(2))  # [('apple', 3), ('banana', 2)]
```

---

## Big O Notation

Big O describes how an algorithm's runtime or space grows as input size increases.

| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Dict lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Iterating a list |
| O(n log n) | Linearithmic | Sorting (Timsort) |
| O(n²) | Quadratic | Nested loops |

> **Rule of thumb:** If your input can reach 10⁶ elements, you need O(n log n) or better.

---

## Searching Algorithms

### Linear Search — O(n)

```python
def linear_search(arr: list, target) -> int:
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1
```

### Binary Search — O(log n)

Requires a **sorted** array.

```python
import bisect

def binary_search(arr: list, target) -> int:
    idx = bisect.bisect_left(arr, target)
    if idx < len(arr) and arr[idx] == target:
        return idx
    return -1
```

---

## Sorting Algorithms

Python's built-in `sorted()` and `list.sort()` use **Timsort** (hybrid merge + insertion sort). For interviews, understand these classics:

| Algorithm | Average | Worst | Stable? |
|---|---|---|---|
| Bubble Sort | O(n²) | O(n²) | Yes |
| Merge Sort | O(n log n) | O(n log n) | Yes |
| Quick Sort | O(n log n) | O(n²) | No |

```python
# Custom sort with key function
students = [("Alice", 85), ("Bob", 92), ("Carol", 78)]
students.sort(key=lambda s: s[1], reverse=True)
# [('Bob', 92), ('Alice', 85), ('Carol', 78)]
```

---

## Common Patterns

1. **Two pointers** — efficiently scan sorted arrays from both ends.
2. **Sliding window** — track a subarray/substring of fixed or variable size.
3. **Hash map counting** — use `dict` or `Counter` to track frequencies.
4. **Stack-based** — matching brackets, undo history, DFS.

---

## Checklist & Exercises

- [ ] Implement binary search from scratch (without `bisect`) and verify it on a sorted list of 1 000 elements.
- [ ] Use a `defaultdict(list)` to group a list of words by their first letter.
- [ ] Analyse the time complexity of your own code: pick a function you wrote recently and determine its Big O.
