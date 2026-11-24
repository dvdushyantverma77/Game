# Moksha & Duvi — Racing Legends 3D

A **real 3D** Safari-first arcade racing game. It includes procedurally designed cars with floating player-name plates, 3 themes, AI traffic, 2-lap races, split-screen, MediaPipe hand tracking, synthetic Web Audio engine sound with mute setting, adaptive render resolution and touch/keyboard fallback.

## Requirements
- iPhone 17 Safari, landscape orientation recommended; phone stand recommended for hand mode.
- WebGL-capable browser, working internet connection for CDN-loaded Three.js and MediaPipe.
- Camera requires HTTPS (GitHub Pages) or localhost and Safari camera permission.
- This game has **no paid assets, no build step, and no Python required for GitHub Pages**.

## Upload to your existing GitHub repository
1. Extract the ZIP and **open the inner `Moksha_Duvi_Racing_Legends_3D` folder**.
2. In your existing `moksha-duvi-racing` repository, replace the old `index.html`, `style.css`, `js/`, `assets/`, manifest and README with **all contents of this folder**. Delete previous obsolete files if needed.
3. Ensure `index.html` is directly at the repository root, not nested under a folder.
4. Go to **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**. If already enabled, committing the files normally redeploys.
5. Visit `https://YOUR-USERNAME.github.io/moksha-duvi-racing/` in iPhone Safari. Hard-refresh/reopen if the old version is cached.
6. Use Touch mode first, then Camera Garage to enable camera and separately calibrate each player's hand.

GitHub Pages official directions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Windows 11 local development
From Command Prompt opened in the project folder:

```bat
py -3.11 -m http.server 8000
```

Open http://localhost:8000 on the same Windows PC. **iPhone camera will not work if you visit an unencrypted local-network http://192.168... URL; deploy to HTTPS.** You can also open the hosted Pages site directly on your Windows PC to inspect its console.

## Controls
- Touch mode: auto-accelerates. Hold left/right, BRAKE, NITRO. In two-player mode, each racer has their own buttons on their screen half.
- Keyboard: Player 1 uses A/D steer, S brake, Space nitro. Player 2 uses J/L steer, K brake, I nitro. Arrow left/right and Down also work for player 1.
- Camera: palm with 3+ extended fingers = accelerate; fist = brake; pinch thumb/index = nitro (with at least one other finger extended); move hand left/right relative to calibration center = steer.
- Camera mode intentionally brakes on lost tracking. To drive without camera, select Touch mode.
- Pause with Menu, Resume, or Escape key.

## Two-player camera caveat
One phone camera does **not** establish hand ownership. We assign hands by *mirrored camera image zones*: on-screen left is Moksha, right is Duvi. Each player's hand must remain in its own zone. Hand overlap or crossing the center will disrupt tracking. Depending on how you are facing the camera, switch physical positions to align with on-screen labels. Test with camera preview.

## Optimization and graphics
Balanced/adaptive resolution starts at 0.85 scaled DPR (capped), samples FPS every ~4 seconds, and adapts between 0.5 and 1.0 internal scale. The game uses simple original polygonal car geometry, limited geometry, no real-time shadows, capped frame delta and low-res camera inference approximately 9 FPS. Higher visual quality than 2.5D but **not photorealistic PlayStation/Xbox graphics**.

For smoother performance, try 1-player mode, Performance graphics, Touch controls, close Safari tabs, use a phone stand, avoid hot environment and turn off Low Power Mode. Camera inference runs throttled on the main thread and may still cause hitches on some Safari releases. A production game would require profiling and may benefit from a worker-capable hand-tracking pipeline.

## Internet and privacy
Camera frames are processed locally in your browser by MediaPipe. This project does not intentionally upload webcam frames, scores, or names to a server. Camera stream remains on your device. The browser downloads external libraries and the hand model from jsDelivr/Google; inspect their privacy terms if relevant. Best scores/calibration may be saved in browser localStorage.

## Troubleshooting
- Black screen: check Safari console remotely or run in Chrome desktop, network/CDN blocking, WebGL support, JavaScript enabled.
- Camera unavailable: ensure HTTPS, tap Enable Camera, allow camera permissions in Safari/iPhone settings.
- Camera model download fails: check internet; choose Touch mode and reload.
- Wrong steering: recalibrate with a centered hand, then move toward its own camera-zone edges; the preview is mirrored.
- Slow split-screen: set Performance graphics, switch Touch mode, close other tabs, ensure sufficient battery/cooling.
- Old version appears: reload Safari, clear site data if necessary; avoid uploading the extracted parent folder by mistake.
- Stuck controls: release all touch buttons and resume; pressing Menu pauses.

## Project files
```
index.html
style.css
manifest.webmanifest
.nojekyll
assets/icon.svg
js/main.js
js/world.js
js/physics.js
js/hands.js
js/audio.js
README.md
TESTING.md
```

## Credits and licensing
Original JavaScript/game artwork generated for this project. Third-party libraries are loaded from public CDNs, not included: Three.js (MIT), MediaPipe Tasks Vision (Apache 2.0). No copyrighted commercial car models or audio are redistributed.
