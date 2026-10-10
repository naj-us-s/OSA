/**
 * First frontend unit test (§10): utility used to render dashboard stat tiles.
 * More meaningful component tests (React Testing Library) come with the Tasks
 * screen milestone, once the form exists to test.
 */

// Extracted from App.tsx for testability: dashboard scale labels.
export function scaleLabel(n: number): string {
  if (n < 0) throw new RangeError('counts cannot be negative');
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}k`;
}

describe('scaleLabel', () => {
  it('renders small numbers as-is', () => {
    expect(scaleLabel(0)).toBe('0');
    expect(scaleLabel(42)).toBe('42');
  });
  it('abbreviates large counts', () => {
    expect(scaleLabel(1234)).toBe('1.2k');
  });
  it('rejects nonsense input rather than rendering it', () => {
    expect(() => scaleLabel(-1)).toThrow(RangeError);
  });
});
