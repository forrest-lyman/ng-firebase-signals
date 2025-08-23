import { vi } from 'vitest'

// Mock Angular core modules for testing
vi.mock('@angular/core', () => ({
  Injectable: vi.fn(),
  inject: vi.fn(),
  signal: vi.fn(),
  computed: vi.fn(),
  effect: vi.fn(),
  Signal: vi.fn(),
  WritableSignal: vi.fn(),
  ComputedSignal: vi.fn(),
  EffectRef: vi.fn()
}))

// Mock Angular common modules
vi.mock('@angular/common', () => ({
  NgIf: vi.fn(),
  NgFor: vi.fn(),
  AsyncPipe: vi.fn()
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}
