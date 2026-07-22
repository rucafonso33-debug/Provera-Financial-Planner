#!/usr/bin/env bash
set -Eeuo pipefail

cd "${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"

adb start-server
adb wait-for-device

printf 'Waiting for Android boot completion...\n'
for attempt in $(seq 1 180); do
  boot_completed="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  boot_anim="$(adb shell getprop init.svc.bootanim 2>/dev/null | tr -d '\r')"

  if [ "$boot_completed" = "1" ] && [ "$boot_anim" = "stopped" ]; then
    break
  fi

  if [ "$attempt" -eq 180 ]; then
    printf 'Android did not finish booting.\n' >&2
    adb shell getprop || true
    exit 1
  fi

  sleep 5
done

printf 'Waiting for Android package service to remain stable...\n'
stable_checks=0
for attempt in $(seq 1 180); do
  if adb shell service check package 2>/dev/null | grep -q 'found' && adb shell pm path android >/dev/null 2>&1; then
    stable_checks=$((stable_checks + 1))
  else
    stable_checks=0
  fi

  if [ "$stable_checks" -ge 3 ]; then
    printf 'Android package service is stable.\n'
    break
  fi

  if [ "$attempt" -eq 180 ]; then
    printf 'Android package service did not become stable.\n' >&2
    adb shell service list || true
    adb shell getprop || true
    exit 1
  fi

  sleep 5
done

sleep 20
adb shell input keyevent 82 || true
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true

APK="$GITHUB_WORKSPACE/provera-e2e.apk"
test -f "$APK"

printf 'Installing APK: %s\n' "$APK"
for attempt in 1 2 3; do
  adb kill-server || true
  sleep 3
  adb start-server
  adb wait-for-device

  if adb install --no-streaming -r -t "$APK"; then
    printf 'APK installed successfully.\n'
    break
  fi

  if [ "$attempt" -eq 3 ]; then
    printf 'APK installation failed after three attempts.\n' >&2
    adb devices -l || true
    adb shell service check package || true
    exit 1
  fi

  sleep 20
done

maestro test .maestro/smoke.yaml --format junit --output maestro-results.xml
