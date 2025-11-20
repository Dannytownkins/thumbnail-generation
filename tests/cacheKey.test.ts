import { describe, it, expect } from 'vitest';
import { computeCacheKey } from '../utils/cacheKey';

const samplePayload = {
  prompt: 'Can-Am Ryker shredding through neon streets',
  model: 'imagen-4.0-generate-001',
  aspectRatio: '16:9',
  modules: ['neon-glow', 'high-speed'],
};

describe('computeCacheKey', () => {
  it('returns the same hash for equivalent payloads', async () => {
    const keyOne = await computeCacheKey(samplePayload);
    const keyTwo = await computeCacheKey({ ...samplePayload });
    expect(keyOne).toBe(keyTwo);
  });

  it('returns different hashes when payload changes', async () => {
    const keyOne = await computeCacheKey(samplePayload);
    const keyTwo = await computeCacheKey({ ...samplePayload, aspectRatio: '1:1' });
    expect(keyOne).not.toBe(keyTwo);
  });
});

