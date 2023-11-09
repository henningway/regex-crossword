import type { Board, Game, RegEx } from '@/type/common';
import { randomElement, randomSubset } from '@/util/common';
import { randomGaussian } from '@/util/math';
import { guessRegex } from '@/util/regex';
import { collapse, entropy, symbols } from '@/util/string';
import { chain, difference, map, pipe, repeat, times, transpose } from 'ramda';

const alphabet = symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export function generateGame(size: number, useGaussian = true): Game {
    const availableSymbols: string[] = randomSubset(alphabet, 5 + Math.floor(size / 2));

    const draftPool: string[] = useGaussian
        ? gaussianPool(availableSymbols, (size * size) / availableSymbols.length, 8, size)
        : availableSymbols;

    const board: Board = times(() => times(() => randomElement(draftPool), size), size);

    return {
        allSymbols: alphabet,
        draftedSymbols: availableSymbols, // the symbols that were actually used
        entropy: entropy(collapse(map(collapse, board))),
        board,
        regex: { rows: generateRegexes(board), columns: generateRegexes(columns(board)) },
        undoIndex: 0,
        unusedSymbols: difference(availableSymbols, draftPool),
        userInput: [],
        size
    };
}

/**
 * Provides a list of symbols with some of them repeated using a normal distribution.
 */
function gaussianPool(availableSymbols: string[], mean: number, stdev: number, size: number): string[] {
    // the weights will add up to ~size², note that weights can be negative
    const randomSymbolDistribution: { symbol: string; weight: number }[] = map(
        (symbol: string) => ({ symbol, weight: Math.round(randomGaussian(mean, stdev)) }),
        availableSymbols
    );

    // here we have to account for negative values
    return chain((s) => repeat(s.symbol, Math.max(1, s.weight)), randomSymbolDistribution);
}

function columns(board: Board) {
    return transpose(board);
}

function generateRegexes(board: Board): RegEx[] {
    return map(pipe(collapse, guessRegex), board);
}
