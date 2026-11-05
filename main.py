"""
Root entrypoint for Render and cloud hosts that run from the repository root.
Automatically mounts the backend directory into sys.path and exposes the FastAPI app.
"""
import sys
from pathlib import Path

_root_dir = Path(__file__).resolve().parent
_backend_dir = str(_root_dir / "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app

__all__ = ["app"]

