#!/bin/sh
# Point this clone at the tracked .githooks (no Cursor contributor on GitHub).
set -e
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/prepare-commit-msg .githooks/commit-msg .githooks/pre-push
echo "git hooks enabled: core.hooksPath=.githooks"
echo "Cursor will be stripped/blocked from commit messages and pushes."
