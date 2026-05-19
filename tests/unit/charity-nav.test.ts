import { describe, it, expect } from 'vitest';
import { scoreToStars } from '../../scripts/lib/charity-nav';

describe('scoreToStars', () => {
  it('returns 4 stars for score >= 90', () => {
    expect(scoreToStars(90)).toBe(4);
    expect(scoreToStars(100)).toBe(4);
  });

  it('returns 3 stars for score 75–89', () => {
    expect(scoreToStars(75)).toBe(3);
    expect(scoreToStars(89)).toBe(3);
  });

  it('returns 2 stars for score 60–74', () => {
    expect(scoreToStars(60)).toBe(2);
    expect(scoreToStars(74)).toBe(2);
  });

  it('returns 1 star for score < 60', () => {
    expect(scoreToStars(59)).toBe(1);
    expect(scoreToStars(0)).toBe(1);
  });
});
