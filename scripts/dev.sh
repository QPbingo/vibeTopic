#!/usr/bin/env bash
# =============================================================================
# bingbingbingo — 本地开发管理脚本
# 用法: ./scripts/dev.sh <命令>
# 基础设施（PG/Redis/MinIO）已部署在测试服 47.93.232.84，无需本地 Docker
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }

usage() {
  echo ""
  echo -e "${CYAN}bingbingbingo 本地开发管理${NC}"
  echo ""
  echo "用法: ./scripts/dev.sh <命令>"
  echo ""
  echo "  start       启动全部服务（API + SSE + Web）"
  echo "  stop        停止全部服务"
  echo "  restart     重启全部服务"
  echo "  api         仅启动 API       → http://localhost:8080"
  echo "  sse         仅启动 SSE       → http://localhost:3001"
  echo "  web         仅启动 Web       → http://localhost:3000"
  echo "  status      查看服务运行状态"
  echo "  db-reset    重置数据库（⚠️ 删除全部数据）"
  echo "  db-studio   打开 Prisma Studio → http://localhost:5555"
  echo "  install     安装依赖"
  echo "  clean       清理 node_modules 和构建产物"
  echo ""
}

start_all() {
  info "启动 API、SSE、Web..."
  pnpm dev:api &
  pnpm dev:sse &
  pnpm dev:web &
  sleep 3
  ok "全部已启动"
  echo "  API : http://localhost:8080/health"
  echo "  SSE : http://localhost:3001/health"
  echo "  Web : http://localhost:3000"
}

stop_all() {
  info "停止..."
  pkill -f "tsx watch src/index.ts" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  ok "已停止"
}

restart_all() {
  stop_all
  sleep 1
  start_all
}

api_only() {
  info "API → http://localhost:8080"
  pnpm dev:api
}

sse_only() {
  info "SSE → http://localhost:3001"
  pnpm dev:sse
}

web_only() {
  info "Web → http://localhost:3000"
  pnpm dev:web
}

status_all() {
  echo ""
  echo -e "${CYAN}端口监听:${NC}"
  for port in 3000 3001 8080; do
    if lsof -i :$port -sTCP:LISTEN 2>/dev/null | grep -q LISTEN; then
      echo "  :$port ✅"
    else
      echo "  :$port ❌"
    fi
  done
  echo ""
  echo -e "${CYAN}运行中的进程:${NC}"
  pgrep -la "tsx|next" 2>/dev/null || echo "  无"
}

db_reset() {
  warn "即将删除数据库中全部数据！"
  read -rp "确认？输入 yes: " confirm
  if [ "$confirm" != "yes" ]; then
    info "已取消"
    return
  fi
  info "重置..."
  psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
  pnpm db:push
  pnpm db:seed
  ok "数据库已重置"
}

db_studio() {
  info "Prisma Studio → http://localhost:5555"
  pnpm db:studio
}

install_deps() {
  info "安装依赖..."
  pnpm install
  pnpm build:shared
  ok "完成"
}

clean_all() {
  warn "清理 node_modules、构建产物..."
  rm -rf node_modules apps/*/node_modules packages/*/node_modules
  rm -rf apps/*/dist packages/*/dist apps/web/.next
  ok "已清理"
}

case "${1:-}" in
  start)      start_all ;;
  stop)       stop_all ;;
  restart)    restart_all ;;
  api)        api_only ;;
  sse)        sse_only ;;
  web)        web_only ;;
  status)     status_all ;;
  db-reset)   db_reset ;;
  db-studio)  db_studio ;;
  install)    install_deps ;;
  clean)      clean_all ;;
  *)          usage ;;
esac
