function warn(name: string, err: any) {
  console.warn('[SpectBridge] ' + name + ' failed:', err && err.message ? err.message : err);
}

export class Spect {
  get available(): boolean {
    const s = window.Spect;
    return !!(s && typeof s.blockwindow === 'function');
  }

  get mock(): boolean {
    return this.available && !!window.Spect?.__spectMock;
  }

  refresh(): boolean {
    return this.available;
  }

  blockWindow(): Promise<SpectBlockResult | null> {
    return this.call('blockwindow');
  }

  unblockWindow(): Promise<SpectBlockResult | null> {
    return this.call('unblockwindow');
  }

  isBlocked(): Promise<boolean | null> {
    return this.call('isBlocked');
  }

  getQRCode(): Promise<SpectQRCode | null> {
    return this.call('getQRCode');
  }

  getHiddenProcesses(): Promise<unknown[] | null> {
    return this.call('getHiddenProcesses');
  }

  getSuspiciousProcess(): Promise<unknown[] | null> {
    return this.call('getSuspiciousProcess');
  }

  getStats(): Promise<Record<string, unknown> | null> {
    return this.call('getStats');
  }

  getStreamAll(): Promise<unknown[] | null> {
    return this.call('getStreamAll');
  }

  readonly display = {
    getDisplays: (): Promise<unknown[] | null> => this.call('display.getDisplays'),
    getDisplaysAndSources: (): Promise<unknown[] | null> => this.call('display.getDisplaysAndSources')
  };

  readonly satellite = {
    getLiveStream: (): Promise<string | null> => this.callSatellite('getLiveStream'),
    getStreams: (): Promise<unknown[] | null> => this.callSatellite('getStreams'),
    getStreamUrl: (): Promise<string | null> => this.callSatellite('getStreamUrl')
  };

  private get root(): any {
    return window.Spect;
  }

  private async call(name: string, args?: any[]): Promise<any> {
    const root = this.root;
    if (!root || typeof root[name] !== 'function') return null;
    try {
      return await root[name].apply(root, args || []);
    } catch (err) {
      warn(name, err);
      return null;
    }
  }

  private async callSatellite(name: string, args?: any[]): Promise<any> {
    const sat = this.root && this.root.satellite;
    if (!sat || typeof sat[name] !== 'function') return null;
    try {
      return await sat[name].apply(sat, args || []);
    } catch (err) {
      warn('satellite.' + name, err);
      return null;
    }
  }
}

export const SpectBridge = new Spect();
window.SpectBridge = SpectBridge;
