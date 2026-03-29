# Development Workflow

This document describes the GitFlow-based development workflow.
Development is managed by the **DokuDesk team**.

---

## Branch Strategy

| Branch    | Purpose |
| --------- | ------- |
| `develop` | Main integration branch for ongoing development work. |
| `master`  | Production-ready branch. **Direct push is not allowed**; updates happen only via Merge Request with a passing pipeline. |
| `feature/*` | Feature branches created from `develop` and merged back into `develop`. |
| `release/*` | Release preparation branches created from `develop`; merged into `master` for release, then back-merged into `develop`. |
| `hotfix/*` | Urgent production fix branches created from `master`; merged into `master`, then back-merged into `develop`. |

**Merge rule (GitFlow):**
- `feature/*` branches merge into `develop`.
- `release/*` branches merge into `master` for release, then back-merge into `develop`.
- `hotfix/*` branches merge into `master` for urgent production fixes, then back-merge into `develop`.


---

## Part 1: Development Workflow

### 1.1 Clone and setup

```bash
git clone https://<source-repository>/dokudesk/microuikit.git
cd microuikit
npm install
```

### 1.2 Start from `develop`

```bash
git checkout develop
git pull origin develop
```

### 1.3 Create your working branch

For feature development, branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-change
```

For urgent production fixes, branch from `master`:

```bash
git checkout master
git pull origin master
git checkout -b hotfix/my-fix
```

For release preparation, branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b release/x.y.z
```

### 1.4 Run checks locally before pushing

```bash
npm run lint
npm run test:run
npm run build
```

### 1.5 Commit and push branch

Follow **Conventional Commits** (same standard as `CONTRIBUTING.md`):
- Format: `type(scope): short summary`
- `scope` is optional
- Recommended types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`

For full contribution rules and commit conventions, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

For feature branches:

```bash
git add .
git commit -m "feat(core): add your feature"
git push origin feature/my-change
```

For hotfix branches:

```bash
git add .
git commit -m "fix(core): resolve urgent production issue"
git push origin hotfix/my-fix
```

For release branches:

```bash
git add .
git commit -m "docs(release): prepare release x.y.z notes"
git push origin release/x.y.z
```

### 1.6 Create Merge Request to `develop` (GitLab)

1. Open GitLab and create a new Merge Request
2. **Source branch:** `feature/my-change`
3. **Target branch:** `develop`
4. Create the MR and wait for pipeline success

**CI Pipeline:** On pushes and Merge Requests in GitLab, CI runs lint, test, and the appropriate build target.

---

## Part 2: Release and Hotfix Flow (MR-only)

### 2.1 Release flow (`release/*`)

1. Create release branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b release/x.y.z
```

2. Finalize release changes (version, changelog, docs), then push:

```bash
git push origin release/x.y.z
```

3. Open MR: `release/x.y.z` -> `master`, wait for green pipeline, then merge.
4. Tag the release on `master` (for example `vX.Y.Z`) and publish release artifacts.
5. Open MR: `release/x.y.z` (or `master`) -> `develop` to back-merge release commits.

### 2.2 Hotfix flow (`hotfix/*`)

1. Create hotfix branch from `master`:

```bash
git checkout master
git pull origin master
git checkout -b hotfix/my-fix
```

2. Implement fix, push branch, and open MR to `master`.
3. Optionally bump patch version if needed, then tag on `master` after merge.
4. Open MR from `hotfix/*` (or `master`) to `develop` to back-merge the fix.

### 2.3 Pipeline must pass

- Pipeline runs lint, test, buid and publish on the Merge Request.

### 2.4 Merge policy for `master`

- No direct push to `master`.
- No force push to `master`.
- Merge only via Merge Request.

---

## Part 3: CI Pipeline Behavior

| Trigger | Action |
| ------- | ------ |
| Push to `develop` | Lint -> Test -> `build` |
| Push to `feature/*` | Lint -> Test -> `build` |
| Push to `hotfix/*` | Lint -> Test -> `build` |
| Push to `release/*` | Lint -> Test -> `build` |
| Merge request (GitLab) | Lint -> Test -> Build -> publish target based on branch purpose |
| Push to GitHub mirror | No development workflow; distribution only |


