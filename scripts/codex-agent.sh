#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# codex-agent.sh
# Codex CLI 에이전트 래퍼 — 지정한 에이전트의 .md 파일을 system prompt로 삼아
# codex CLI를 실행한다.
#
# 사용법:
#   ./scripts/codex-agent.sh <agent-name> "<task>"
#
# 예시:
#   ./scripts/codex-agent.sh backend "reviews 모듈 CRUD 구현"
#   ./scripts/codex-agent.sh database "reviews 테이블 마이그레이션 SQL 생성"
#   ./scripts/codex-agent.sh frontend-web "ReviewForm 컴포넌트 구현"
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

AGENT_NAME="${1:-}"
TASK="${2:-}"

# ── 도움말 ────────────────────────────────────────────────────────────────────
if [[ -z "$AGENT_NAME" || "$AGENT_NAME" == "--help" || "$AGENT_NAME" == "-h" ]]; then
  echo "사용법: $0 <agent-name> \"<task>\""
  echo ""
  echo "사용 가능한 에이전트:"
  for f in "${PROJECT_ROOT}/agents/"*.md; do
    name="$(basename "$f" .md)"
    echo "  - ${name}"
  done
  exit 0
fi

if [[ -z "$TASK" ]]; then
  echo "ERROR: task 인수가 필요합니다."
  echo "사용법: $0 ${AGENT_NAME} \"<task>\""
  exit 1
fi

# ── 에이전트 파일 확인 ────────────────────────────────────────────────────────
AGENT_FILE="${PROJECT_ROOT}/agents/${AGENT_NAME}.md"

if [[ ! -f "$AGENT_FILE" ]]; then
  echo "ERROR: 에이전트 파일을 찾을 수 없습니다: ${AGENT_FILE}"
  echo ""
  echo "사용 가능한 에이전트:"
  for f in "${PROJECT_ROOT}/agents/"*.md; do
    echo "  - $(basename "$f" .md)"
  done
  exit 1
fi

# ── codex 설치 확인 ───────────────────────────────────────────────────────────
if ! command -v codex &> /dev/null; then
  echo "ERROR: codex CLI가 설치되어 있지 않습니다."
  echo "설치: npm install -g @openai/codex"
  exit 1
fi

# ── 실행 ──────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  에이전트 : ${AGENT_NAME}"
echo "  파일     : agents/${AGENT_NAME}.md"
echo "  작업     : ${TASK}"
echo "══════════════════════════════════════════════════════════"
echo ""

# 프로젝트 루트 기준으로 실행 (상대경로 참조를 위해)
cd "${PROJECT_ROOT}"

# 에이전트 .md 파일 내용을 프롬프트 앞에 붙여서 비대화형 실행
AGENT_INSTRUCTIONS="$(cat "${AGENT_FILE}")"

FULL_PROMPT="${AGENT_INSTRUCTIONS}

---

## 지금 수행할 작업

${TASK}"

codex exec --full-auto --skip-git-repo-check -C "${PROJECT_ROOT}" "${FULL_PROMPT}"
