# Contributing to MicroUIKit

Thank you for considering contributing to MicroUIKit! 
By following these guidelines, you help keep the project organized, readable, and easy to maintain.

---

## 1. Git Workflow

We use **GitFlow** for branch management:

- `master` → production-ready code
- `develop` → main development branch
- `feature/*` → feature branches (branch off `develop`)
- `hotfix/*` → urgent fixes (branch off `master`)
- `release/*` → prepare releases

**Merge rule:** `feature/*`, `hotfix/*`, and `release/*` must be merged into `develop`.
Only `develop` is merged into `master` via Merge Request.

For the full step-by-step workflow (development, release, CI), see **[WORKFLOW.md](WORKFLOW.md)**.

---

## 2. Commit Message Guidelines
 
To keep our project history clear and maintainable, we follow **Conventional Commits**.


### Commit Message Structure

- **type** (required): what kind of change this is  
- **scope** (optional): area of the project affected (e.g., core, api, auth)  
- **short summary** (required): brief description (max 100 chars, present tense)  
- **body** (optional): detailed explanation of the change  
- **footer** (optional): references issues or breaking changes  

---

### Types

| Type      | Use Case                                  |
|-----------|-------------------------------------------|
| feat      | New feature                               |
| fix       | Bug fix                                   |
| docs      | Documentation changes                     |
| style     | Formatting, whitespace, no code change    |
| refactor  | Code restructuring, no behavior change    |
| perf      | Performance improvements                  |
| test      | Adding or fixing tests                    |

---

### Examples

```text
feat(core): implement initial structure
fix(auth): correct password hash check
docs(api): update endpoint usage examples
refactor(core): simplify key storage logic
style(ui): adjust form layout and spacing
test(core): add unit tests for key operations
```
