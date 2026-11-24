# Verification notes

Automated checks: static project references, JS parse checks, unit tests for racing physics, ZIP integrity. Actual on-device Safari/WebGL/MediaPipe behavior and achieved FPS are **not verified** unless separately tested on hardware. The preview visuals are original procedural 3D, not official PlayStation or Xbox game footage.

Quick manual test matrix:
1. Desktop Chrome: load over localhost; select 1 player; run race; steer, brake, nitro, complete 2 laps; check score.
2. Select 2 players; confirm top/bottom 3D views, two HUD panels, both player names; control separately.
3. Switch tracks Coast/Neon/Desert and graphics presets Low/Adaptive/High.
4. iPhone 17 Safari over HTTPS: rotate landscape; Touch mode; pause/resume; verify no accidental scroll.
5. Camera Garage: allow permissions, see mirrored preview, detect one hand each side, calibrate, select Camera mode, verify fist/palm/pinch and lost tracking safety.
6. Confirm no crash on denied camera permission, slow model download, reload, backgrounding Safari or changing orientation.
