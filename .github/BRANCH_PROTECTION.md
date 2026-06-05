# Branch protection setup

Branch protection is a repository setting and cannot be fully enforced by committed source code alone. Use this checklist in GitHub after this PR is merged.

## Recommended rule

Create a ruleset or branch protection rule for your default branch (`main` or `master`):

- Restrict deletions: **enabled**
- Block force pushes: **enabled**
- Require a pull request before merging: **enabled**
- Require approvals: **1 or more**
- Dismiss stale approvals when new commits are pushed: **enabled**
- Require status checks before merging: **enabled**
- Required checks:
  - `Web checks`
  - `ML service checks`
- Require branches to be up to date before merging: **enabled**
- Require conversation resolution before merging: **enabled**
- Require signed commits: optional, recommended for production repositories
- Allow bypasses: only repository administrators or no one

## GitHub UI path

1. Open **Settings → Rules → Rulesets** or **Settings → Branches**.
2. Create a rule targeting your default branch.
3. Enable the protections above.
4. Save the rule and verify that pull requests require the `CI` workflow checks.

## GitHub CLI example

GitHub branch protection APIs require repository admin permissions and a real owner/repository name. Replace placeholders before running:

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/<OWNER>/<REPO>/branches/main/protection \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f required_status_checks='{"strict":true,"contexts":["Web checks","ML service checks"]}' \
  -f enforce_admins=true \
  -f restrictions=null \
  -F allow_force_pushes=false \
  -F allow_deletions=false
```
