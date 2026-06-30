"""
PulseGuard — Unified Launcher
Starts both frontend (Next.js) and backend (Express) servers.
"""

import subprocess
import sys
import os
import signal
import time

# Paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')

processes = []


def start_backend():
    """Start the Express backend server."""
    print("🚀 Starting PulseGuard Backend...")
    proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=BACKEND_DIR,
        shell=True,
    )
    processes.append(proc)
    return proc


def start_frontend():
    """Start the Next.js frontend server."""
    print("🎨 Starting PulseGuard Frontend...")
    proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=FRONTEND_DIR,
        shell=True,
    )
    processes.append(proc)
    return proc


def shutdown(signum=None, frame=None):
    """Gracefully shut down all processes."""
    print("\n🛑 Shutting down PulseGuard...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
    sys.exit(0)


if __name__ == '__main__':
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    print("=" * 50)
    print("  🚑 PulseGuard — Emergency Medical Platform")
    print("=" * 50)
    print()

    backend = start_backend()
    time.sleep(2)
    frontend = start_frontend()

    print()
    print("📡 Backend:  http://localhost:5000")
    print("🌐 Frontend: http://localhost:3000")
    print("Press Ctrl+C to stop all servers.")
    print()

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        shutdown()
