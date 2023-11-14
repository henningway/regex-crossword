import type { Board, BoardUpdate, Char, Game, RegEx } from '@/type/common';
import { randomElement, randomSubset } from '@/util/common';
import { randomGaussian } from '@/util/math';
import { guessRegex } from '@/util/regex';
import { collapse, entropy, symbols } from '@/util/string';
import { assocPath, chain, difference, map, pipe, reduce, repeat, times, transpose } from 'ramda';
import { generateSolution } from '@/util/solution';

const alphabet: Char[] = symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export function generateGame(size: number, useGaussian = true): Game {
    const availableSymbols: Char[] = randomSubset(alphabet, 5 + Math.floor(size / 2));

    const draftPool: Char[] = useGaussian
        ? gaussianPool(availableSymbols, (size * size) / availableSymbols.length, 8, size)
        : availableSymbols;

    const board: Board = times(() => times(() => randomElement(draftPool), size), size);

    const essential = { board, regex: { ROW: generateRegexes(board), COL: generateRegexes(columns(board)) }, size };

    const solution = generateSolution(essential);

    return {
        ...essential,
        allSymbols: alphabet,
        draftedSymbols: availableSymbols, // the symbols that were actually used
        entropy: entropy(collapse(map(collapse, board))),
        solution: generateSolution(essential),
        solutionIndex: solution.length,
        replayIndex: 0,
        unusedSymbols: difference(availableSymbols, draftPool),
        userInput: []
    };
}

/**
 * Replays given BoardUpdates to provide the resulting Board.
 */
export function replayUpdates(board: Board, updates: BoardUpdate[]): Board {
    return reduce((b: Board, u: BoardUpdate) => assocPath([u.row, u.col], u.value, b), board, updates);
}

/**
 * Provides an empty board of given size.
 */
export function emptyBoard(size: number): Board {
    return repeat(repeat(null, size), size);
}

/**
 * Provides a list of symbols with some of them repeated using a normal distribution.
 */
function gaussianPool(availableSymbols: Char[], mean: number, stdev: number, size: number): Char[] {
    // the weights will add up to ~size², note that weights can be negative
    const randomSymbolDistribution: { symbol: Char; weight: number }[] = map(
        (symbol: Char) => ({ symbol, weight: Math.round(randomGaussian(mean, stdev)) }),
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
