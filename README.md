# Spect Browser — a TestGorilla-style proctored assessment on the Spect Browser API

A complete demo of a pre-employment testing site (modelled on TestGorilla) that uses the **Spect Browser API** for
proctoring plus **standard web APIs** (`getUserMedia`, Fullscreen, MediaRecorder, Page Visibility) for everything else.

When the test starts:

- the **laptop webcam** appears as a floating window on the **right side** and records the whole attempt (MediaRecorder),
- the **phone camera** streams live from the **bottom-left** through **Spect Satellite** (pair it by scanning the QR
  code from `window.Spect.getQRCode()`),
- both camera windows can be **toggled** (show/hide/minimise), **dragged anywhere**, **resized** (drag the corner or
  hold `Shift` to keep the aspect ratio), **swapped side-to-side** or **reset to the default layout** — their position
  is remembered between sessions,
- Spect’s **window blocking** locks the browser against tab/app switching, and the page continuously polls
  `isBlocked()`, `getSuspiciousProcess()` and `getHiddenProcesses()` for proctoring violations.

## Quick start

```bash
node server.js            # serves the site on http://localhost:5500
# or: python3 -m http.server 5500
```

Then open `http://localhost:5500` **in the Spect Browser**.

> Spect itself runs local servers on ports **8888** and **1935** — don’t run anything of your own on those.

### Mock mode (no Spect Browser required)

Append `?spectMock=1` to any URL to load a built-in mock of `window.Spect`: a fake QR code, a fake phone camera
stream (animated canvas), a simulated satellite connection that “connects” ~6 s after the QR is shown, and no-op
process monitors. Useful for previewing the flow in Chrome/Firefox.
Add `&mockSuspicious=1` to simulate a suspicious process being detected (triggers a proctoring warning).

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | System check (webcam preview + mic meter), Spect detection, start button |
| `test.html` | The assessment: 14 questions in 4 sections, 15-minute timer, question navigator, flagging, keyboard shortcuts (`1`–`4`, `←`/`→`, `F`), full proctoring |
| `results.html` | Score ring, section breakdown, answer review with explanations, proctoring timeline, webcam recording playback + download |

## Spect API coverage

| API | Where it is used |
| --- | --- |
| `Spect.blockwindow()` | Lockdown is engaged when the test starts and re-engaged if it drops |
| `Spect.unblockwindow()` | Released on submit / termination |
| `Spect.isBlocked()` | Polled every 5 s; being unblocked during the test is a high-severity violation |
| `Spect.getQRCode()` | Pairing modal — QR image + URL, with polling for the connection |
| `Spect.satellite.getStreams()` | Detects an already-paired phone and watches for disconnects |
| `Spect.satellite.getLiveStream()` | Attaches the live phone video (via `captureStream()`, falling back to adopting the native `<video>` element) |
| `Spect.satellite.getStreamUrl()` | Available through the bridge for FLV playback fallbacks |
| `Spect.getSuspiciousProcess()` | Polled every 5 s — any click-through/capture-hidden process is a high-severity violation |
| `Spect.getHiddenProcesses()` | Polled and recorded in the proctoring log |
| `Spect.getStats()`, `Spect.display.*`, `Spect.getStreamAll()` | Exposed through `js/spect-bridge.js` for further extension |

All Spect calls go through `js/spect-bridge.js`, which feature-detects the API and fails soft (the demo still runs,
in “limited mode”, in a normal browser).

## Proctoring model

- 3 warnings end the attempt automatically (warning modal + event log).
- Violations detected: tab switch (Page Visibility), focus loss, full-screen exit, back navigation, blocked-copy
  attempts, protection disabled, suspicious processes.
- Every event is timestamped and shown on the results page timeline.
- The webcam recording is stored locally in IndexedDB and playable/downloadable on the results page. (In production
  you would upload it to your assessment dashboard instead.)

## Project layout

```
index.html / test.html / results.html   pages
server.js                               zero-dependency static server
css/  base, setup, test, results        styles
js/
  store.js            state, event log, IndexedDB recording storage
  spect-bridge.js     feature-detected wrapper around window.Spect
  spect-mock.js       mock Spect API for ?spectMock=1
  ui.js               toasts + modal helpers
  camera-window.js    draggable/resizable/toggleable floating camera windows
  questions.js        question bank + test metadata
  setup.js / test.js / results.js   page logic
assets/logo.png
```

## Notes & limitations

- Scoring happens client-side (the answer key ships with the demo); a real deployment would score server-side.
- The satellite stream is consumed as Spect exposes it (`captureStream()` on the native element, or by adopting the
  element itself) — no FLV library is bundled.
- Camera/screen permissions are entirely local; nothing is uploaded anywhere.
