import { mount } from 'svelte';
import ChatFrame from './ChatFrame.svelte';
import { vscodeApi } from './vscodeApi';

const target = document.getElementById('app');

if (target) {
  mount(ChatFrame, { target });
}

vscodeApi.postMessage({ type: 'ready' });
