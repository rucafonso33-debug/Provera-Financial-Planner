#!/usr/bin/env bash
set -Eeuo pipefail

cd "${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"

adb wait-for-device

printf 'Waiting for Android package service...\n'
for attempt in $(seq 1 120); do
  if adb shell cmd package list packages >/dev/null 2>&1; then
    printf 'Android package service is ready.\n'
    break
  fi

  if [ "$attempt" -eq 120 ]; then
    printf 'Android package service did not become ready.\n' >&2
    adb shell getprop || true
    exit 1
  fi

  sleep 5
done

adb shell input keyevent 82 || true
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true

APK="$GITHUB_WORKSPACE/provera-e2e.apk"
test -f "$APK"

printf 'Installing APK: %s\n' "$APK"
for attempt in 1 2 3; do
  if adb install -r -t "$APK"; then
    break
  fi

  if [ "$attempt" -eq 3 ]; then
    printf 'APK installation failed after three attempts.\n' >&2
    exit 1
  fi

  sleep 15
  adb wait-for-device
done

maestro test .maestro/smoke.yaml --format junit --output maestro-results.xml
