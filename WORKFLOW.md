# Flexa — Development Workflow

This document describes the GitFlow-based development workflow. **GitLab** is used for hosting and CI/CD.

---

## Branch Strategy

| Branch    | Purpose |
| --------- | ------- |
| `develop` | Main development branch. Daily commits and active work happen here. |
| `master`  | Protected stable branch. **Direct push is not allowed**; updates happen only via Merge Request with passing pipeline. |
| `feature/*` | Feature work branches created from `develop`. |
| `hotfix/*` | Urgent fix branches created from `master`. |
| `release/*` | Optional branch to prepare a release before merge to `master`. |

**Merge rule:** `feature/*`, `hotfix/*`, and `release/*` must be merged into `develop` first.
Only `develop` is merged into `master` via Merge Request.


---

## Part 1: Development Workflow

### 1.1 Clone and setup

```bash
git clone https://your-gitlab.com/dokudesk/flexa.git
cd flexa
npm install
```

### 1.2 Start from `develop`

```bash
git checkout develop
git pull origin develop
```

### 1.3 Create your working branch

```bash
git checkout -b feature/my-change
```

For urgent production fixes, branch from `master`:

```bash
git checkout master
git pull origin master
git checkout -b hotfix/my-fix
```

### 1.4 Run checks locally before pushing

```bash
npm run lint
npm run test:run
npm run build
```

### 1.5 Commit and push branch

```bash
git add .
git commit -m "feat: your change"
git push origin feature/my-change
```

### 1.6 Create Merge Request to `develop`

1. Open GitLab: **Merge requests** -> **New merge request**
2. **Source branch:** `feature/my-change` (or `hotfix/*` / `release/*`)
3. **Target branch:** `develop`
4. Create the MR and wait for pipeline success

**CI Pipeline:** On pushes and merge requests, GitLab CI runs lint, test, and build.

---

## Part 2: Merge to `master` (MR-only)

### 2.1 Create Merge Request

1. Open GitLab: **Merge requests** → **New merge request**
2. **Source branch:** `develop`
3. **Target branch:** `master`
4. Create the MR

### 2.2 Pipeline must pass

- Pipeline runs lint, build, and test on the MR.
- Merge is blocked until pipeline is successful.

### 2.3 Merge policy for `master`

- No direct push to `master`.
- No force push to `master`.
- Merge only via Merge Request.

---

## Part 3: CI Pipeline Behavior

| Trigger | Action |
| ------- | ------ |
| Push to `develop` | Lint -> Build -> Test |
| Push to `feature/*` | Lint -> Build -> Test |
| Push to `hotfix/*` | Lint -> Build -> Test |
| Push to `release/*` | Lint -> Build -> Test |
| Merge request | Lint -> Build -> Test |

---

## Part 4: GitLab Repository Settings (Recommended)

1. **Settings → General → Merge requests**
  - Enable **Enable "Squash commits" option**
  - Optionally set **Default merge method** to encourage squash
2. **Settings → Merge requests → Merge checks**
  - Enable **Pipelines must succeed** — blocks merge until pipeline passes
  - Do **not** enable **Skipped pipelines are considered successful** (would allow merge without running CI)
3. **Settings → Repository → Protected branches**
  - Protect `master`: no direct push, require Merge Request, no force push
  - Protect `develop` (optional): require status checks
4. **Settings → CI/CD → Variables**
  - No extra variables are required for build/lint/test pipeline.

