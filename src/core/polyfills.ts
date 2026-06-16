// Browsers expose `crypto.randomUUID()` only in a secure context (HTTPS or
// localhost). When the app is reached over plain HTTP (LAN IPs, the test
// ALB at chainpilot-test-alb-…amazonaws.com, etc.) the API is undefined
// and any caller throws. Provide a best-effort RFC 4122 v4 fallback using
// getRandomValues — which IS available in insecure contexts — so the rest
// of the app keeps working until the deployment is fronted by HTTPS.

if (typeof globalThis.crypto === 'undefined') {
  // Extremely unlikely in any real browser; included for safety.
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  (globalThis.crypto as { randomUUID: () => string }).randomUUID = () => {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  };
}

export {};
