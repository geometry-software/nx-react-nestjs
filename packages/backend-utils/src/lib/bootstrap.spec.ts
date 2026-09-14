import { describe, expect, it } from 'vitest';
import { readPort } from './bootstrap/read-port.js';

describe('readPort', () => {
  it('uses the fallback when no environment value is provided', () => {
    expect(readPort(undefined, 3001)).toBe(3001);
  });

  it('accepts valid TCP ports', () => {
    expect(readPort('4201', 3001)).toBe(4201);
  });

  it('rejects invalid port values', () => {
    expect(() => readPort('not-a-port', 3001)).toThrow('Invalid port');
    expect(() => readPort('70000', 3001)).toThrow('Invalid port');
  });
});
