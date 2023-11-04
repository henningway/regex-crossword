import { randomElement, randomSubset, repeatFunction, shuffle } from '@/util/common';
import { all, flip, join, repeat, test, uniqBy } from 'ramda';
import { symbols, repeatedSubstringsWithoutOverlap, matchCount } from '@/util/string';

/**
 * Provides a number of characteristics describing given string.
 */
function stringCharacteristics(value: string) {
    const repeats = repeatedSubstringsWithoutOverlap(value);

    return {
        value,
        symbols: symbols(value),
        longestRepeat: repeats[0],
        longestRepeatCount: matchCount(repeats[0], value),
        repeats
    };
}

function regexLongestRepeat(value: string, count: number): RegExp {
    return new RegExp(`^.*${join('.*', [`(${value})`, ...repeat('\\1', count - 1)])}.*$`);
}

function regexRandomSubsetOfSymbols(symbols: string[]): RegExp {
    const subset = randomSubset(symbols);

    if (subset.length === 1) return new RegExp(`^.*${subset[0]}*.*$`);

    return new RegExp(`^.*[${join('', subset)}]*.*$`);
}

/**
 * Produces a RegExp for given value.
 */
function guessRegex(value: string): RegExp {
    const characteristics = stringCharacteristics(value);

    const candidates: (() => RegExp)[] = [];

    if (characteristics.longestRepeat.length >= 2)
        candidates.push(() => regexLongestRepeat(characteristics.longestRepeat, characteristics.longestRepeatCount));

    candidates.push(() => regexRandomSubsetOfSymbols(characteristics.symbols));

    return randomElement(candidates)();
}

if (import.meta.vitest) {
    const { describe, it, expect } = import.meta.vitest;

    const testF = flip(test);

    describe('guessRegex', () => {
        it('can guess a matching regex for an arbitrary string', () => {
            const value = 'MISSISSIPPI';
            const res = repeatFunction(() => guessRegex(value), 100);

            expect(all(testF(value), res)).toBe(true);
        });

        it('will not guess the same pattern every time', () => {
            const value = 'MISSISSIPPI';

            const res = repeatFunction(() => guessRegex(value), 100);
            const uniqRes = uniqBy((re: RegExp) => re.source, res);

            expect(all(testF(value), res)).toBe(true);
            expect(uniqRes.length).toBeGreaterThan(20);
        });
    });
}
