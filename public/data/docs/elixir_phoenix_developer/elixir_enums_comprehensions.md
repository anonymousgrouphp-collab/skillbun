# Elixir: Enum Module & Comprehensions

## Introduction

Elixir provides powerful tools for working with collections of data. The `Enum` module offers a rich set of functions for iterating, transforming, and filtering enumerables, while comprehensions provide a concise and expressive syntax for generating new lists or maps from existing ones. Mastering these concepts is fundamental for writing idiomatic and efficient Elixir code.

## The `Enum` Module

The `Enum` module is a cornerstone for functional programming in Elixir. It provides a consistent API for working with any enumerable data type, including lists, maps, ranges, and streams. `Enum` functions are pure, meaning they do not mutate the original collection but instead return a new one.

### Key `Enum` Functions:

*   **`Enum.map/2`**: Transforms each element in an enumerable.
    ```elixir
    # Example: Double each number in a list
    numbers = [1, 2, 3]
    doubled_numbers = Enum.map(numbers, fn n -> n * 2 end)
    #=> [2, 4, 6]
    ```
*   **`Enum.filter/2`**: Selects elements that satisfy a given predicate.
    ```elixir
    # Example: Keep only even numbers
    numbers = [1, 2, 3, 4, 5]
    even_numbers = Enum.filter(numbers, fn n -> rem(n, 2) == 0 end)
    #=> [2, 4]
    ```
*   **`Enum.reduce/3`**: Consolidates an enumerable into a single value. It takes an accumulator and applies a function to each element.
    ```elixir
    # Example: Sum all numbers
    numbers = [1, 2, 3, 4]
    sum = Enum.reduce(numbers, 0, fn n, acc -> n + acc end)
    #=> 10

    # Example: Concatenate strings
    words = ["hello", " ", "world"]
    sentence = Enum.reduce(words, "", fn word, acc -> acc <> word end)
    #=> "hello world"
    ```
*   **`Enum.each/2`**: Iterates over an enumerable for side effects (e.g., printing). It returns `:ok`.
    ```elixir
    # Example: Print each number
    Enum.each([1, 2, 3], fn n -> IO.puts("Number: #{n}") end)
    # Prints:
    # Number: 1
    # Number: 2
    # Number: 3
    #=> :ok
    ```
*   **`Enum.sort/1`, `Enum.sort/2`**: Sorts the elements.
    ```elixir
    # Example: Sort a list of numbers
    unsorted = [3, 1, 4, 2]
    sorted = Enum.sort(unsorted)
    #=> [1, 2, 3, 4]
    ```
*   **`Enum.group_by/2`**: Groups elements into a map based on a key function.
    ```elixir
    # Example: Group people by their first letter
    people = ["Alice", "Bob", "Anna", "Charlie"]
    grouped = Enum.group_by(people, fn name -> String.first(name) end)
    #=> %{"A" => ["Alice", "Anna"], "B" => ["Bob"], "C" => ["Charlie"]}
    ```

## Comprehensions

Comprehensions provide a powerful and concise syntax for constructing new lists or maps. They are especially useful for transformations and filtering, offering a more readable alternative to chained `Enum` functions in some scenarios.

The basic syntax for a comprehension is `for generator, filter do expression end`.

### List Comprehensions

By default, comprehensions create lists.

```elixir
# Example: Double even numbers from 1 to 10
doubled_evens = for n <- 1..10, rem(n, 2) == 0 do
  n * 2
end
#=> [4, 8, 12, 16, 20]

# Example: Generate a list of tuples with name and its length
names = ["Alice", "Bob", "Charlie"]
name_lengths = for name <- names do
  {name, String.length(name)}
end
#=> [{ "Alice", 5}, { "Bob", 3}, { "Charlie", 7}]
```

### Map Comprehensions

To create a map, you use the `into: %{}` option within the comprehension. The `do` block must return `{:ok, key, value}` or `{key, value}`.

```elixir
# Example: Square the values of a map
data = %{a: 1, b: 2, c: 3}
squared_values = for {key, value} <- data, into: %{} do
  {key, value * value}
end
#=> %{a: 1, b: 4, c: 9}

# Example: Filter map entries
scores = %{john: 85, jane: 92, doe: 78}
high_scores = for {name, score} <- scores, score >= 90, into: %{} do
  {name, score}
end
#=> %{jane: 92}
```

### Generators and Filters

*   **Generators**: `pattern <- enumerable` defines how elements are taken from the source. You can have multiple generators.
*   **Filters**: `expression` (a boolean condition) allows you to include or exclude elements. You can have multiple filters.

```elixir
# Example: Nested comprehensions (finding combinations)
combinations = for x <- 1..2, y <- ["a", "b"] do
  {x, y}
end
#=> [{1, "a"}, {1, "b"}, {2, "a"}, {2, "b"}]

# Example with multiple filters
filtered_numbers = for n <- 1..20, rem(n, 2) == 0, n > 10 do
  n
end
#=> [12, 14, 16, 18, 20]
```

## When to use `Enum` vs. Comprehensions?

*   **`Enum` module**: Generally preferred for simple transformations, filtering, reductions, and when you need to chain multiple operations clearly. It's highly readable for standard collection operations.
*   **Comprehensions**: Excellent for generating new collections with more complex logic involving multiple generators, filters, or when the structure of the output is significantly different from the input. Often more concise for many-to-many or one-to-many transformations.

## Checklist / Exercise

1.  Given a list of words `["apple", "banana", "kiwi", "grape"]`, use `Enum.map/2` to return a new list containing the length of each word.
2.  Use a list comprehension to generate a list of all numbers from 1 to 20 that are divisible by both 3 and 5.
3.  Given a map `users = %{"Alice": 30, "Bob": 25, "Charlie": 35}`, use a map comprehension to create a new map containing only users whose age is greater than 30.