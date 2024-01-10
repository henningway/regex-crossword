import { Char, RegEx } from '@/type/common';
import { RegExType } from '@/type/enum';
import { randomElement, randomSubset, repeatFunction } from '@/util/common';
import {
    collapse,
    expand,
    longestPalindrome,
    matchLength,
    nextOrPrevSymbols,
    repeatedSubstringsWithoutOverlap,
    symbols,
    symbolsInOrder
} from '@/util/string';
import {
    all,
    chain,
    curry,
    filter,
    flip,
    head,
    init,
    join,
    last,
    map,
    pluck,
    reduce,
    repeat,
    test,
    times,
    uniqBy,
    xprod
} from 'ramda';

/**
 * Provides a number of characteristics describing given string.
 */
function stringCharacteristics(value: string) {
    const allSymbols = symbols(value);
    const allSymbolsInOrder = symbolsInOrder(value);
    const repeats = repeatedSubstringsWithoutOverlap(value);

    return {
        value,
        symbols: allSymbols,
        symbolCount: allSymbols.length,
        symbolsInOrder: allSymbolsInOrder,
        symbolsInOrderCount: allSymbolsInOrder.length,
        longestPalindrome: longestPalindrome(value),
        longestRepeat: repeats[0] ?? '',
        longestRepeatCount: matchLength(repeats[0] ?? '', value),
        repeats
    };
}

export const makeRegEx = curry(<T extends RegExType>(type: T, source: string, flags = ''): RegEx<RegExType> => {
    const re = new RegExp(source, flags);

    return { source: re.source, type, re, meta: undefined };
});

export const makeMetaRegEx = curry(
    <T extends RegExType>(type: T, source: string, flags = '', meta: RegEx<T>['meta']): RegEx<T> => {
        const re = new RegExp(source, flags);

        return { source: re.source, type, re, meta };
    }
);

/**
 * Revelas the longest repeating non-overlapping sequence of symbols. Uses capturing to make the regex harder to read.
 *
 * Ex.: MISSISSIPPI => /^.*(ISS).*\1.*$/
 */
function regexLongestRepeat(value: string, count: number): RegEx<RegExType.LONGEST_REPEAT> {
    return makeRegEx(RegExType.LONGEST_REPEAT, `^.*${join('.*', [`(${value})`, ...repeat('\\1', count - 1)])}.*$`);
}

/**
 * Reveals some of the contained symbols without giving away order.
 *
 * Ex.: MISSISSIPPI => /^.*[SMI]*.*$/
 */
function regexRandomSubsetOfSymbols(symbols: Char[]): RegEx<RegExType.SYMBOL_SUBSET> {
    const subset = randomSubset(symbols);
    const make = makeRegEx(RegExType.SYMBOL_SUBSET);

    if (subset.length === 1) return make(`^.*${subset[0]}.*$`);
    if (subset.length === symbols.length) make(`^[${join('', subset)}]+$`);

    return make(`^.*[${collapse(subset)}]+.*$`);
}

/**
 * Reveals random symbols in correct order. Concealed symbols are replaced by . or .*
 *
 * Ex.: MISSISSIPPI => /^.*S.*I.PI$/
 */
function regexSymbolPositions(value: string): RegEx<RegExType.SYMBOL_POSITIONS> {
    const threshold = 0.25;

    let segments: string[] = map((char) => (Math.random() > threshold ? '.' : char), expand(value)); // most likely contains stretches of "..."

    segments = reduce(
        (acc: string[], val: string) =>
            (acc.at(-1) === '.' || acc.at(-1) === '.*') && val === '.' ? [...init(acc), '.*'] : [...acc, val],
        [],
        segments
    );

    return makeMetaRegEx(RegExType.SYMBOL_POSITIONS, `^${collapse(segments)}$`, '', { segments });
}

/**
 * Reveals the next symbol(s) to the occurence of an anchor symbol.
 *
 * Ex.: MISSISSIPPI: /^([^M|MI])+$/
 */
function regexNextSymbol(value: string): RegEx<RegExType.NEXT_SYMBOL> {
    const draftSymbols = filter((s) => s !== last(value), symbols(value));
    const anchorSymbol = randomElement(draftSymbols);
    const nextSymbols = nextOrPrevSymbols(anchorSymbol, value, true) as Char[];

    return makeMetaRegEx(
        RegExType.NEXT_SYMBOL,
        `^([^${anchorSymbol}]|${join('|', map(collapse, xprod([anchorSymbol], nextSymbols)))})+$`,
        'g',
        { anchor: anchorSymbol, other: nextSymbols }
    );
}

/**
 * Reveals the previous symbol(s) to the occurence of an anchor symbol.
 *
 * Ex.: MISSISSIPPI: /^([^I|MI|SI|PI])+$/
 */
function regexPreviousSymbol(value: string): RegEx<RegExType.PREVIOUS_SYMBOL> {
    const draftSymbols = filter((s) => s !== head(value), symbols(value));
    const anchorSymbol = randomElement(draftSymbols);
    const prevSymbols = nextOrPrevSymbols(anchorSymbol, value, false) as Char[];

    return makeMetaRegEx(
        RegExType.PREVIOUS_SYMBOL,
        `^([^${anchorSymbol}]|${join('|', map(collapse, xprod(prevSymbols, [anchorSymbol])))})+$`,
        'g',
        { anchor: anchorSymbol, other: prevSymbols }
    );
}

/**
 * Reveals the order of symbols.
 *
 * Ex.: MISSISSIPPI: /^M+I+S+I+S+I*P+I$/
 */
function regexSymbolOrder(value: string): RegEx<RegExType.SYMBOL_ORDER> {
    const segments = [...map((s) => s + '+', symbolsInOrder(value))];

    return makeMetaRegEx(RegExType.SYMBOL_ORDER, `^${collapse(segments)}$`, '', { segments });
}

/**
 * Reveals the longest palindrome without giving away the involved symbols.
 *
 * Ex.: MISSISSIPPI: /^.*(.)(.)(.).(\3)(\2)(\1).*$/
 */
function regexLongestPalindrome(value: string): RegEx<RegExType.LONGEST_PALINDROME> {
    const length = longestPalindrome(value).length;
    const halfLen = Math.floor(length / 2);
    const isOdd = length % 2 === 1;

    const [base, mirror] = [collapse(repeat('(.)', halfLen)), collapse(times((i) => `(\\${halfLen - i})`, halfLen))];

    return makeMetaRegEx(RegExType.LONGEST_PALINDROME, `.*${base}${isOdd ? '.' : ''}${mirror}.*`, '', { length });
}

/**
 * Produces a RegExp for given value.
 */
export function guessRegex(value: string): RegEx {
    const c = stringCharacteristics(value);

    interface Generator {
        condition: boolean;
        handler: () => RegEx;
        weight: number;
    }

    const generators: Generator[] = [
        {
            condition: c.longestRepeat.length >= 2,
            handler: () => regexLongestRepeat(c.longestRepeat, c.longestRepeatCount),
            weight: c.longestRepeat.length * 2
        },
        {
            condition: c.longestPalindrome.length >= 4,
            handler: () => regexLongestPalindrome(value),
            weight: c.longestPalindrome.length
        },
        {
            condition: 2 <= c.symbolsInOrderCount && c.symbolsInOrderCount <= 3,
            handler: () => regexSymbolOrder(value),
            weight: c.symbolsInOrder.length * 2
        },
        { condition: c.symbolCount >= 2, handler: () => regexRandomSubsetOfSymbols(c.symbols), weight: 2 },
        { condition: c.symbolCount >= 2, handler: () => regexPreviousSymbol(value), weight: 1 },
        { condition: c.symbolCount >= 2, handler: () => regexNextSymbol(value), weight: 1 },
        { condition: true, handler: () => regexSymbolPositions(value), weight: 2 }
    ];

    const applicableGenerators: Generator[] = filter((gen) => gen.condition, generators);
    const weightedGenerators: Generator[] = chain((gen) => repeat(gen, gen.weight), applicableGenerators);

    return randomElement(weightedGenerators).handler();
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    const testF = flip(test);

    it('can guess a matching regex for an arbitrary string', () => {
        const value = collapse(randomSubset(symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 7));

        const res = repeatFunction(() => guessRegex(value), 100);

        expect(all(testF(value), pluck('re', res))).toBe(true);
    });

    it('will not guess the same pattern every time', () => {
        const value = collapse(randomSubset(symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 10));

        const res = repeatFunction(() => guessRegex(value), 100);
        const uniqRes = uniqBy((re: RegExp) => re.source, pluck('re', res));

        expect(all(testF(value), pluck('re', res))).toBe(true);
        expect(uniqRes.length).toBeGreaterThan(50);
    });

    it('can generate a regex that reveals the longest repeating non-overlapping sequence of symbols', () => {
        const value = 'MISSISSIPPI';

        const repeats = repeatedSubstringsWithoutOverlap(value);

        const re = regexLongestRepeat(repeats[0], matchLength(repeats[0], value));

        expect(re.source).toBe('^.*(ISS).*\\1.*$');
        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals some of the contained symbols in no particular order', () => {
        const value = 'MISSISSIPPI';

        const re = regexRandomSubsetOfSymbols(symbols(value));

        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals random symbols in correct order', () => {
        const value = 'MISSISSIPPI';

        const re = regexSymbolPositions(value);

        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals the next symbol(s) to an anchor symbol', () => {
        const value = 'MISSISSIPPI';

        const re = regexNextSymbol(value);

        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals the previous symbol(s) to an anchor symbol', () => {
        const value = 'MISSISSIPPI';

        const re = regexPreviousSymbol(value);

        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals order of symbols', () => {
        const value = 'MISSISSIPPI';

        const re = regexSymbolOrder(value);

        expect(test(re.re, value)).toBe(true);
    });

    it('can generate a regex that reveals the longest palindrome without revealing the involved symbols', () => {
        const value = 'MISSISSIPPI';

        const re = regexLongestPalindrome(value);

        expect(re.source).toBe('.*(.)(.)(.).(\\3)(\\2)(\\1).*'); // ISSISSI - the middle I is not repeated
        expect(test(re.re, value)).toBe(true);
    });
}
