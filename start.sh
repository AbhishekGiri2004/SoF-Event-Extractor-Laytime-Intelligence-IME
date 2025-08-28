#!/bin/bash

# SoF Event Extractor - Startup Script
echo "🚢 Starting SoF Event Extractor Services..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Kill existing processes on our ports
echo "🧹 Cleaning up existing processes..."
if check_port 8000; then
    echo "Stopping process on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if check_port 8001; then
    echo "Stopping process on port 8001..."
    lsof -ti:8001 | xargs kill -9 2>/dev/null || true
fi

if check_port 5173; then
    echo "Stopping process on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
fi

sleep 2

# Start Backend API (Laravel)
echo "🔧 Starting Backend API (Laravel)..."
cd backend-api
php artisan migrate --force 2>/dev/null || true
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Python Extraction Service
echo "🤖 Starting AI Extraction Service (Python)..."
cd services/extractor
python3 -m pip install -r requirements.txt --quiet 2>/dev/null || true
python3 main.py &
EXTRACTOR_PID=$!
cd ../..

# Wait for extractor to start
sleep 3

# Start Frontend (React)
echo "⚛️ Starting Frontend (React)..."
cd frontend
npm install --silent 2>/dev/null || true
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to fully start
sleep 5

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Frontend:    http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "🤖 AI Service:  http://localhost:8001"
echo ""
echo "📋 Service Status:"
echo "   Backend PID:   $BACKEND_PID"
echo "   Extractor PID: $EXTRACTOR_PID"
echo "   Frontend PID:  $FRONTEND_PID"
echo ""
echo "🛑 To stop all services, run: ./stop.sh"
echo ""

# Save PIDs for cleanup script
echo "$BACKEND_PID" > .backend.pid
echo "$EXTRACTOR_PID" > .extractor.pid
echo "$FRONTEND_PID" > .frontend.pid

# Keep script running
wait