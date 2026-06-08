# Development Environment & Tooling

A professional Python development environment is the foundation of productive, consistent work. This guide walks through every essential tool and why it matters.

---

## Virtual Environments

**Never install project packages globally.** Virtual environments isolate dependencies per project.

```bash
# Built-in venv (recommended starting point)
python -m venv .venv
source .venv/bin/activate        # Linux / macOS
.venv\Scripts\activate           # Windows

# Verify isolation
which python   # should point to .venv/bin/python
pip list       # should be nearly empty
```

### Alternatives

| Tool | Best For |
|---|---|
| `venv` | Simple, built-in, zero install |
| `conda` | Data-science stacks with non-Python deps |
| `virtualenv` | Legacy compat, faster creation |

---

## Package Management

### pip + requirements.txt

```bash
pip install fastapi uvicorn
pip freeze > requirements.txt
pip install -r requirements.txt
```

### Poetry (modern alternative)

Poetry gives you **lockfiles**, **dependency resolution**, and **project metadata** in one tool.

```bash
poetry init
poetry add fastapi uvicorn
poetry add --group dev pytest black mypy
poetry install          # reproducible install from lock file
poetry run pytest       # run inside the managed env
```

Key files: `pyproject.toml` (config) and `poetry.lock` (exact versions).

### pip-tools

A lighter alternative to Poetry — great for teams that want lockfiles without changing workflows:

```bash
pip install pip-tools
echo "fastapi\nuvicorn" > requirements.in
pip-compile requirements.in    # generates requirements.txt with pinned versions
pip-sync requirements.txt      # installs exactly what's listed
```

---

## Code Formatting — Black

Black is an **opinionated** formatter: it makes style decisions for you so the team never argues about formatting.

```bash
pip install black
black .             # format everything
black --check .     # CI-friendly: fail if unformatted
```

Add to `pyproject.toml`:

```toml
[tool.black]
line-length = 88
target-version = ["py312"]
```

---

## Linting — Flake8 & Ruff

```bash
pip install flake8
flake8 src/

# Or use Ruff (much faster, replaces Flake8 + isort + more)
pip install ruff
ruff check src/
ruff check --fix src/    # auto-fix safe issues
```

---

## Static Type Checking — Mypy

```bash
pip install mypy
mypy src/ --strict
```

Catches type mismatches **before** runtime. Pair with type hints in your code for maximum benefit.

---

## Version Control — Git & GitHub

Essential commands every Python dev needs:

```bash
git init
git add .
git commit -m "Initial commit"
git branch feature/auth
git checkout feature/auth
git push -u origin feature/auth
```

### .gitignore for Python

```gitignore
__pycache__/
*.pyc
.venv/
.env
dist/
*.egg-info/
.mypy_cache/
.pytest_cache/
```

---

## Project Structure

A clean layout makes your project navigable and packageable:

```
my-project/
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── main.py
│       └── utils.py
├── tests/
│   ├── __init__.py
│   └── test_utils.py
├── pyproject.toml
├── README.md
└── .gitignore
```

The `src` layout prevents accidental imports from the working directory and is recommended by the Python Packaging Authority.

---

## IDE Setup (VS Code)

Recommended extensions:

- **Python** (Microsoft) — IntelliSense, debugging, Jupyter
- **Pylance** — fast type checking and autocomplete
- **Ruff** — inline lint warnings
- **GitLens** — rich Git history in-editor

Add a `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "editor.formatOnSave": true,
  "python.formatting.provider": "black"
}
```

---

## Checklist & Exercises

- [ ] Create a new project with Poetry, add `requests` as a dependency and `pytest` as a dev dependency, then verify the lockfile was generated.
- [ ] Configure `Black`, `Ruff`, and `Mypy` in a single `pyproject.toml` and run all three on a sample file.
- [ ] Write a `.gitignore` from scratch for a Python project and explain why each entry is there.
