#!/bin/bash

# SoF Event Extractor - Stop Script
echo "🛑 Stopping SoF Event Extractor Services..."

# Kill processes by PID if files exist
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "Stopping Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    rm .backend.pid
fi

if [ -f .extractor.pid ]; then
    EXTRACTOR_PID=$(cat .extractor.pid)
    echo "Stopping Extractor (PID: $EXTRACTOR_PID)..."
    kill $EXTRACTOR_PID 2>/dev/null || true
    rm .extractor.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "Stopping Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm .frontend.pid
fi

# Also kill by port as backup
echo "🧹 Cleaning up any remaining processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped!"