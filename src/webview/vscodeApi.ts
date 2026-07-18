import type { WebviewToHostMessage } from '../shared/messages';

interface VsCodeApi {
  postMessage(message: WebviewToHostMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

function createVsCodeApi(): VsCodeApi {
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi();
  }

  return {
    postMessage(message: WebviewToHostMessage) {
      console.log('[vscodeApi:fallback] postMessage', message);
    },
    getState() {
      return undefined;
    },
    setState() {
      /* no-op fallback for non-VSCode environments (tests, storybook, etc.) */
    }
  };
}

export const vscodeApi = createVsCodeApi();
