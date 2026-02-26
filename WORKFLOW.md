# Flexa — Development & Release Workflow

This document describes the workflow for developing on `develop` and releasing to `master`. **GitLab** is used for hosting and CI/CD. There are no feature branches — all work happens directly on `develop`.

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `develop` | Main development. All commits and history live here. No feature branches. |
| `master` | Production-ready releases only. One squashed commit per version. **Merge allowed only when version is bumped.** |

---

## Part 1: Development on `develop`

### 1.1 Clone and setup

```bash
git clone https://your-gitlab.com/dokudesk/flexa.git
cd flexa
npm install
```

### 1.2 Switch to develop

```bash
git checkout develop
git pull origin develop
```

### 1.3 Run checks locally before pushing

```bash
npm run stylelint:scss
npm run build
npm run stylelint:css
npm run test:run
```

### 1.4 Commit and push to develop

```bash
git add .
git commit -m "feat: your change"
git push origin develop
```

**CI Pipeline:** On every push to `develop`, GitLab CI runs lint, build, and tests.

---

## Part 2: Releasing a New Version to `master`

The goal: merge `develop` into `master` as **one squashed commit** per version, then create a release.

**Important:** Merge to `master` is **only allowed when the version in `package.json` has been bumped**. The CI pipeline checks this and fails if the version is unchanged — merge will be blocked until you update the version.

**Release steps overview:**

| Step | Action |
|------|--------|
| 1 | Check and update version in `package.json` |
| 2 | Commit and push version bump to `develop` |
| 3 | Create MR: `develop` → `master` |
| 4 | Wait for pipeline to succeed |
| 5 | Squash and merge into `master` |
| 6 | Create and push tag (e.g. `v1.1.0`) |
| 7 | Verify release in GitLab |
| 8 | Sync `develop` with `master` (optional) |

### Step 1: Check and update version in `package.json`

Edit `package.json` and set the new version (e.g. `1.1.0`):

```json
{
  "version": "1.1.0"
}
```

**Note:** If `master` already has the same version (e.g. from a previous release), you must bump the version. For the first release, the current version in `package.json` is fine.

### Step 2: Commit and push the version bump to develop

```bash
git checkout develop
git pull origin develop
git add package.json
git commit -m "chore: bump version to 1.1.0"
git push origin develop
```

### Step 3: Create a Merge Request (MR)

1. On GitLab: **Merge requests** → **New merge request**
2. **Source branch:** `develop`
3. **Target branch:** `master`
4. Click **Create merge request**

### Step 4: Wait for the pipeline to succeed

The pipeline runs automatically and includes:

- **check-version-bump** — Verifies the version in `package.json` is greater than `master`
- **lint-and-test** — Runs lint, build, and tests

Only proceed when both jobs pass (green). If pipeline fails, fix the issues and push again.

### Step 5: Squash and merge into master

1. Open the MR
2. Enable **Squash commits when merging** (checkbox above the merge button)
3. Edit the squash commit message to something like: `release: v1.1.0`
4. Click **Merge**

**Result:** `master` now has one clean commit for this release.

### Step 6: Create and push the tag

```bash
git checkout master
git pull origin master
git tag v1.1.0
git push origin v1.1.0
```

**Important:** The tag must match the version in `package.json` (e.g. `v1.1.0` for version `1.1.0`). The CI pipeline verifies this.

### Step 7: Verify the release

1. On GitLab: **Deploy** → **Releases**
2. Confirm the release is created with tag `v1.1.0`
3. Confirm the asset `flexa-v1.1.0.zip` is downloadable

### Step 8: Sync develop with master (optional but recommended)

```bash
git checkout develop
git merge master
git push origin develop
```

This keeps `develop` in sync with `master` after each release.

---

## Part 3: Quick Reference — Release Checklist

- [ ] Version updated in `package.json` (must be greater than `master`)
- [ ] Version bump committed and pushed to `develop`
- [ ] MR created: `develop` → `master`
- [ ] Pipeline passed (check-version-bump + lint-and-test)
- [ ] Squash commits enabled, then Merge
- [ ] `git checkout master && git pull`
- [ ] `git tag vX.Y.Z` (must match `package.json` version)
- [ ] `git push origin vX.Y.Z`
- [ ] Verify GitLab Release and ZIP asset
- [ ] `git checkout develop && git merge master && git push` (optional)

---

## Part 4: CI Pipeline Behavior

| Trigger | Action |
|---------|--------|
| Push to `develop` | Lint (SCSS) → Build → Lint (CSS) → Test |
| Push to `master` | Same as above |
| **MR to `master`** | **Version check** (must be bumped) → Lint → Build → Test. Merge blocked if version unchanged. |
| MR to `develop` | Lint → Build → Test |
| Push tag `v*` (e.g. `v1.1.0`) | Run tests → Verify version → Build → Create Release with ZIP |

---

## Part 5: GitLab Repository Settings (Recommended)

1. **Settings → General → Merge requests**
   - Enable **Enable "Squash commits" option**
   - Optionally set **Default merge method** to encourage squash

2. **Settings → Merge requests → Merge checks**
   - Enable **Pipelines must succeed** — blocks merge until pipeline passes (including version check)
   - Do **not** enable **Skipped pipelines are considered successful** (would allow merge without running CI)

3. **Settings → Repository → Protected branches**
   - Protect `master`: require merge request, no force push
   - Protect `develop` (optional): require status checks

4. **Settings → CI/CD → Variables**
   - No extra variables needed for basic release (uses built-in `GITLAB_TOKEN`)
