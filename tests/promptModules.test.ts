import { describe, it, expect } from 'vitest';
import { buildModularPrompt } from '../utils/promptModules';

describe('buildModularPrompt', () => {
  it('appends module keywords to the base prompt', () => {
    const result = buildModularPrompt('base prompt', ['motion-blur', 'golden-hour']);

    expect(result.enhancedPrompt).toContain('base prompt');
    expect(result.enhancedPrompt).toContain('dynamic motion blur');
    expect(result.enhancedPrompt).toContain('golden hour lighting');
    expect(result.moduleKeywords).toHaveLength(2);
  });

  it('returns the negative prompt payload when provided', () => {
    const result = buildModularPrompt('prompt', [], 'low quality, text artifacts');
    expect(result.negativePrompt).toBe('low quality, text artifacts');
  });
});

