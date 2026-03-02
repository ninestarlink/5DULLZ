#!/bin/bash
# Railway启动脚本

echo "🔄 初始化数据库..."
node init-db.js

echo "🚀 启动服务器..."
node server-production.js
