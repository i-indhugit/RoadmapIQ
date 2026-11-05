import os
import sys
from pathlib import Path

# Add project root directory to sys.path
root_path = str(Path(__file__).resolve().parent.parent)
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from app.main import app

# Vercel's Python runtime discovers `app` as the ASGI handler automatically

