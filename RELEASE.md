# Release guide — n8n-nodes-nextlead

Full procedure to publish a new version of the node on npm.

Publishing happens **exclusively through GitHub Actions**. Since 1 May 2026, n8n requires
verified community nodes to be published with an npm *provenance statement*, which
cryptographically proves the package was built from this repository, at this commit. An
`npm publish` from your own machine does not produce that proof and disqualifies the node.

**The principle:** you never publish by hand. You push a version tag, and the
[`.github/workflows/publish.yml`](.github/workflows/publish.yml) workflow publishes for you.

---

## ⚠️ Step 0 — Check the npm token (do this BEFORE every release)

**This is the most frequent failure.** npm caps write tokens at **90 days maximum**, and
7 days by default. An expired token does not produce a clear error message: publishing fails
with a misleading `E404`.

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/n8n-nodes-nextlead
npm error 404 The requested resource 'n8n-nodes-nextlead@X.Y.Z' could not be found
       or you do not have permission to access it.
```

The registry answers `404` instead of `403` so that it does not reveal the existence of
packages to unauthorized users. **An `E404` on a `PUT` for a package that does exist is an
authentication problem, never a missing package.**

### Check it

1. npmjs.com → avatar → **Access Tokens**
2. Find the `nextlead-n8n-publish` token and its expiry date.
3. If it is expired or missing → regenerate it (below).

### Regenerate the token

npmjs.com → **Access Tokens** → *Generate New Token* → **Granular Access Token**

| Field | Value |
|---|---|
| Token name | `nextlead-n8n-publish` |
| **Bypass two-factor authentication (2FA)** | ✅ **checked** — otherwise `npm publish` fails with `EOTP` in CI, since nobody can type a code on a runner |
| Allowed IP ranges | **empty** — GitHub runners have dynamic IPs |
| Packages and scopes | *Only select packages and scopes* → **`n8n-nodes-nextlead`** |
| Permissions (packages) | **Read and write** |
| Organizations | **No access** — the package belongs to user accounts, not to an org |
| Expiration | **90 days** (the maximum) |

Before confirming, the summary must read **"read and write access to 1 package"**. If it
reads `0 packages`, the package was not selected and the token will be useless.

Then: GitHub → repo → **Settings → Secrets and variables → Actions** → `NPM_TOKEN` →
**Update secret**.

> **Deadline note:** npm will restrict tokens that bypass 2FA for direct publishing from
> **January 2027**. We will need to move to OIDC *Trusted Publishing* before then (see
> "Planned changes" at the bottom).

---

## Step 1 — Develop and test

```bash
pnpm dev
```

Starts an n8n instance on http://localhost:5678 with the node linked and hot-reloaded. Really
test the operations you changed in the editor: neither the linter nor the compiler validates
runtime behaviour (API calls, date formats, dropdown loading).

## Step 2 — Pre-release checks

```bash
pnpm lint     # n8n verification rules (strict mode)
pnpm build    # TypeScript compilation + asset copy
```

Both must exit with code 0. The linter applies the `eslint-plugin-n8n-nodes-base` rules
required for n8n verification: parameter naming, mandatory `default`, the "Name or ID" suffix
on fields using `loadOptionsMethod`, descriptions, and so on.

Optional, to inspect the exact contents of the published tarball:

```bash
npm pack --dry-run
```

Only the `dist/` folder is published (the `files` field of `package.json`).

## Step 3 — Merge into `main`

The release tag must point at `main`. `n8n-node release` refuses to run anywhere else
(`--git.requireBranch main`).

```bash
git push -u origin my-branch
# open the PR, get it reviewed, merge it

git checkout main
git pull
git status        # must be empty: --git.requireCleanWorkingDir
```

## Step 4 — Run the release

```bash
pnpm run release
```

What the command chains together:

1. `pnpm lint` then `pnpm build`
2. changelog generation (`auto-changelog`)
3. **version number prompt**:
   ```
   ? Select increment (next version):
   ❯ patch (0.1.8)     ← bug fixes
     minor (0.2.0)     ← backwards-compatible features
     major (1.0.0)     ← breaking changes
   ```
4. writes the version into `package.json`, commits `Release X.Y.Z`
5. tags `vX.Y.Z`, pushes the commit and the tag
6. creates the GitHub Release

**It does not publish to npm** — that is deliberate, a local publish would carry no
provenance. Pushing the tag is what triggers the workflow.

Remember to commit the generated `CHANGELOG.md` if it shows up as untracked.

## Step 5 — Watch the workflow

GitHub → **Actions** tab → the run is named after the release commit.

The workflow (triggered by `*.*.*` tags): checkout → pnpm → Node LTS →
`pnpm install --frozen-lockfile` → `pnpm run build` → `npm publish --provenance`.

## Step 6 — Verify the publication

```bash
npm view n8n-nodes-nextlead version     # must show the new version
```

On https://www.npmjs.com/package/n8n-nodes-nextlead, the
**"Built and signed on GitHub Actions"** badge must appear: that is the provenance n8n
requires.

---

## Troubleshooting

### `ERR_PNPM_IGNORED_BUILDS` at the *Install dependencies* step

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: <package>@x.y.z
```

Since pnpm 11, an unapproved build script is a **fatal error** (it was only a warning in
pnpm 10). The workflow uses `version: latest` for pnpm, so it may run a newer version than the
one you have locally — the error is then invisible on the developer side.

Fix: add the dependency to [`pnpm-workspace.yaml`](pnpm-workspace.yaml), which declares both
keys (`allowBuilds` for pnpm 11, `onlyBuiltDependencies` for pnpm 10). The `pnpm` field of
`package.json` is **no longer read** by pnpm 11.

Reproduce the CI environment locally:

```bash
CI=true npx pnpm@latest install --frozen-lockfile
```

### `E404` on `PUT` at the *Publish to npm* step

npm token expired, revoked, or without write access to the package → see **Step 0**.

### `ERR_PNPM_OUTDATED_LOCKFILE`

`pnpm-lock.yaml` is out of sync with `package.json`. Run `pnpm install` and commit the
lockfile.

### `ERROR Unknown option '-n'` when running `pnpm run release`

`release-it` v21 removed the `-n` flag that `@n8n/node-cli` still passes. The package is
pinned to `^20.2.0` in devDependencies — do not bump it to v21.

### `spawn ENAMETOOLONG` at the end of the release (Windows)

Without a `GITHUB_TOKEN` environment variable, release-it falls back to creating the Release
through the web and tries to open a URL containing the whole changelog — too long for Windows.

The commit, the tag and the push have already gone through at that point: **the release is not
lost**, only the GitHub Release is missing. Fix it with `setx GH_TOKEN <token>`, or create the
Release by hand.

### The run failed and I want to re-run it

**"Re-run jobs" does not pick up the latest state of `main`.** It replays exactly the commit
that triggered the run. If the fix is in a later commit, the tag has to be moved:

```bash
git tag -f vX.Y.Z
git push origin :refs/tags/vX.Y.Z    # delete the remote tag
git push origin vX.Y.Z               # push it again → new run
```

Do not delete a run you intend to re-run: a deleted run cannot be replayed.

### The version was tagged but never published

As long as the version does not exist on npm, the number stays reusable: fix the problem, then
move the tag as above. If the version **was** published, it is final — npm forbids republishing
the same number, so you have to move on to a `patch`.

---

## Versioning rules

The node follows semver. Since `n8n-nodes-nextlead` is on `0.x`, breaking changes are still
tolerated in a `minor`, but it is worth staying strict:

| Increment | When |
|---|---|
| `patch` | bug fix, description tweak, CI fix |
| `minor` | new resource, new operation, new field |
| `major` | removing or renaming a field/operation, changing the output format — breaks existing user workflows |

Pay particular attention to `major`: renaming a parameter's `name` silently breaks workflows
users have already built.

---

## Constraints to respect (n8n verification)

They are checked automatically by `pnpm lint`, but are worth knowing:

- package name prefixed with `n8n-nodes-`
- `n8n-community-node-package` keyword present
- **zero runtime dependencies** — only `n8n-workflow` as a peerDependency; anything added must
  go in `devDependencies`
- MIT licence
- nodes and credentials declared in the `n8n` attribute of `package.json`
- published through GitHub Actions with provenance

---

## Planned changes

**Trusted Publishing (OIDC)** — removes the npm token entirely, and with it the repeated
expirations. This is the method n8n recommends. It requires: declaring the publisher on
npmjs.com (package settings → Trusted Publishers → repo `CREACH-Agency/nextlead-n8n`, workflow
`publish.yml`), adding `registry-url` to `setup-node`, and removing the
`[ -n "$NPM_TOKEN" ] && ...` line from the workflow — under `bash -e` it fails the step when
the secret is empty, which is exactly the case in OIDC mode.

**Deprecated Node 20 actions** — move `actions/checkout` and `actions/setup-node` to `@v5` to
silence the warning.

---

## References

- [Community nodes — n8n docs](https://docs.n8n.io/integrations/community-nodes/)
- [@n8n/node-cli](https://www.npmjs.com/package/@n8n/node-cli)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [Package on npm](https://www.npmjs.com/package/n8n-nodes-nextlead)
