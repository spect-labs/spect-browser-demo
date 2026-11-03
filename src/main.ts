import './spect-mock';
import { SpectBridge } from './spect-bridge';

const chip = document.getElementById('spectChip') as HTMLElement;
const startBtn = document.getElementById('startSessionBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopSessionBtn') as HTMLButtonElement;
const connectBtn = document.getElementById('connectSatelliteBtn') as HTMLButtonElement;
const hiddenProcessBtn = document.getElementById('hiddenProcessBtn') as HTMLButtonElement;
const hiddenProcessList = document.getElementById('hiddenProcessList') as HTMLElement;
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
  hiddenProcessBtn.classList.toggle('hidden', !blocked);
  hiddenProcessList.classList.toggle('hidden', !blocked);
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
  const videoId = await SpectBridge.satellite.getLiveStream();
  const source = videoId ? (document.getElementById(videoId) as HTMLVideoElement | null) : null;
  if (!source) return;
  stopPolling();
  await SpectBridge.satellite.closeQRCodeModal();
  showSatelliteStream(source);
}

connectBtn.addEventListener('click', async function () {
  await SpectBridge.satellite.openQRCodeModal();
  stopPolling();
  pollTimer = setInterval(checkSatellite, 1500);
  checkSatellite();
});

function renderHiddenProcesses(processes: unknown[]) {
  hiddenProcessList.replaceChildren();
  if (processes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-sm opacity-70';
    empty.textContent = 'No hidden processes found.';
    hiddenProcessList.appendChild(empty);
    return;
  }
  processes.forEach(function (process) {
    const info = (process ?? {}) as { name?: string; fullPath?: string };
    const name = typeof info.name === 'string' && info.name ? info.name : 'Unnamed process';
    const fullPath = typeof info.fullPath === 'string' ? info.fullPath : '';

    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-sm';

    const body = document.createElement('div');
    body.className = 'card-body gap-2 p-4';

    const nameEl = document.createElement('h3');
    nameEl.className = 'font-semibold break-all';
    nameEl.textContent = name;

    const pathEl = document.createElement('code');
    pathEl.className = 'block rounded-box bg-base-200 px-3 py-2 font-mono text-xs break-all';
    pathEl.textContent = fullPath || '(no path)';

    body.appendChild(nameEl);
    body.appendChild(pathEl);
    card.appendChild(body);
    hiddenProcessList.appendChild(card);
  });
}

hiddenProcessBtn.addEventListener('click', async function () {
  const processes = await SpectBridge.getHiddenProcesses();
  renderHiddenProcesses(Array.isArray(processes) ? processes : []);
});
