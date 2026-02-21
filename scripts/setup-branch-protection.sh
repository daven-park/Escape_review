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

PROTECTION_PAYLOAD='{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test-api", "test-web", "type-check"]
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
}'

# ─── main 브랜치 보호 (운영 보호) ────────────────────────────────────────────
echo "🔒 Protecting main branch ..."
echo "$PROTECTION_PAYLOAD" | gh api \
  --method PUT \
  "repos/${OWNER}/${REPO}/branches/main/protection" \
  --input -
echo "✅ main: PR required (1 approval) + CI must pass"

# ─── develop 브랜치 보호 (개발 통합 보호) ────────────────────────────────────
echo "🔒 Protecting develop branch ..."
echo "$PROTECTION_PAYLOAD" | gh api \
  --method PUT \
  "repos/${OWNER}/${REPO}/branches/develop/protection" \
  --input - 2>/dev/null || echo "⚠️  develop branch not found — push it first: git push origin develop"
echo "✅ develop: PR required (1 approval) + CI must pass"

# ─── 레포 Merge 설정 ─────────────────────────────────────────────────────────
gh api \
  --method PATCH \
  "repos/${OWNER}/${REPO}" \
  --field delete_branch_on_merge=true \
  --field squash_merge_commit_title=PR_TITLE \
  --field squash_merge_commit_message=BLANK \
  > /dev/null

echo ""
echo "🎉 Done! Git Flow branch rules:"
echo "   main    : PR required (1 approval), CI must pass, no direct push"
echo "   develop : PR required (1 approval), CI must pass, no direct push"
echo "   feature : auto-deleted after merge (Squash & Merge → develop)"
echo ""
echo "Flow: feat/* → develop (PR) → main (release PR)"
