import './spect-mock';
import { SpectBridge } from './spect-bridge';

const chip = document.getElementById('spectChip') as HTMLElement;
const startBtn = document.getElementById('startSessionBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopSessionBtn') as HTMLButtonElement;
const connectBtn = document.getElementById('connectSatelliteBtn') as HTMLButtonElement;
const sessionInfo = document.getElementById('sessionInfo') as HTMLElement;
const satellitePanel = document.getElementById('satellitePanel') as HTMLElement;
const satellitePlayer = document.getElementById('satellitePlayer') as HTMLElement;

const hasSpect = SpectBridge.refresh();

chip.textContent = hasSpect ? 'Spect Browser' : 'Standard Browser';
chip.classList.add(hasSpect ? 'badge-success' : 'badge-warning');
chip.classList.add(hasSpect ? 'border-success' : 'border-warning');
chip.classList.remove('hidden');

function syncButtons(blocked: boolean) {
  startBtn.disabled = blocked || !SpectBridge.available;
  stopBtn.disabled = !blocked || !SpectBridge.available;
  sessionInfo.classList.toggle('hidden', !blocked);
  connectBtn.classList.toggle('hidden', !blocked);
}

if (SpectBridge.available) {
  SpectBridge.isBlocked().then(function (blocked) {
    syncButtons(!!blocked);
  });
} else {
  syncButtons(false);
}

startBtn.addEventListener('click', async function () {
  const res = await SpectBridge.blockWindow();
  if (res && res.success) syncButtons(true);
});

stopBtn.addEventListener('click', async function () {
  const res = await SpectBridge.unblockWindow();
  if (res && res.success) syncButtons(false);
});

let pollTimer: number | null = null;

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function showSatelliteStream(source: HTMLVideoElement) {
  source.style.cssText = '';
  source.className = 'w-full rounded-box bg-base-300';
  satellitePlayer.replaceChildren(source);
  satellitePanel.classList.remove('hidden');
  source.play().catch(function () {});
}

async function checkSatellite() {
  const streams = await SpectBridge.satellite.getStreams();
  if (!Array.isArray(streams) || streams.length === 0) return;
  stopPolling();
  const videoId = await SpectBridge.satellite.getLiveStream();
  const source = videoId ? (document.getElementById(videoId) as HTMLVideoElement | null) : null;
  if (!source) return;
  showSatelliteStream(source);
}

connectBtn.addEventListener('click', async function () {
  await SpectBridge.getQRCode();
  stopPolling();
  pollTimer = setInterval(checkSatellite, 1500);
  checkSatellite();
});
