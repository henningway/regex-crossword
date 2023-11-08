import { randomElement, randomSubset, repeatFunction } from '@/util/common';
import {
    collapse,
    expand,
    matchLength,
    nextOrPrevSymbol,
    repeatedSubstringsWithoutOverlap,
    symbols
} from '@/util/string';
import {
    all,
    chain,
    filter,
    flip,
    init,
    join,
    map,
    pluck,
    propEq,
    reduce,
    repeat,
    sum,
    tail,
    test,
    uniqBy,
    xprod
} from 'ramda';

/**
 * Provides a number of characteristics describing given string.
 */
function stringCharacteristics(value: string) {
    const repeats = repeatedSubstringsWithoutOverlap(value);

    return {
        value,
        symbols: symbols(value),
        longestRepeat: repeats[0] ?? '',
        longestRepeatCount: matchLength(repeats[0] ?? '', value),
        repeats
    };
}

/**
 * Revelas the longest repeating non-overlapping sequence of symbols. Uses capturing to make the regex harder to read.
 *
 * Ex.: MISSISSIPPI => /^.*(ISS).*\1.*$/
 */
function regexLongestRepeat(value: string, count: number): RegExp {
    return new RegExp(`^.*${join('.*', [`(${value})`, ...repeat('\\1', count - 1)])}.*$`);
}

/**
 * Reveals some of the contained symbols without giving away order.
 *
 * Ex.: MISSISSIPPI => /^.*[SMI]*.*$/
 */
function regexRandomSubsetOfSymbols(symbols: string[]): RegExp {
    const subset = randomSubset(symbols);

    if (subset.length === 1) return new RegExp(`^.*${subset[0]}.*$`);
    if (subset.length === symbols.length) return new RegExp(`^[${join('', subset)}]+$`);

    return new RegExp(`^.*[${collapse(subset)}]+.*$`);
}

/**
 * Reveals random symbols in correct order. Concealed symbols are replaced by . or .*
 *
 * Ex.: MISSISSIPPI => /^.*S.*I.PI$/
 */
function regexRandomSymbols(value: string): RegExp {
    const threshold = 0.25;

    const pattern: string[] = map((char) => (Math.random() > threshold ? '.' : char), expand(value)); // most likely contains stretches of "..."

    const patternReduced: string[] = reduce(
        (acc: string[], val: string) =>
            (acc.at(-1) === '.' || acc.at(-1) === '.*') && val === '.' ? [...init(acc), '.*'] : [...acc, val],
        [],
        pattern
    );

    return new RegExp(`^${collapse(patternReduced)}$`);
}

/**
 * Reveals the next symbol(s) to the occurence of an anchor symbol.
 *
 * Ex.: MISSISSIPPI: /^([^M|MI])*$/
 */
function regexNextSymbol(value: string): RegExp {
    const allSymbols = symbols(init(value));
    const anchorSymbol = randomElement(allSymbols);
    const nextSymbols = nextOrPrevSymbol(anchorSymbol, value, true);

    return new RegExp(`(^${anchorSymbol}|${join('|', map(collapse, xprod([anchorSymbol], nextSymbols)))})`, 'g');
}

/**
 * Reveals the previous symbol(s) to the occurence of an anchor symbol.
 *
 * Ex.: MISSISSIPPI: /^([^I|MI|SI|PI])*$/
 */
function regexPreviousSymbol(value: string): RegExp {
    const allSymbols = symbols(tail(value));
    const anchorSymbol = randomElement(allSymbols);
    const nextSymbols = nextOrPrevSymbol(anchorSymbol, value, false);

    return new RegExp(`(^${anchorSymbol}|${join('|', map(collapse, xprod(nextSymbols, [anchorSymbol])))})`, 'g');
}

/**
 * Produces a RegExp for given value.
 */
export function guessRegex(value: string): RegExp {
    const c = stringCharacteristics(value);

    interface Generator {
        condition: boolean;
        handler: () => RegExp;
        weight: number;
    }

    const generators: Generator[] = [
        {
            condition: c.longestRepeat.length >= 2,
            handler: () => regexLongestRepeat(c.longestRepeat, c.longestRepeatCount),
            weight: 4
        },
        { condition: c.symbols.length >= 2, handler: () => regexRandomSubsetOfSymbols(c.symbols), weight: 2 },
        { condition: true, handler: () => regexPreviousSymbol(value), weight: 1 },
        { condition: true, handler: () => regexNextSymbol(value), weight: 1 },
        { condition: true, handler: () => regexRandomSymbols(value), weight: 2 }
    ];

    const applicableGenerators: Generator[] = filter((gen) => gen.condition, generators);
    const weightedGenerators: Generator[] = chain((gen) => repeat(gen, gen.weight), applicableGenerators); //

    return randomElement(weightedGenerators).handler();
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    const testF = flip(test);

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

    it('can generate a regex that reveals the longest repeating non-overlapping sequence of symbols', () => {
        const value = 'MISSISSIPPI';

        const repeats = repeatedSubstringsWithoutOverlap(value);

        const re = regexLongestRepeat(repeats[0], matchLength(repeats[0], value));

        expect(test(re, value)).toBe(true);
    });

    it('can generate a regex that reveals some of the contained symbols in no particular order', () => {
        const value = 'MISSISSIPPI';

        const re = regexRandomSubsetOfSymbols(symbols(value));

        expect(test(re, value)).toBe(true);
    });

    it('can generate a regex that reveals random symbols in correct order', () => {
        const value = 'MISSISSIPPI';

        const re = regexRandomSymbols(value);

        expect(test(re, value)).toBe(true);
    });

    it('can generate a regex that reveals the next symbol(s) to an anchor symbol', () => {
        const value = 'MISSISSIPPI';

        const re = regexNextSymbol(value);

        expect(test(re, value)).toBe(true);
    });

    it('can generate a regex that reveals the previous symbol(s) to an anchor symbol', () => {
        const value = 'MISSISSIPPI';

        const re = regexPreviousSymbol(value);

        expect(test(re, value)).toBe(true);
    });
}
