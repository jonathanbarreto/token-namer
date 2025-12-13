#!/bin/bash
# Simple dev server using Python
cd "$(dirname "$0")"
echo "Starting dev server at http://localhost:8000"
python3 -m http.server 8000

