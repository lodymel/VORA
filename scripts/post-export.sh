#!/sh
# After static export: keep /privacy.html and /terms.html working
# (bookmarks + simple hosts) alongside trailingSlash folders.
set -e
cd "$(dirname "$0")/.."
if [ -f out/privacy/index.html ]; then
  cp out/privacy/index.html out/privacy.html
fi
if [ -f out/terms/index.html ]; then
  cp out/terms/index.html out/terms.html
fi
