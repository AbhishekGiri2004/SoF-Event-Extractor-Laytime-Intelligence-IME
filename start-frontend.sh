#!/bin/bash

echo "🚀 Starting Frontend Only..."

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "⚛️ Starting React development server..."
npm run dev