import { describe, it, expect } from 'vitest';
import { reorderJobList, resolveJobSettings } from '../utils/batchQueueHelpers';
import { BatchJob, ImageModel } from '../types';

const makeJob = (id: string, overrides?: BatchJob['overrides']): BatchJob => ({
  id,
  prompt: `Prompt ${id}`,
  model: ImageModel.IMAGEN,
  settings: { aspectRatio: '16:9', numberOfImages: 2, model: ImageModel.IMAGEN },
  status: 'pending',
  createdAt: Date.now(),
  overrides,
});

describe('batchQueueHelpers', () => {
  it('reorders jobs when dragging', () => {
    const jobs = [makeJob('a'), makeJob('b'), makeJob('c')];
    const reordered = reorderJobList(jobs, 'a', 'c');
    expect(reordered.map((j) => j.id)).toEqual(['b', 'c', 'a']);
  });

  it('falls back to default settings when overrides missing', () => {
    const job = makeJob('a');
    const settings = resolveJobSettings(job);
    expect(settings.aspectRatio).toBe('16:9');
    expect(settings.numberOfImages).toBe(2);
  });

  it('applies overrides when provided', () => {
    const job = makeJob('a', { aspectRatio: '1:1', numberOfImages: 4 });
    const settings = resolveJobSettings(job);
    expect(settings.aspectRatio).toBe('1:1');
    expect(settings.numberOfImages).toBe(4);
  });
});

