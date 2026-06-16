import { initialsOf } from './initials';

describe('initialsOf', () => {
  it('returns two-letter initials for a full name', () => {
    expect(initialsOf('Ada Lovelace')).toBe('AL');
  });

  it('returns a single letter for a single-word name', () => {
    expect(initialsOf('Ada')).toBe('A');
  });

  it('caps at the first two name parts', () => {
    expect(initialsOf('Ada Augusta King-Noel')).toBe('AA');
  });

  it('uppercases the letters regardless of input case', () => {
    expect(initialsOf('grace hopper')).toBe('GH');
  });

  it('collapses extra whitespace between parts', () => {
    expect(initialsOf('  Ada   Lovelace  ')).toBe('AL');
  });

  it('falls back to "?" for empty input', () => {
    expect(initialsOf('')).toBe('?');
    expect(initialsOf('   ')).toBe('?');
  });
});
