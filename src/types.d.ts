interface SpectBlockResult {
  success: boolean;
  blockMode: boolean;
}

interface SpectQRCode {
  url: string;
  qrCode: string;
}

interface SpectApi {
  __spectMock?: boolean;
  blockwindow(): Promise<SpectBlockResult>;
  unblockwindow(): Promise<SpectBlockResult>;
  isBlocked(): Promise<boolean>;
  getQRCode(): Promise<SpectQRCode>;
  getHiddenProcesses(): Promise<unknown[]>;
  getSuspiciousProcess(): Promise<unknown[]>;
  getStats(): Promise<Record<string, unknown>>;
  getStreamAll(): Promise<unknown[]>;
  getDisplays?(): Promise<unknown[]>;
  getDisplaysAndSources?(): Promise<unknown[]>;
  satellite: {
    getLiveStream(): Promise<string | null>;
    getStreams(): Promise<unknown[]>;
    getStreamUrl(): Promise<string>;
  };
}

interface Window {
  Spect?: SpectApi;
  Store?: unknown;
  SpectBridge?: unknown;
  CameraWindows?: unknown;
  TEST_META?: unknown;
  QUESTIONS?: unknown;
}
