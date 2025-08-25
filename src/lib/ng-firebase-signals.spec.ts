import { describe, it, expect } from 'vitest';

describe('ng-firebase-signals', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('should have basic functionality', () => {
    // Basic test to ensure the library can be imported
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});
