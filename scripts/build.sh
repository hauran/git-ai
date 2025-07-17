#!/bin/bash

# Build script for git-ai CLI tool

set -e

echo "🔨 Building git-ai..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running type check..."
npx tsc --noEmit

echo "🏗️  Compiling TypeScript..."
npm run build

echo "🔧 Making CLI executable..."
chmod +x dist/cli.js

echo "✅ Build completed successfully!"
echo ""
echo "To install globally:"
echo "  npm install -g ."
echo ""
echo "To test locally:"
echo "  ./dist/cli.js --help"
echo ""
echo "First time setup:"
echo "  1. Get API key: https://platform.openai.com/api-keys"
echo "  2. Create .env file: echo 'OPENAI_API_KEY=your_key_here' > .env"
echo "  3. Test: cd /path/to/git/repo && git add . && ./dist/cli.js"
echo ""
echo "Alternative setup:"
echo "  • Environment: export OPENAI_API_KEY=your_key_here"
echo "  • CLI config: ./dist/cli.js config --api-key YOUR_KEY" 