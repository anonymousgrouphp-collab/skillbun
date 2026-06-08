# Automated Testing & Quality Assurance

Tests are your safety net. They let you refactor with confidence, catch regressions before users do, and serve as living documentation of how your code is supposed to behave.

---

## Why pytest?

`pytest` is the de facto testing framework for Python. It's simpler than `unittest`, more powerful, and has a massive plugin ecosystem.

```bash
pip install pytest pytest-cov
pytest                    # run all tests
pytest -v                 # verbose output
pytest -x                 # stop on first failure
pytest --cov=src          # with coverage report
```

---

## Writing Your First Test

```python
# src/calculator.py
def add(a: int, b: int) -> int:
    return a + b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```python
# tests/test_calculator.py
import pytest
from src.calculator import add, divide

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

def test_divide_normal():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
```

---

## Fixtures — Reusable Test Setup

Fixtures provide test dependencies cleanly and support setup/teardown.

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine)
    yield session          # test runs here
    session.rollback()     # teardown
    session.close()

def test_create_user(db_session):
    user = User(name="Alice", email="alice@test.com")
    db_session.add(user)
    db_session.commit()
    assert db_session.query(User).count() == 1
```

Use `conftest.py` to share fixtures across multiple test files.

---

## Mocking External Dependencies

Never let tests hit real APIs, databases, or file systems in unit tests.

```python
from unittest.mock import patch, MagicMock

def test_send_notification():
    with patch("src.notifier.smtp_client") as mock_smtp:
        mock_smtp.send.return_value = True
        result = send_notification("alice@test.com", "Hello")
        assert result is True
        mock_smtp.send.assert_called_once()
```

### When to Mock vs When Not To

- **Mock:** third-party APIs, email, payment gateways, system clock.
- **Don't mock:** your own business logic, data transformations, pure functions.

---

## Test Types

### Unit Tests

Test individual functions or methods in isolation. Fast, focused, numerous.

### Integration Tests

Test multiple components working together — typically with a real (test) database.

```python
from fastapi.testclient import TestClient

def test_create_and_get_user(client: TestClient):
    resp = client.post("/users", json={"name": "Alice", "email": "a@b.com"})
    assert resp.status_code == 201
    user_id = resp.json()["id"]

    resp = client.get(f"/users/{user_id}")
    assert resp.json()["name"] == "Alice"
```

### End-to-End Tests

Test the full application from the outside — API calls, database changes, side effects. Run these sparingly.

---

## Test Coverage

Coverage measures which lines of code your tests execute.

```bash
pytest --cov=src --cov-report=html
# Open htmlcov/index.html to see a visual report
```

> **Target 80%+ coverage** for critical business logic. 100% coverage doesn't mean zero bugs — but low coverage almost guarantees hidden ones.

---

## Test-Driven Development (TDD)

The TDD cycle:

1. **Red** — Write a failing test for the feature you want.
2. **Green** — Write the minimum code to make the test pass.
3. **Refactor** — Clean up without breaking tests.

TDD forces you to think about the **interface** before the **implementation**.

---

## Parametrised Tests

```python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, 1, 0),
    (0, 0, 0),
    (100, 200, 300),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected
```

One test function, many cases — reduces boilerplate dramatically.

---

## Checklist & Exercises

- [ ] Write unit tests for an existing module achieving at least 80% coverage, then generate an HTML coverage report.
- [ ] Create a `conftest.py` with a database fixture and use it across three test files.
- [ ] Practice TDD: write tests first for a `PasswordValidator` class, then implement it to make all tests green.
