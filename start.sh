#!/bin/bash
# FDE 售前客户诊断工作流系统启动脚本

cd "$(dirname "$0")"

echo "======================================================="
echo "   FDE 售前客户诊断工作流系统 V1.0 (双 Agent 架构)"
echo "   模型配置: GLM-5.2 (OpenAI Chat Completions 兼容网关)"
echo "======================================================="

# Check if dist exists, if not build it
if [ ! -d "dist" ]; then
  echo "[1/2] 正在构建前端生产包..."
  npm run build
fi

echo "[2/2] 启动 Web 服务器..."
PORT=${PORT:-8088}
echo "访问地址: http://localhost:$PORT"
echo "按 Ctrl+C 可停止运行"
echo "-------------------------------------------------------"

node server/index.js
