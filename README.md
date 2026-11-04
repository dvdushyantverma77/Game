# Moksha & Duvi — Ultimate Motion Racing (iPhone Safari)

A free HTML5/JavaScript mobile arcade racing prototype built on Windows and playable on iPhone 17 Safari. Three colorful **pseudo-3D / 2.5D** tracks, simultaneous split-screen, player names on the cars, computer traffic, steering, nitro, collision penalties, finish times, local high scores, original Web Audio synthesized effects, calibration and adjustable performance settings.

**Requires:** iPhone 17 with Safari; internet for the MediaPipe AI library, WASM files, and hand model; an HTTPS address for iPhone camera access; Windows 11 development computer. No Xcode or paid Apple Developer account required for this web app.

## Fastest path: test the game on Windows

1. Unzip this folder into `C:\MokshaDuvi_iPhone_Racing`.
2. Open that folder in File Explorer. Click the address bar, type `cmd`, press Enter.
3. Run `py -3.11 -m http.server 8000` (or `python -m http.server 8000` if Python launcher unavailable).
4. In Windows Chrome or Edge open `http://localhost:8000`.
5. Choose **Touch** (default), then **Start Your Engines**. On a laptop, keyboard works too.
6. For Windows webcam testing, select **Camera**, open **Calibrate**, allow the webcam, show hands, save each neutral center, then start a race.

`http://localhost` is normally permitted to use cameras as a secure development context. **Important: `http://192.168.x.x:8000` on an iPhone is NOT a secure camera context.** Do not use the LAN HTTP link for iPhone camera mode. Deploy over HTTPS instead.

## Publish to iPhone Safari with GitHub Pages (free, HTTPS)

1. Create a free account at https://github.com/ if needed.
2. On GitHub create a **new public repository** named `moksha-duvi-racing`. The game's source will be public. Do not upload secrets or personal photos.
3. Upload the **contents of this folder** at repository root (`index.html`, `app.js`, `engine.js`, `camera.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `assets/` etc.). GitHub's **Add file → Upload files** works without Git installed.
4. Open repository **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, choose branch `main` and folder `/(root)`, and Save.
5. When GitHub Pages reports the site is deployed, open its HTTPS URL on the iPhone. It generally looks like `https://YOUR-USERNAME.github.io/moksha-duvi-racing/` but copy the exact URL shown in Pages settings.
6. In Safari, first test **Touch** mode and confirm a race begins. Then return to menu, change to **Camera**. Tap **Calibrate → START CAMERA**, approve camera permission, wait for AI model to load, and set both neutral positions.
7. Keep the iPhone firmly mounted, with front camera facing the players. Do not operate while walking, cycling or driving a real vehicle.
8. Optional: Safari → Share → **Add to Home Screen** → **Open as Web App** → Add. The added icon launches the web app.

**Changes:** After editing source on your Windows PC, upload/commit the new files to the same GitHub repository. Wait for Pages to deploy; then refresh Safari. Service worker caches local shell files. For a stubborn outdated page, clear the site's Safari website data or increase `CACHE` version in `sw.js` and redeploy.

## Game menu

- **1 PLAYER:** choose Moksha or Duvi, race against moving AI traffic and improve your time.
- **2 PLAYERS:** simultaneous split-screen; Moksha vs Duvi. In landscape the race views are left and right. In portrait they are top and bottom.
- **TRACK:** Coast, Neon City, Desert. Each has distinct colors, scenery and road curves.
- **CONTROL:** Touch or Camera. Camera mode still accepts touch inputs as a fallback.
- **SETTINGS:** Low, Balanced (default), High. Sensitivity 0.5–2.2, sound volume and hand landmark display.

## Hand gestures

The frontend uses one detected hand per player and separates players by **camera zone**, not by true biometric identity:

| Camera hand action | Game action |
|---|---|
| Move wrist left/right relative to saved neutral position | Steer left/right |
| Open palm: three or four fingers extended | Accelerate |
| Closed fist | Brake |
| Pinch thumb to index finger while at least two other fingers remain extended | Nitro while accelerating |
| Hand disappears | Steer returns toward center; no acceleration |

In two-player mode, **Moksha must stay in the left half of the mirrored preview**, and **Duvi in the right half**. One phone camera may not reliably track two players at once; occlusion, lighting, tiny hands and crossing the central line may cause missed gestures or mistaken assignment. Calibration only records a neutral X position and **does not authenticate identity**.

**Calibration:** Menu → CALIBRATE → START CAMERA → allow Safari camera → place each player's open hand in their own camera half → SET MOKSHA / SET DUVI → BACK → Camera control → START. Calibration settings are saved locally in the browser. Camera preview appears only on the calibration page, not over the race.

**Touch backup:** ◀ ▶ to steer, ▲ accelerate, ▣ brake, ⚡ nitro. You can hold multiple buttons at once with multi-touch. In two-player landscape each player uses controls in their own half of screen; a fixed stand is advised.

**Windows keyboard backup:** Player 1: arrow keys to steer/gas/brake and Space for nitro. Player 2: A/D steer, W accelerate, S brake, Left Shift nitro. `P` or Esc pause, `M` main menu.

## Scoring, physics and finishes

The target is a two-lap, 5,000-distance-unit arcade race. Each car accelerates, brakes, moves sideways and slows when off-road. AI cars travel along lanes. Collisions reduce speed and subtract points. Nitro is a refillable energy bar used while accelerating. Score depends on progress, remaining nitro and crash penalties; finish time decides the winner in two-player mode. Your fastest completed time for a player and track is kept in browser local storage.

This is a stylized arcade game, not a fully simulated car or photorealistic 3D world. The rendering uses a lightweight perspective projection in Canvas 2D to prioritize smooth iPhone Safari gameplay. Performance depends on device load, camera tracking and thermal conditions. Hand detection is throttled to around 13 inferences per second while animation uses `requestAnimationFrame`.

## Audio

Music-like bleeps, acceleration tones, collisions, nitro and finish fanfares are synthesized live with browser Web Audio oscillators. No external copyrighted audio files. Safari only starts audio after tapping a button, as required by its media policy.

## Offline and privacy

Once online, the game's own HTML/CSS/JS assets are cached by a service worker where supported. **Camera AI mode still needs to load external MediaPipe resources and may not work offline**; Touch mode can work from the cached site. All video analysis runs in the browser via Google's MediaPipe WASM; this project does not contain code to upload camera frames to any server, but the third-party JavaScript and model resources must be downloaded. Permission is required, and tracks are stopped when leaving the page or using Main Menu.

## Troubleshooting

- **Nothing starts when opening index.html:** serve with `python -m http.server`, not `file://`.
- **iPhone camera unavailable / insecure context:** use a real HTTPS Pages URL. Local Wi-Fi IP over HTTP is insufficient.
- **Camera permission denied:** Safari website settings → Camera → Allow; restart or reload site.
- **Model cannot load:** check mobile/Wi-Fi internet, content blockers, VPN, Safari JavaScript and CDN access. Touch mode should continue to work without the camera AI.
- **Two hands detected as one player:** both wrist centers are in the same camera half. Move players apart and recalibrate.
- **Hand movement reversed:** check mirrored front-camera preview and recenter. In this implementation, moving to the right of the preview causes right steering.
- **Car will not accelerate:** show an open palm in camera mode, or press ▲ in Touch mode. If tracking is lost the car safely coasts.
- **Low FPS / device heats:** select Low graphics, improve lighting, avoid background tabs, disable landmark overlay, stop screen recording, use Touch mode if hand AI is too costly.
- **Two-player view too cramped:** rotate to landscape and set Safari to full screen via Add to Home Screen.
- **Sound muted:** tap a button to unlock Web Audio, then set nonzero volume and check iPhone output.
- **Cached older app:** redeploy with updated `sw.js` cache version or remove website data.

## Files

```
index.html           menus / calibration / game canvas / touch UI
styles.css           adaptive mobile UI
app.js               game state, inputs, menu events and rendering loop
engine.js            arcade physics, traffic, perspective renderer, Web Audio
camera.js            MediaPipe loader, front-camera tracking and calibration
sw.js                local web app asset caching
manifest.webmanifest iPhone Home Screen metadata
assets/              icon artwork
package.json         Node.js local test scripts (Node optional)
tests/               Node automated racing logic tests
README.md            complete setup instructions
TESTING.md           coverage and limitations
```

If Node.js is installed, run `node --test tests/*.test.js` to execute tests. Node.js is not required to play the game.
