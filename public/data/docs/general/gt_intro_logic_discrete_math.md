# Introduction to Logic and Discrete Mathematics

This study guide introduces the foundational concepts of logic and discrete mathematics, crucial pillars for understanding computer science and computational thinking. Discrete mathematics deals with discrete objects (countable sets), unlike continuous mathematics (calculus) which deals with continuous structures. Logic provides the formal system for reasoning and problem-solving.

## 1. Core Concepts: Logic and Discrete Mathematics

*   **Discrete Mathematics**: The study of mathematical structures that are fundamentally discrete rather than continuous. It encompasses a wide range of topics including logic, set theory, graph theory, combinatorics, and algorithms. It's the language of computing, enabling us to model problems, design algorithms, and prove their correctness.
*   **Logic**: The formal study of reasoning. It provides tools to analyze and construct arguments, determine their validity, and establish truth. In computer science, logic is used in circuit design, database queries, AI, and software verification.

## 2. Foundational Logical Reasoning (Propositional Logic)

Propositional logic is the branch of logic that deals with propositions.

*   **Proposition**: A declarative sentence that is either true or false, but not both.
    *   *Examples*: "The sky is blue." (True), "2 + 2 = 5." (False).
    *   *Non-examples*: "What time is it?" (Question), "Go to bed." (Command).
*   **Truth Values**: The truthfulness or falsehood of a proposition, denoted as `True` (T) or `False` (F).
*   **Logical Connectives**: Operators used to combine propositions and form compound propositions.

    *   **Negation (NOT)**: `¬p` (or `!p`). "It is not the case that p."
        | p | ¬p |
        |---|----|
        | T | F  |
        | F | T  |
    *   **Conjunction (AND)**: `p ∧ q` (or `p && q`). "p and q." True only if both p and q are true.
        | p | q | p ∧ q |
        |---|---|-------|
        | T | T | T     |
        | T | F | F     |
        | F | T | F     |
        | F | F | F     |
    *   **Disjunction (OR)**: `p ∨ q` (or `p || q`). "p or q." True if at least one of p or q is true.
        | p | q | p ∨ q |
        |---|---|-------|
        | T | T | T     |
        | T | F | T     |
        | F | T | T     |
        | F | F | F     |
    *   **Implication (IF-THEN)**: `p → q`. "If p, then q." or "p implies q." False only if p is true and q is false.
        | p | q | p → q |
        |---|---|-------|
        | T | T | T     |
        | T | F | F     |
        | F | T | T     |
        | F | F | T     |
    *   **Biconditional (IF AND ONLY IF)**: `p ↔ q`. "p if and only if q." True if p and q have the same truth value.
        | p | q | p ↔ q |
        |---|---|-------|
        | T | T | T     |
        | T | F | F     |
        | F | T | F     |
        | F | F | T     |

*   **Truth Tables**: Tables that show the truth value of a compound proposition for all possible truth values of its constituent propositions.
*   **Tautology**: A compound proposition that is always true, regardless of the truth values of its simple propositions (e.g., `p ∨ ¬p`).
*   **Contradiction**: A compound proposition that is always false (e.g., `p ∧ ¬p`).
*   **Contingency**: A compound proposition that is neither a tautology nor a contradiction.

### Example: Python Boolean Logic

Python's boolean operators `and`, `or`, `not` directly map to logical connectives.

```python
# Assuming p = True and q = False
p = True
q = False

print(f"NOT p: {not p}")       # Output: False
print(f"p AND q: {p and q}")   # Output: False
print(f"p OR q: {p or q}")     # Output: True

# Implication (p -> q) can be expressed as (not p) or q
print(f"p IMPLIES q: {(not p) or q}") # Output: False (If True, then False is False)

# Biconditional (p <-> q) can be expressed as (p and q) or (not p and not q)
print(f"p IFF q: {(p and q) or (not p and not q)}") # Output: False
```

## 3. Sets

A**set** is a well-defined collection of distinct objects, called **elements** or **members**.

*   **Notation**: Sets are usually denoted by capital letters and elements enclosed in curly braces `{}`.
    *   *Roster Method*: Listing all elements, e.g., `A = {1, 2, 3, 4}`.
    *   *Set-Builder Notation*: Describing properties of elements, e.g., `B = {x | x is an even integer and 1 < x < 10}`.
*   **Common Sets**:
    *   `N` (Natural Numbers): `{0, 1, 2, 3, ...}` or `{1, 2, 3, ...}` (convention varies).
    *   `Z` (Integers): `{..., -2, -1, 0, 1, 2, ...}`.
    *   `Q` (Rational Numbers): Numbers that can be expressed as `p/q` where `p, q ∈ Z` and `q ≠ 0`.
    *   `R` (Real Numbers): All rational and irrational numbers.
*   **Cardinality**: The number of distinct elements in a set, denoted `|A|`. E.g., `|{a, b, c}| = 3`.
*   **Subsets**: `A ⊆ B` means every element of A is also an element of B. `A ⊂ B` means A is a proper subset of B (A is a subset of B, and A ≠ B).
*   **Set Operations**:
    *   **Union (`∪`)**: `A ∪ B = {x | x ∈ A or x ∈ B}`. Elements in A, or B, or both.
    *   **Intersection (`∩`)**: `A ∩ B = {x | x ∈ A and x ∈ B}`. Elements common to both A and B.
    *   **Difference (`-` or `\`)**: `A - B = {x | x ∈ A and x ∉ B}`. Elements in A but not in B.
    *   **Complement (`A'` or `Aᶜ`)**: All elements in the universal set `U` that are not in `A`. `Aᶜ = U - A`.

## 4. Basic Counting Principles

Counting principles help determine the number of possible outcomes for events without explicitly listing them.

*   **The Product Rule (Multiplication Principle)**: If a procedure can be broken down into a sequence of two tasks, and there are `n1` ways to do the first task and `n2` ways to do the second task, then there are `n1 * n2` ways to do the procedure.
    *   *Example*: A student can choose a shirt in 3 colors and pants in 2 styles. Total outfits: `3 * 2 = 6`.
*   **The Sum Rule (Addition Principle)**: If a task can be done either in one of `n1` ways or in one of `n2` ways, where none of the `n1` ways is the same as any of the `n2` ways, then there are `n1 + n2` ways to do the task.
    *   *Example*: A cafe offers 5 coffee options and 3 tea options. Total drink options: `5 + 3 = 8`.
*   **Factorials**: `n!` (read "n factorial") is the product of all positive integers less than or equal to `n`. `n! = n * (n-1) * ... * 2 * 1`. `0! = 1`.
    *   *Example*: `4! = 4 * 3 * 2 * 1 = 24`.
*   **Permutations**: An arrangement of items in a specific order. The number of permutations of `n` distinct items taken `r` at a time is `P(n, r) = n! / (n-r)!`.
*   **Combinations**: A selection of items where the order does not matter. The number of combinations of `n` distinct items taken `r` at a time is `C(n, r) = n! / (r! * (n-r)!)`.

## 5. Overview of Algorithmic Thinking

**Algorithmic thinking** is the ability to define clear, step-by-step instructions to solve problems. An **algorithm** is a finite sequence of well-defined, computer-implementable instructions, typically used to solve a class of specific problems or to perform a computation.

*   **Key Characteristics of an Algorithm**:
    *   **Input**: Zero or more quantities externally supplied.
    *   **Output**: At least one quantity produced.
    *   **Definiteness**: Each step must be precisely defined.
    *   **Finiteness**: The algorithm must terminate after a finite number of steps.
    *   **Effectiveness**: Each step must be sufficiently basic to be executable.

### Example: Algorithm to Find the Maximum Number in a List

Here's a simple algorithm in pseudocode to find the largest element in a list of numbers:

```
Algorithm FindMaximum(List):
  Input: A list of numbers, 'List'.
  Output: The maximum number in 'List'.

  1. If 'List' is empty, return an error or handle appropriately.
  2. Initialize 'max_value' to the first element of 'List'.
  3. For each 'element' in 'List' (starting from the second element):
      a. If 'element' is greater than 'max_value':
          i. Set 'max_value' = 'element'.
  4. Return 'max_value'.
```

### Quick Understanding Checklist/Exercise:

1.  **Propositional Logic**: Is the statement "If it rains, then the ground is wet, and the ground is not wet, therefore it does not rain" a tautology, contradiction, or contingency? (Hint: This is a form of Modus Tollens).
2.  **Sets**: Given `A = {1, 2, 3}` and `B = {3, 4, 5}`, what are `A ∪ B` and `A ∩ B`?
3.  **Counting Principles**: How many different 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 if repetition of digits is allowed? How many if repetition is not allowed?
