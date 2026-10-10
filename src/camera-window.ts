import { Store } from './store';

function createCameraWindows() {

  const LAYOUT_KEY = 'spectdemo.layout';
  const MARGIN = 20;

  function loadLayouts() {
    try {
      return JSON.parse(localStorage.getItem(LAYOUT_KEY) as string) || {};
    } catch (e) {
      return {};
    }
  }

  let layouts = loadLayouts();

  function persist(id: string, data: any) {
    layouts[id] = data;
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts)); } catch (e) { /* ignore */ }
  }

  function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }

  function layer() {
    let el = document.getElementById('camLayer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'camLayer';
      el.className = 'cam-layer';
      document.body.appendChild(el);
    }
    return el;
  }

  class CameraWindow {
    opts: any;
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    collapsed: boolean;
    visible: boolean;
    stream: MediaStream | null;
    adopted: HTMLElement | null;
    status: string;
    el!: HTMLElement;
    body!: HTMLElement;
    video!: HTMLVideoElement;
    statusText!: HTMLElement;

    constructor(opts: any) {
      this.opts = Object.assign({
        id: 'cam',
        title: 'Camera',
        subtitle: '',
        width: 300,
        height: 225,
        aspect: 4 / 3,
        mirror: false,
        dock: 'right-center'
      }, opts);

      this.id = this.opts.id;
      this.x = 0;
      this.y = 0;
      this.w = this.opts.width;
      this.h = this.opts.height;
      this.collapsed = false;
      this.visible = true;
      this.stream = null;
      this.adopted = null;
      this.status = 'idle';

      this.build();

      const saved = layouts[this.id];
      if (saved) {
        this.apply(saved);
      } else {
        this.dock(this.opts.dock);
      }
      this.place();

      window.addEventListener('resize', this.onViewportResize);
    }

    build() {
      const el = document.createElement('section');
      el.className = 'cam-window';
      el.dataset.id = this.id;
      el.innerHTML =
        '<header class="cam-window__header">' +
        '  <span class="cam-window__rec"></span>' +
        '  <div class="cam-window__titles">' +
        '    <span class="cam-window__title">' + Store.esc(this.opts.title) + '</span>' +
        (this.opts.subtitle ? '<span class="cam-window__subtitle">' + Store.esc(this.opts.subtitle) + '</span>' : '') +
        '  </div>' +
        '  <div class="cam-window__actions">' +
        '    <button class="cam-window__btn" data-action="mirror" title="Mirror">⇋</button>' +
        '    <button class="cam-window__btn" data-action="collapse" title="Minimise">—</button>' +
        '    <button class="cam-window__btn" data-action="hide" title="Hide">✕</button>' +
        '  </div>' +
        '</header>' +
        '<div class="cam-window__body">' +
        '  <video autoplay muted playsinline></video>' +
        '  <div class="cam-window__status"><span class="cam-window__status-text">Starting…</span></div>' +
        '</div>' +
        '<div class="cam-window__resize" title="Resize"></div>';
      this.el = el;
      this.body = el.querySelector('.cam-window__body') as HTMLElement;
      this.video = el.querySelector('video') as HTMLVideoElement;
      this.statusText = el.querySelector('.cam-window__status-text') as HTMLElement;
      this.el.classList.toggle('is-mirrored', !!this.opts.mirror);

      if (this.opts.hiddenByDefault) {
        this.visible = false;
        this.el.style.display = 'none';
      }

      layer().appendChild(el);
      this.bindDrag();
      this.bindResize();
      this.bindActions();
    }

    bindActions() {
      this.el.addEventListener('click', (event) => {
        const btn = (event.target as HTMLElement).closest('[data-action]') as HTMLElement;
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'mirror') {
          this.setMirror(!this.el.classList.contains('is-mirrored'));
        } else if (action === 'collapse') {
          this.toggleCollapse();
        } else if (action === 'hide') {
          this.hide();
          if (typeof this.opts.onVisibilityChange === 'function') this.opts.onVisibilityChange(this);
        }
      });
      const header = this.el.querySelector('.cam-window__header') as HTMLElement;
      header.addEventListener('dblclick', (event) => {
        if (!(event.target as HTMLElement).closest('button')) this.toggleCollapse();
      });
    }

    bindDrag() {
      const header = this.el.querySelector('.cam-window__header') as HTMLElement;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let originX = 0;
      let originY = 0;

      header.addEventListener('pointerdown', (event) => {
        if ((event.target as HTMLElement).closest('button')) return;
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        originX = this.x;
        originY = this.y;
        header.setPointerCapture(event.pointerId);
        this.el.classList.add('is-dragging');
      });

      header.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const nextX = originX + (event.clientX - startX);
        const nextY = originY + (event.clientY - startY);
        this.x = clamp(nextX, -(this.w - 90), window.innerWidth - 70);
        this.y = clamp(nextY, 6, window.innerHeight - 44);
        this.place();
      });

      const end = () => {
        if (!dragging) return;
        dragging = false;
        this.el.classList.remove('is-dragging');
        this.snap();
        this.save();
      };

      header.addEventListener('pointerup', end);
      header.addEventListener('pointercancel', end);
    }

    bindResize() {
      const handle = this.el.querySelector('.cam-window__resize') as HTMLElement;
      let resizing = false;
      let startX = 0;
      let startY = 0;
      let startW = 0;
      let startH = 0;

      handle.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        resizing = true;
        startX = event.clientX;
        startY = event.clientY;
        startW = this.w;
        startH = this.h;
        handle.setPointerCapture(event.pointerId);
        this.el.classList.add('is-resizing');
      });

      handle.addEventListener('pointermove', (event) => {
        if (!resizing) return;
        const maxW = window.innerWidth - 16;
        const maxH = window.innerHeight - 16;
        let w = clamp(startW + (event.clientX - startX), 150, maxW);
        let h = clamp(startH + (event.clientY - startY), 110, maxH);
        if (event.shiftKey) {
          const ratio = startW / startH;
          h = clamp(w / ratio, 110, maxH);
        }
        this.w = w;
        this.h = h;
        this.place();
      });

      const end = () => {
        if (!resizing) return;
        resizing = false;
        this.el.classList.remove('is-resizing');
        this.snap();
        this.save();
      };

      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    }

    onViewportResize() {
      this.x = clamp(this.x, -(this.w - 90), window.innerWidth - 70);
      this.y = clamp(this.y, 6, window.innerHeight - 44);
      this.place();
    }

    place() {
      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
      this.el.style.width = this.w + 'px';
      this.el.style.height = this.collapsed ? 'auto' : this.h + 'px';
    }

    snap() {
      const SNAP = 26;
      const maxX = window.innerWidth - this.w - 12;
      const maxY = window.innerHeight - this.h - 12;
      if (Math.abs(this.x - MARGIN) < SNAP) this.x = MARGIN;
      if (Math.abs(this.x - maxX) < SNAP) this.x = maxX;
      if (Math.abs(this.y - MARGIN) < SNAP) this.y = MARGIN;
      if (Math.abs(this.y - maxY) < SNAP) this.y = maxY;
      this.x = clamp(this.x, -(this.w - 90), window.innerWidth - 70);
      this.y = clamp(this.y, 6, window.innerHeight - 44);
      this.place();
    }

    dock(preset: string) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x: Record<string, number> = {
        'left-top': MARGIN,
        'left-center': MARGIN,
        'left-bottom': MARGIN,
        'right-top': vw - this.w - MARGIN,
        'right-center': vw - this.w - MARGIN,
        'right-bottom': vw - this.w - MARGIN,
        center: (vw - this.w) / 2
      };
      const y: Record<string, number> = {
        'left-top': 84,
        'left-center': (vh - this.h) / 2,
        'left-bottom': vh - this.h - 104,
        'right-top': 84,
        'right-center': (vh - this.h) / 2,
        'right-bottom': vh - this.h - 104,
        center: (vh - this.h) / 2
      };
      this.x = clamp(x[preset] !== undefined ? x[preset] : x['right-center'], 8, Math.max(8, vw - this.w - 8));
      this.y = clamp(y[preset] !== undefined ? y[preset] : y['right-center'], 8, Math.max(8, vh - this.h - 8));
      this.place();
      this.save();
    }

    apply(saved: any) {
      this.x = saved.x || 0;
      this.y = saved.y || 0;
      if (saved.w) this.w = saved.w;
      if (saved.h) this.h = saved.h;
      if (saved.collapsed) this.collapsed = true;
      if (typeof saved.visible === 'boolean') this.visible = saved.visible;
      this.x = clamp(this.x, -(this.w - 90), Math.max(8, window.innerWidth - 70));
      this.y = clamp(this.y, 6, Math.max(8, window.innerHeight - 44));
      this.el.classList.toggle('is-collapsed', this.collapsed);
      this.el.style.display = this.visible ? '' : 'none';
    }

    save() {
      persist(this.id, {
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        collapsed: this.collapsed,
        visible: this.visible
      });
    }

    reset() {
      this.collapsed = false;
      this.visible = true;
      this.w = this.opts.width;
      this.h = this.opts.height;
      this.el.classList.remove('is-collapsed');
      this.el.style.display = '';
      this.dock(this.opts.dock);
    }

    setMirror(on: boolean) {
      this.el.classList.toggle('is-mirrored', on);
    }

    setStream(stream: MediaStream) {
      if (this.adopted) {
        this.adopted.remove();
        this.adopted = null;
        this.body.appendChild(this.video);
      }
      this.stream = stream;
      this.video.srcObject = stream;
      this.video.play().catch(function () { /* autoplay guard */ });
      this.setLive();
    }

    adoptElement(el: any) {
      if (this.adopted === el) return;
      if (this.adopted) this.adopted.remove();
      this.video.remove();
      el.classList.add('cam-window__native-video');
      this.body.appendChild(el);
      this.adopted = el;
      const play = el.play();
      if (play && play.catch) play.catch(function () { /* ignore */ });
      this.setLive();
    }

    setStatus(kind: string, text: string) {
      this.status = kind;
      this.el.dataset.status = kind;
      if (this.statusText) this.statusText.textContent = text || '';
    }

    setLive() {
      this.setStatus('live', '');
    }

    activeElement() {
      return this.adopted || this.video;
    }

    show() {
      this.visible = true;
      this.el.style.display = '';
      this.save();
    }

    hide() {
      this.visible = false;
      this.el.style.display = 'none';
      this.save();
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
      return this.visible;
    }

    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.el.classList.toggle('is-collapsed', this.collapsed);
      this.place();
      this.save();
    }

    destroy() {
      window.removeEventListener('resize', this.onViewportResize);
      if (this.stream) {
        this.stream.getTracks().forEach(function (track) { track.stop(); });
      }
      this.el.remove();
    }
  }

  const manager = {
    windows: {} as Record<string, CameraWindow>,

    create(opts: any) {
      const win = new CameraWindow(opts);
      this.windows[opts.id] = win;
      return win;
    },

    get(id: string) {
      return this.windows[id];
    },

    each(fn: (win: CameraWindow, id: string) => void) {
      Object.keys(this.windows).forEach((id) => fn(this.windows[id], id));
    },

    resetLayout() {
      layouts = {};
      try { localStorage.removeItem(LAYOUT_KEY); } catch (e) { /* ignore */ }
      this.each(function (win) { win.reset(); });
    },

    hideAll() {
      this.each(function (win) { win.hide(); });
    },

    showAll() {
      this.each(function (win) { win.show(); });
    }
  };

  window.CameraWindows = manager;

  return manager;
}

export const CameraWindows = createCameraWindows();
