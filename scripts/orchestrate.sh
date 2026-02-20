#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# orchestrate.sh
# 피처 구현을 위해 여러 Codex 에이전트를 순차/병렬로 실행하는 오케스트레이터.
# 각 스텝은 JSON 플랜 파일로 정의하거나, 인라인으로 직접 지정할 수 있다.
#
# 사용법:
#   bash scripts/orchestrate.sh --plan <plan-file.json>
#   bash scripts/orchestrate.sh --step <agent> "<task>" [--step <agent> "<task>" ...]
#
# 플랜 파일 예시 (plan.json):
#   [
#     { "agent": "database",      "task": "reviews 테이블 마이그레이션 SQL 생성",   "parallel": false },
#     { "agent": "backend",       "task": "reviews 모듈 CRUD 구현",                 "parallel": false },
#     { "agent": "frontend-web",  "task": "ReviewForm 컴포넌트 구현",               "parallel": true  },
#     { "agent": "frontend-mobile","task": "리뷰 작성 화면 구현",                   "parallel": true  },
#     { "agent": "tester",        "task": "reviews 테스트 작성",                    "parallel": false }
#   ]
#   parallel: true 인 항목들은 같은 그룹에서 병렬 실행된다.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CODEX_AGENT="${SCRIPT_DIR}/codex-agent.sh"

# ── 색상 ──────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── 로그 ──────────────────────────────────────────────────────────────────────
log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[DONE]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_step()    { echo -e "\n${CYAN}━━━━ Step: $* ━━━━${NC}"; }

# ── jq 확인 ───────────────────────────────────────────────────────────────────
check_deps() {
  if ! command -v jq &> /dev/null; then
    log_error "jq가 필요합니다: brew install jq"
    exit 1
  fi
  if ! command -v codex &> /dev/null; then
    log_error "codex CLI가 필요합니다: npm install -g @openai/codex"
    exit 1
  fi
}

# ── 단일 에이전트 실행 ────────────────────────────────────────────────────────
run_agent() {
  local agent="$1"
  local task="$2"
  local log_file="${PROJECT_ROOT}/.orchestrate-logs/${agent}-$(date +%s).log"

  mkdir -p "${PROJECT_ROOT}/.orchestrate-logs"

  log_step "${agent} — ${task}"
  bash "${CODEX_AGENT}" "${agent}" "${task}" 2>&1 | tee "${log_file}"
  log_success "${agent} 완료 → 로그: .orchestrate-logs/$(basename "${log_file}")"
}

# ── 병렬 그룹 실행 ────────────────────────────────────────────────────────────
run_parallel_group() {
  local -n _group=$1  # nameref: array of "agent:::task" strings
  local pids=()
  local agents=()

  log_info "병렬 실행 시작 (${#_group[@]}개 에이전트)"

  for entry in "${_group[@]}"; do
    local agent="${entry%%:::*}"
    local task="${entry##*:::}"
    agents+=("${agent}")

    bash "${CODEX_AGENT}" "${agent}" "${task}" &
    pids+=($!)
    log_info "  시작됨: ${agent} (PID $!)"
  done

  # 모두 대기
  local failed=0
  for i in "${!pids[@]}"; do
    if ! wait "${pids[$i]}"; then
      log_error "${agents[$i]} 실패 (PID ${pids[$i]})"
      failed=$((failed + 1))
    else
      log_success "${agents[$i]} 완료"
    fi
  done

  if [[ $failed -gt 0 ]]; then
    log_error "병렬 그룹에서 ${failed}개 에이전트 실패"
    return 1
  fi
}

# ── 플랜 파일 실행 ────────────────────────────────────────────────────────────
run_plan() {
  local plan_file="$1"

  if [[ ! -f "$plan_file" ]]; then
    log_error "플랜 파일을 찾을 수 없습니다: ${plan_file}"
    exit 1
  fi

  log_info "플랜 로드: ${plan_file}"
  local total
  total=$(jq 'length' "${plan_file}")
  log_info "총 ${total}개 스텝"

  local i=0
  while [[ $i -lt $total ]]; do
    local parallel
    parallel=$(jq -r ".[$i].parallel // false" "${plan_file}")

    if [[ "$parallel" == "true" ]]; then
      # 같은 그룹(연속된 parallel:true) 수집
      local parallel_group=()
      while [[ $i -lt $total ]]; do
        local p
        p=$(jq -r ".[$i].parallel // false" "${plan_file}")
        [[ "$p" != "true" ]] && break

        local agent task
        agent=$(jq -r ".[$i].agent" "${plan_file}")
        task=$(jq -r ".[$i].task" "${plan_file}")
        parallel_group+=("${agent}:::${task}")
        i=$((i + 1))
      done
      run_parallel_group parallel_group
    else
      local agent task
      agent=$(jq -r ".[$i].agent" "${plan_file}")
      task=$(jq -r ".[$i].task" "${plan_file}")
      run_agent "${agent}" "${task}"
      i=$((i + 1))
    fi
  done
}

# ── 인라인 스텝 실행 ──────────────────────────────────────────────────────────
run_inline_steps() {
  local args=("$@")
  local i=0
  while [[ $i -lt ${#args[@]} ]]; do
    if [[ "${args[$i]}" == "--step" ]]; then
      local agent="${args[$((i+1))]}"
      local task="${args[$((i+2))]}"
      run_agent "${agent}" "${task}"
      i=$((i + 3))
    else
      i=$((i + 1))
    fi
  done
}

# ── 도움말 ────────────────────────────────────────────────────────────────────
show_help() {
  cat <<EOF
사용법:
  $0 --plan <plan.json>
  $0 --step <agent> "<task>" [--step <agent> "<task>" ...]

플랜 파일 형식 (JSON 배열):
  [
    { "agent": "database",       "task": "...", "parallel": false },
    { "agent": "backend",        "task": "...", "parallel": false },
    { "agent": "frontend-web",   "task": "...", "parallel": true  },
    { "agent": "frontend-mobile","task": "...", "parallel": true  },
    { "agent": "tester",         "task": "...", "parallel": false }
  ]

  parallel: true → 같은 그룹 항목들끼리 병렬 실행
  parallel: false (기본값) → 이전 스텝 완료 후 순차 실행

사용 가능한 에이전트:
$(for f in "${PROJECT_ROOT}/agents/"*.md; do echo "  - $(basename "$f" .md)"; done)

예시:
  # 플랜 파일로 실행
  $0 --plan plans/review-feature.json

  # 인라인 순차 실행
  $0 --step database "reviews 마이그레이션" --step backend "reviews CRUD"
EOF
}

# ── 메인 ──────────────────────────────────────────────────────────────────────
main() {
  check_deps

  if [[ $# -eq 0 || "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
  fi

  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║     방탈출 플랫폼 — Codex 오케스트레이터  ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
  echo ""

  local start_time=$SECONDS

  if [[ "$1" == "--plan" ]]; then
    run_plan "${2:?플랜 파일 경로가 필요합니다}"
  elif [[ "$1" == "--step" ]]; then
    run_inline_steps "$@"
  else
    log_error "알 수 없는 옵션: $1"
    show_help
    exit 1
  fi

  local elapsed=$((SECONDS - start_time))
  echo ""
  echo -e "${GREEN}══════════════════════════════════════════${NC}"
  echo -e "${GREEN}  모든 에이전트 완료 (${elapsed}초)${NC}"
  echo -e "${GREEN}══════════════════════════════════════════${NC}"
}

main "$@"
