#!/sh
# Build static web + Capacitor sync + release AAB.
# Requires: Node >= 22, JDK 21, Android SDK.

set -e
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

if [ -d /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
elif [ -d /usr/libexec/java_home ]; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
fi

if [ -z "$JAVA_HOME" ] || [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "JDK 21 required (Capacitor 8). Install: brew install openjdk@21"
  exit 1
fi

pnpm build
npx cap sync android
(cd android && ./gradlew bundleRelease)

echo ""
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "Note: currently debug-signed for pipeline proof. Add a Play upload keystore before store release."
