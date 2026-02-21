#!/usr/bin/env bash
# scripts/setup-branch-protection.sh
# GitHub main 브랜치 보호 규칙 설정
# 실행: bash scripts/setup-branch-protection.sh
#
# 필요: gh CLI 로그인 상태 (gh auth login)
# 대상: daven-park/Escape_review

set -euo pipefail

OWNER="daven-park"
REPO="Escape_review"
BRANCH="main"

echo "🔒 Setting up branch protection for ${OWNER}/${REPO}:${BRANCH} ..."

# ─── main 브랜치 보호 규칙 ────────────────────────────────────────────────────
gh api \
  --method PUT \
  "repos/${OWNER}/${REPO}/branches/${BRANCH}/protection" \
  --input - << 'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "test-api",
      "test-web",
      "type-check"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": true
}
JSON

echo "✅ Branch protection applied to '${BRANCH}'"

# ─── PR 머지 후 브랜치 자동 삭제 설정 ──────────────────────────────────────────
gh api \
  --method PATCH \
  "repos/${OWNER}/${REPO}" \
  --field delete_branch_on_merge=true \
  --field squash_merge_commit_title=PR_TITLE \
  --field squash_merge_commit_message=BLANK \
  > /dev/null

echo "✅ Auto-delete branch on merge: enabled"
echo "✅ Squash merge commit title: PR title"
echo ""
echo "🎉 Done! Branch rules:"
echo "   • main: PR required (1 approval)"
echo "   • main: CI must pass (test-api, test-web, type-check)"
echo "   • main: No direct push, no force push, no deletion"
echo "   • Feature branches: auto-deleted after merge"
