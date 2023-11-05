import { uniq, split, times, chain, pluck, filter, descend, prop, sortBy, reverse, pipe } from 'ramda';
import { SuffixTree } from '@/util/suffix-tree';

export function matches(substring: string, value: string): RegExpMatchArray[] {
    return [...value.matchAll(new RegExp(substring, 'g'))];
}

export function matchLength(substring: string, value: string): number {
    return matches(substring, value).length;
}

/**
 * Provides all unique symbols in given string.
 */
export function symbols(value: string): string[] {
    return uniq(split('', value));
}

/**
 * Provides all prefixes of given string (including the string itself).
 */
export function prefixes(value: string): string[] {
    return times((i) => value.substring(0, i + 1), value.length);
}

/**
 * Provides the longest repeating substring in given string.
 */
export function longestRepeatedSubstring(value: string): string {
    const longestSubstring = new SuffixTree(value).node.getLongestRepeatedSubString();

    return longestSubstring;
}

/**
 * Provides all substrings with multiple occurences in given string, sorted by length. Note that occurences of one
 * substring can overlap.
 */
export function repeatedSubstrings(value: string): string[] {
    const suffixes = new SuffixTree(value).node.getAllRepeatedSubSuffixes();

    return pipe<string[][], string[], string[], string[], string[]>(
        chain(prefixes),
        uniq,
        sortBy(prop('length')),
        reverse
    )(suffixes);
}

/**
 * Provides all substrings with multiple occurences in given string. Occurences of one substring are filtered.
 * Occurences of different substrings can still overlap.
 */
export function repeatedSubstringsWithoutOverlap(value: string): string[] {
    return filter((substring) => substringIndexes(substring, value).length > 1, repeatedSubstrings(value));
}

/**
 * Provides indexes for all occurences of given substring. Note that usage of a global `RegExp` ensures that overlapping
 * substrings are disregarded.
 */
export function substringIndexes(substring: string, value: string): number[] {
    return pluck('index', matches(substring, value)) as number[];
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('can provide the longest common substring in a string', () => {
        expect(longestRepeatedSubstring('BANANA')).toBe('ANA');
        expect(longestRepeatedSubstring('MISSISSIPPI')).toBe('ISSI');
    });

    it('can provide all prefixes', () => {
        expect(prefixes('QUUX')).toStrictEqual(['Q', 'QU', 'QUU', 'QUUX']);
    });

    it('can provide indexes of a substring', () => {
        expect(substringIndexes('AN', 'BANANA')).toStrictEqual([1, 3]);
        expect(substringIndexes('SSI', 'MISSISSIPPI')).toStrictEqual([2, 5]);
    });

    it('can find all repeated substrings in a string', () => {
        expect(repeatedSubstrings('BANANA')).toStrictEqual(['ANA', 'NA', 'AN', 'N', 'A']);
        expect(repeatedSubstrings('MISSISSIPPI')).toStrictEqual([
            'ISSI',
            'ISS',
            'SSI',
            'IS',
            'SI',
            'SS',
            'P',
            'I',
            'S'
        ]);
    });

    it('can find all repeated substrings without overlaps', () => {
        expect(repeatedSubstringsWithoutOverlap('BANANA')).toStrictEqual(['NA', 'AN', 'N', 'A']);
        expect(repeatedSubstringsWithoutOverlap('MISSISSIPPI')).toStrictEqual([
            'ISS',
            'SSI',
            'IS',
            'SI',
            'SS',
            'P',
            'I',
            'S'
        ]);
    });
}
