# Verification report

- Node 22 `node --check` for browser JavaScript modules: PASS.
- Node 22 `node --test tests/*.test.js`: 5/5 tests passed, covering named players, tracks, acceleration/nitro, two-player finish, steering bounds, braking and pause.
- Static HTML/CSS/JSON presence checked at package creation.
- No real iPhone 17 Safari device, front camera or production GitHub Pages site is available for an end-to-end test from this environment. iPhone camera availability, MediaPipe GPU/WASM loading, user permissions, real-world simultaneous tracking accuracy, frame rate, touch layout, and audio must be tested on the phone. Touch mode is the lowest-risk starting point.
- A sandbox headless Chromium screenshot was attempted but timed out due to sandbox/browser environment restrictions; this was not counted as a browser pass.

## Suggested user acceptance test

1. Open HTTPS deployment, select Touch + 1 Player + Coast; complete a 2-lap race.
2. Restart, select 2 Players + Neon; race with simultaneous multi-touch controls and verify names and finish order.
3. Enter Calibration, approve camera, keep players' wrists in their respective preview halves and calibrate both. Turn on hand landmarks to see tracking.
4. Play 1 Player Camera mode: open palm should accelerate, fist brakes, move hand left/right steers; pinching with at least two fingers extended activates boost.
5. Play 2 Players Camera mode: both hands should independently control their own cars. Test hand overlap and loss of tracking; if unreliable switch to Touch mode.
6. Pause, resume, restart, quit, adjust graphics/volume; rotate device, reload, and confirm stored settings.
