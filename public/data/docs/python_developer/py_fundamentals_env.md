# Python Fundamentals & Development Environment

Getting started with Python means building two things at once: a solid understanding of the language itself **and** a professional workspace that keeps your projects clean, reproducible, and easy to share.

---

## Why Python?

Python consistently ranks among the top programming languages for a reason:

- **Readable syntax** — code reads almost like English, lowering the barrier for beginners.
- **Massive ecosystem** — PyPI hosts over 500 000 packages for web, data, AI, automation, and more.
- **Cross-domain versatility** — the same language works for scripting, backend APIs, data science, and DevOps tooling.

```python
# Your very first Python program
print("Hello, SkillBun learner! 🐰")
```

---

## Core Areas to Cover

### 1. Language Basics

| Concept | Why It Matters |
|---|---|
| Variables & Data Types | Foundation for every program |
| Control Flow (`if`, `for`, `while`) | Decision-making and iteration |
| Functions & Modules | Reusability and organisation |
| Error Handling (`try/except`) | Writing resilient code |
| File I/O | Reading configs, logs, data files |

### 2. Advanced Language Features

Once you are comfortable with the basics, move into features that distinguish proficient developers:

- **List / dict / set comprehensions** — concise, Pythonic data transformations.
- **Generators & iterators** — memory-efficient lazy evaluation.
- **Decorators** — elegant function wrapping for logging, auth, caching.
- **Context managers** (`with` statement) — safe resource cleanup.
- **Type hints** — catch bugs early and improve editor support.
- **Async / await** — non-blocking I/O for high-concurrency services.

### 3. Development Environment

A professional setup includes:

| Tool | Purpose |
|---|---|
| `venv` / `conda` | Isolate project dependencies |
| `pip` / `Poetry` | Install and lock packages |
| `Black` | Auto-format code consistently |
| `Flake8` / `Ruff` | Lint for style and logical errors |
| `Mypy` | Static type checking |
| `Git` + GitHub | Version control and collaboration |

```bash
# Quick project bootstrap
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install --upgrade pip
pip install black flake8 mypy
```

### 4. Data Structures & Algorithms Primer

Understanding how Python's built-in data structures work under the hood helps you write efficient code:

- **Lists** — dynamic arrays, O(1) append, O(n) insert at front.
- **Dicts** — hash maps, O(1) average lookup.
- **Sets** — unique elements, fast membership tests.
- **Tuples** — immutable sequences, great as dict keys.

Learn Big O basics so you can reason about performance before your code reaches production.

---

## Study Path Recommendation

1. Start with the official **Python Tutorial** (docs.python.org).
2. Practice daily on small scripts — automate something you do manually.
3. Set up your IDE (VS Code + Python extension is a great default).
4. Read PEP 8 and configure `Black` so formatting is automatic.
5. Build at least one small CLI project before moving to web development.

---

## Checklist & Exercises

- [ ] Write a script that reads a CSV file, filters rows by a condition, and writes the result to a new file.
- [ ] Set up a new project with `venv`, install three packages, and freeze them to `requirements.txt`.
- [ ] Explain the difference between a list comprehension and a generator expression, and when you would choose each.
