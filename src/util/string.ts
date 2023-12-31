import { Char, ExtendedChar, IndexedSymbol } from '@/type/common';
import { SuffixTree } from '@/util/suffix-tree';
import {
    add,
    addIndex,
    chain,
    filter,
    join,
    last,
    map,
    pipe,
    pluck,
    prop,
    reduce,
    reverse,
    sortBy,
    split,
    times,
    uniq,
    values
} from 'ramda';

export const collapse = join('');
export const expand = split('') as (str: string) => Char[];

/**
 * Calculates the Shannon entropy for given string.
 *
 * https://gist.github.com/jabney/5018b4adc9b2bf488696
 */
export function entropy(value: string) {
    type Frequencies = { [c: string]: number };

    const len = value.length;

    const frequencies: Frequencies = reduce(
        (freq: Frequencies, c: string): Frequencies => ({ ...freq, [c]: (freq[c] || 0) + 1 }),
        {},
        expand(value)
    );

    // sum the frequency of each character
    return reduce((sum, f) => sum - (f / len) * Math.log2(f / len), 0, values(frequencies));
}

export function matches(substring: string, value: string): RegExpMatchArray[] {
    return [...value.matchAll(new RegExp(substring, 'g'))];
}

export function matchLength(substring: string, value: string): number {
    return matches(substring, value).length;
}

export function nextOrPrevSymbols(anchor: Char, value: string, next: boolean): ExtendedChar[] {
    const anchors: IndexedSymbol[] = filter(
        (e) => e.symbol === anchor,
        // @ts-ignore
        mapI((symbol: ExtendedChar, position: number) => ({ symbol, position }), expand(value)) as IndexedSymbol[]
    );

    const relativeIndexes: number[] = filter(
        (index: number) => 0 <= index && index < value.length,
        map(add(next ? 1 : -1), pluck('position', anchors))
    );

    return uniq(map((index) => value[index], relativeIndexes) as ExtendedChar[]);
}

/**
 * Provides all unique symbols in given string.
 */
export function symbols(value: string): Char[] {
    return uniq(expand(value) as Char[]);
}

/**
 * Provides the symbols in order.
 */
export function symbolsInOrder(value: string): string[] {
    return reduce(
        (acc: string[], val: string): string[] => (last(acc) === val ? acc : [...acc, val]),
        [],
        expand(value)
    );
}

/**
 * Provides all prefixes of given string (including the string itself).
 */
export function prefixes(value: string): string[] {
    return times((i) => value.substring(0, i + 1), value.length);
}

/**
 * Provides the longest palindrome in given string.
 *
 * https://gist.github.com/DuncanMcArdle/695c2ffb6f633d4d22275ff10ee9ab37
 */
export function longestPalindrome(value: string): string {
    let longestPalLength = 0;
    let longestPalLeft = 0;
    let longestPalRight = 0;

    const _longestPalindrome = function (leftPosition: number, rightPosition: number) {
        // expand while there is space, and the expanded strings match
        while (leftPosition >= 0 && rightPosition < value.length && value[leftPosition] === value[rightPosition]) {
            leftPosition--;
            rightPosition++;
        }

        // store the longest palindrome (if it's the longest one found so far)
        if (rightPosition - leftPosition > longestPalLength) {
            longestPalLeft = leftPosition + 1;
            longestPalRight = rightPosition - 1;
            longestPalLength = longestPalRight - longestPalLeft + 1;
        }
    };

    // loop through the letters
    for (let i = 0; i < value.length; i++) {
        _longestPalindrome(i, i + 1); // longest odd palindrome
        _longestPalindrome(i, i); // longest even palendrome

        // break out to avoid unnecessary computation if a longer palindrome cannot be found
        if ((value.length - i) * 2 < longestPalLength) break;
    }

    return value.slice(longestPalLeft, longestPalRight + 1);
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

const mapI = addIndex(map);

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

    it('can find the longest palindrome', () => {
        expect(longestPalindrome('BANANA')).toBe('ANANA');
        expect(longestPalindrome('MISSISSIPPI')).toBe('ISSISSI');
    });

    it('can find next and previous symbols to a given anchor', () => {
        expect(nextOrPrevSymbols('M', 'MISSISSIPPI', true)).toStrictEqual(['I']);
        expect(nextOrPrevSymbols('M', 'MISSISSIPPI', false)).toStrictEqual([]);
        expect(nextOrPrevSymbols('I', 'MISSISSIPPI', true)).toStrictEqual(['S', 'P']);
        expect(nextOrPrevSymbols('I', 'MISSISSIPPI', false)).toStrictEqual(['M', 'S', 'P']);
        expect(nextOrPrevSymbols('S', 'MISSISSIPPI', true)).toStrictEqual(['S', 'I']);
        expect(nextOrPrevSymbols('S', 'MISSISSIPPI', false)).toStrictEqual(['I', 'S']);
        expect(nextOrPrevSymbols('P', 'MISSISSIPPI', true)).toStrictEqual(['P', 'I']);
        expect(nextOrPrevSymbols('P', 'MISSISSIPPI', false)).toStrictEqual(['I', 'P']);
    });
}
