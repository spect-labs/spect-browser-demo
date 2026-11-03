interface SpectBlockResult {
  success: boolean;
  blockMode: boolean;
}

interface SpectApi {
  __spectMock?: boolean;
  blockwindow(): Promise<SpectBlockResult>;
  unblockwindow(): Promise<SpectBlockResult>;
  isBlocked(): Promise<boolean>;
  getExternalDisplayCount(): Promise<number>;
  getHiddenProcesses(): Promise<unknown[]>;
  getSuspiciousProcess(): Promise<unknown[]>;
  getStats(): Promise<Record<string, unknown>>;
  getStreamAll(): Promise<unknown[]>;
  satellite: {
    openQRCodeModal(): Promise<void>;
    closeQRCodeModal(): Promise<void>;
    getLiveStream(): Promise<string | null>;
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
