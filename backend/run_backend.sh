#!/bin/bash
# ============================================
# WoundCare AI — Backend Startup Script
# ============================================
# This script creates a Python virtual environment,
# installs dependencies, and starts the FastAPI server.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="venv"

# ---------- Create virtual environment if it doesn't exist ----------
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "Virtual environment created."
fi

# ---------- Activate virtual environment ----------
source "$VENV_DIR/bin/activate"

# ---------- Install / update dependencies ----------
echo "Installing dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "Dependencies installed."

# ---------- Start the server ----------
echo ""
echo "Starting WoundCare AI backend server..."
echo "  → http://localhost:8000"
echo "  → Health check: http://localhost:8000/health"
echo "  → API docs: http://localhost:8000/docs"
echo ""
python run.py
