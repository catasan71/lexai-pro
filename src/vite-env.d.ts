/// <reference types="vite/client" />

interface Window {
  mammoth?: {
    extractRawText(opts: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
  };
}
