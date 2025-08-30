import { webcrypto } from 'node:crypto';
import 'fake-indexeddb/auto';

// Polyfill crypto for uid()
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
