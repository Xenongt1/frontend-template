import '@testing-library/jest-dom';
import '@/core/i18n';
import { TextDecoder, TextEncoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0;
  (globalThis.crypto as { randomUUID: () => string }).randomUUID = () =>
    `test-uuid-${++counter}-${Date.now()}`;
}
