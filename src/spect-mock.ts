(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (!params.has('spectMock') || window.Spect) return;

  const state = {
    blocked: false,
    connected: false,
    videoEl: null as HTMLVideoElement | null,
    connectTimer: null as number | null,
    suspCount: 0
  };

  function makePhoneStream() {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 854;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let t = 0;
    (function draw() {
      t += 1;
      const hue = (t * 0.4) % 360;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, 'hsl(' + hue + ', 65%, 16%)');
      grad.addColorStop(1, 'hsl(' + ((hue + 130) % 360) + ', 65%, 32%)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2 + Math.sin(t / 42) * 110;
      const cy = canvas.height / 2 + Math.cos(t / 33) * 190;
      const blob = ctx.createRadialGradient(cx, cy, 8, cx, cy, 210);
      blob.addColorStop(0, 'rgba(255,255,255,.85)');
      blob.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(cx, cy, 210, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,.94)';
      ctx.font = '600 34px system-ui, sans-serif';
      ctx.fillText('Phone camera', canvas.width / 2, canvas.height / 2 - 26);
      ctx.font = '600 27px ui-monospace, monospace';
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 24);
      ctx.fillStyle = 'rgba(255,255,255,.62)';
      ctx.font = '500 18px system-ui, sans-serif';
      ctx.fillText('Spect Satellite · mock', canvas.width / 2, canvas.height / 2 + 60);
      requestAnimationFrame(draw);
    })();
    return canvas.captureStream(24);
  }

  function ensureVideoEl() {
    if (state.videoEl && document.body.contains(state.videoEl)) return state.videoEl.id;
    const video = document.createElement('video');
    video.id = 'spect-satellite-video-' + Date.now();
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.cssText = 'position:fixed;left:-20px;top:-20px;width:4px;height:4px;opacity:0;pointer-events:none';
    video.srcObject = makePhoneStream();
    document.body.appendChild(video);
    video.play().catch(function () { /* ignore */ });
    state.videoEl = video;
    return video.id;
  }

  window.Spect = {
    __spectMock: true,

    blockwindow: async function () {
      state.blocked = true;
      return { success: true, blockMode: true };
    },

    unblockwindow: async function () {
      state.blocked = false;
      return { success: true, blockMode: false };
    },

    isBlocked: async function () {
      return state.blocked;
    },

    getExternalDisplayCount: async function () {
      return 0;
    },

    getHiddenProcesses: async function () {
      return [];
    },

    getSuspiciousProcess: async function () {
      const mode = params.get('mockSuspicious');
      if (mode === '1') return [{ pid: 4242, name: 'overlay-helper' }];
      if (mode === 'escalate') {
        state.suspCount = (state.suspCount || 0) + 1;
        return [{ pid: 1000 + state.suspCount, name: 'overlay-tool-' + state.suspCount }];
      }
      return [];
    },

    getStats: async function () {
      return { OS: navigator.platform || 'unknown', browser: 'Spect (mock)', memory: { total: (navigator as any).deviceMemory || 8 } };
    },

    getStreamAll: async function () {
      return [];
    },

    satellite: {
      openQRCodeModal: async function () {
        if (state.connected || state.connectTimer) return;
        state.connectTimer = setTimeout(function () {
          state.connected = true;
          state.connectTimer = null;
        }, 6000);
      },

      closeQRCodeModal: async function () {
        if (state.connectTimer) {
          clearTimeout(state.connectTimer);
          state.connectTimer = null;
        }
      },

      getLiveStream: async function () {
        if (!state.connected) return null;
        return ensureVideoEl();
      },

      getStreamUrl: async function () {
        return 'http://127.0.0.1:8888/live/stream.flv';
      }
    }
  };
})();
