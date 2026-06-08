# Python Core Language & Paradigms

This guide covers the full depth of the Python language — from foundational syntax to advanced patterns that separate beginners from confident developers.

---

## Data Types & Variables

Python is dynamically typed, but understanding types is still critical.

```python
name: str = "SkillBun"          # string
age: int = 2                     # integer
ratio: float = 3.14             # float
active: bool = True             # boolean
tags: list[str] = ["python"]    # list
config: dict[str, int] = {"timeout": 30}  # dict
```

> **Tip:** Use type hints from the start — they improve editor autocomplete, catch bugs via `mypy`, and serve as inline documentation.

---

## Control Flow

```python
# Pattern matching (Python 3.10+)
match status_code:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case _:
        print("Unhandled")
```

Classic `if/elif/else`, `for`, and `while` remain your bread and butter, but structural pattern matching is increasingly common in modern codebases.

---

## Functions & Scope

```python
def greet(name: str, *, excited: bool = False) -> str:
    """Return a greeting. `excited` is keyword-only."""
    suffix = "!!!" if excited else "."
    return f"Hello, {name}{suffix}"
```

Key concepts: **positional vs keyword arguments**, `*args` / `**kwargs`, closures, and the LEGB scope rule (Local → Enclosing → Global → Built-in).

---

## Object-Oriented Programming

```python
from dataclasses import dataclass

@dataclass
class Student:
    name: str
    score: int = 0

    def passed(self) -> bool:
        return self.score >= 70
```

Understand **inheritance**, **composition over inheritance**, **dunder methods** (`__repr__`, `__eq__`, `__hash__`), and when to use `dataclass` vs regular classes.

---

## Iterators & Generators

Generators let you process large datasets without loading everything into memory.

```python
def fibonacci(limit: int):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

for num in fibonacci(1000):
    print(num)
```

---

## Decorators

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def heavy_computation():
    return sum(range(10_000_000))
```

---

## Context Managers

```python
from contextlib import contextmanager

@contextmanager
def open_db(dsn: str):
    conn = connect(dsn)
    try:
        yield conn
    finally:
        conn.close()
```

Use context managers for anything that needs **guaranteed cleanup**: files, DB connections, locks, temp directories.

---

## Async / Await

```python
import asyncio
import httpx

async def fetch(url: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        return resp.text

asyncio.run(fetch("https://example.com"))
```

Async is essential for I/O-bound services (web APIs, scrapers, chat bots). Avoid mixing blocking calls inside `async` functions.

---

## Error Handling Best Practices

```python
try:
    value = int(user_input)
except ValueError as exc:
    logger.warning("Invalid input: %s", exc)
    value = 0
else:
    logger.info("Parsed successfully: %d", value)
finally:
    cleanup()
```

- Catch **specific** exceptions, never bare `except:`.
- Use custom exception classes for domain errors.
- Log the exception context — don't swallow errors silently.

---

## Checklist & Exercises

- [ ] Implement a decorator `@retry(max_attempts=3)` that retries a function on exception.
- [ ] Write a generator that yields prime numbers up to `n`, then consume it with a list comprehension to collect primes under 100.
- [ ] Create a `BankAccount` dataclass with deposit/withdraw methods and proper error handling for insufficient funds.
