import { BoardUpdate, Char, EssentialGame, ExtendedChar, IndexedSymbol, MaybeEmptyChar, RegEx } from '@/type/common';
import { Dim, RegExType } from '@/type/enum';
import { fullBoard, getWord } from '@/util/game';
import { makeSegRegEx } from '@/util/regex';
import {
    addIndex,
    apply,
    concat,
    curry,
    filter,
    head,
    indexOf,
    last,
    map,
    pipe,
    prop,
    range,
    reduce,
    reverse,
    sortBy,
    takeWhile,
    tap,
    test,
    uniq,
    values
} from 'ramda';

type Solver = (game: EssentialGame, dim: Dim, index: number) => ComposableSolver;
type ComposableSolver = (solution: BoardUpdate[]) => BoardUpdate[];

/**
 * Provides a solution by chaining solvers.
 */
export function generateSolution(game: EssentialGame): BoardUpdate[] {
    const DEBUG = false;

    const makeSolvers = (solver: Solver, dim: Dim): ComposableSolver[] =>
        map((i) => solver(game, dim, i), range(0, game.size));

    const withLogging = (solver: ComposableSolver) =>
        pipe(
            solver,
            tap((x) => console.debug('OUT', x))
        );

    let solvers = concatAll([
        makeSolvers(solveSymbolPositions, Dim.ROW),
        makeSolvers(solveSymbolPositions, Dim.COL),
        makeSolvers(solveSymbolOrder, Dim.ROW),
        makeSolvers(solveSymbolOrder, Dim.COL)
    ]) as ComposableSolver[];

    if (DEBUG) solvers = map(withLogging, solvers);

    // @ts-ignore
    return uniq(apply(pipe, solvers)([]));
}

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_POSITIONS at given coordinates.
 */
const solveSymbolPositions = curry(
    (game: EssentialGame, dim: Dim, index: number, solution: BoardUpdate[]): BoardUpdate[] => {
        const re = game.regex[dim][index];

        const newUpdates =
            re.type !== RegExType.SYMBOL_POSITIONS
                ? []
                : uniq(makeBoardUpdates(solveReSymbolPositions(re, game.size), index, dim));

        return [...solution, ...newUpdates];
    }
);

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_ORDER at given coordinates.
 */
const solveSymbolOrder = curry(
    (game: EssentialGame, dim: Dim, index: number, solution: BoardUpdate[]): BoardUpdate[] => {
        const re = game.regex[dim][index];

        const makeUpdates = () => {
            const word = getWord(fullBoard(game.size, solution), dim, index) as MaybeEmptyChar[]; // known symbols at given coordinates
            return uniq(makeBoardUpdates(solveReSymbolOrder(re, word), index, dim));
        };

        return [...solution, ...(re.type !== RegExType.SYMBOL_ORDER ? [] : makeUpdates())];
    }
);

/**
 * Provides exact index and value of symbols at the start and end of a regex of RegExType.SYMBOL_POSITIONS.
 */
function solveReSymbolPositions(re: RegEx, size: number): IndexedSymbol[] {
    const makeEntries = (matches: string[], fromEnd: boolean): IndexedSymbol<ExtendedChar>[] =>
        mapI((s, i) => ({ symbol: s, position: fromEnd ? size - 1 - i : i }), matches);

    const takeSymbols = takeWhile(test(/^[A-Z\.]$/));

    const entriesLeft = makeEntries(takeSymbols(re.segments!), false);
    const entriesRight = makeEntries(takeSymbols(reverse(re.segments!)), true);

    const filterSymbols = filter((entry: IndexedSymbol<ExtendedChar>) => entry.symbol !== '.') as (
        list: IndexedSymbol<ExtendedChar>[]
    ) => IndexedSymbol[];

    return pipe(sortBy(prop('position')), filterSymbols)([...entriesLeft, ...entriesRight]);
}

/**
 * Provides exact index and value of symbols at the start and end of a regex of RegExType.SYMBOL_POSITIONS.
 */
function solveReSymbolOrder(re: RegEx, word: MaybeEmptyChar[]): IndexedSymbol[] {
    const reSymbolOrder: string[] = map<string, string>(head, re.segments!);
    const maxCountInReHist = Math.max(...values(histogram(reSymbolOrder)));

    // @ts-ignore
    const fillBlanks: (word: MaybeEmptyChar[]) => MaybeEmptyChar[] = mapI((symbol, index, _word: MaybeEmptyChar[]) => {
        if (symbol !== '' && symbol !== null) return symbol; // already solved

        // first and last characters align with first and last segment
        if (index === 0) return head(reSymbolOrder);
        if (index === _word.length - 1) return last(reSymbolOrder);

        if (maxCountInReHist > 1) return ''; // there are weird edge cases if any of the symbols in the regex is present more than once

        // fills gaps (same symbol), ex. ['A', '', 'A'] => ['A', '' , 'A']
        const [left, right] = [seek(_word, index, true), seek(_word, index)];
        if (left !== undefined && left === right) return left;

        // fills gaps (different symbols), ex. ['A', '', 'C'] => ['A', 'B' , 'C'] when RegEx is /^A+B+C+$/
        const [posLeft, posRight, posLeftInOrder, posRightInOrder] = [
            indexOf(left, _word),
            indexOf(right, _word),
            indexOf(left, reSymbolOrder),
            indexOf(right, reSymbolOrder)
        ];
        if (posRightInOrder - posLeftInOrder === 2 && posRight - posLeft === 2)
            return reSymbolOrder[posLeftInOrder + 1];

        return '';
    });

    // two passes allows gap filling to apply in all cases
    const finalWord = fillBlanks(fillBlanks(word));

    const entries: IndexedSymbol<MaybeEmptyChar>[] = mapI((s, i) => ({ symbol: s, position: i }), finalWord);

    return filter((entry: IndexedSymbol<MaybeEmptyChar>) => entry.symbol !== '', entries) as IndexedSymbol[];
}

/**
 * Transforms given IndexSymbols into concrete BoardUpdates with the help of given coordinates.
 */
function makeBoardUpdates(symbols: IndexedSymbol[], index: number, dim: Dim): BoardUpdate[] {
    return map(
        ({ symbol, position }) => ({
            col: dim === Dim.ROW ? position : index,
            row: dim === Dim.ROW ? index : position,
            value: symbol
        }),
        symbols
    );
}

const concatAll = reduce(concat, []);
const mapI = addIndex(map);

/**
 * Provides counts of elements in an array.
 */
const histogram = (values: (string | number)[]): { [index: string | number]: number } =>
    reduce(
        (acc: { [index: string | number]: number }, val: string | number) => ({
            ...acc,
            [val]: acc[val] === undefined ? 1 : acc[val] + 1
        }),
        {},
        values
    );

/**
 * Finds non-empty symbol in given direction inside given word, starting from given index outwards.
 */
const seek = (word: MaybeEmptyChar[], index: number, left = false): Char | undefined => {
    const inBounds = (value: number) => 0 <= value && value < word.length;

    while (inBounds(left ? --index : ++index))
        if (word[index] !== '' && word[index] !== null) return word[index] as Char;
};

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('can provide symbol positions in a RegExType.SYMBOL_POSITIONS', () => {
        const re = makeSegRegEx(RegExType.SYMBOL_POSITIONS, ['M', 'I', '.', 'S', '.*', 'I', '.', 'P', 'I']);

        expect(solveReSymbolPositions(re, 11)).toStrictEqual([
            { symbol: 'M', position: 0 },
            { symbol: 'I', position: 1 },
            { symbol: 'S', position: 3 },
            { symbol: 'I', position: 7 },
            { symbol: 'P', position: 9 },
            { symbol: 'I', position: 10 }
        ]);
    });

    it('can provide symbol positions in a RegExType.SYMBOL_ORDER', () => {
        const re = makeSegRegEx(RegExType.SYMBOL_ORDER, ['A+', 'B+', 'C+']);

        expect(solveReSymbolOrder(re, ['', '', 'A', '', 'C', '', ''])).toStrictEqual([
            { symbol: 'A', position: 0 },
            { symbol: 'A', position: 1 },
            { symbol: 'A', position: 2 },
            { symbol: 'B', position: 3 },
            { symbol: 'C', position: 4 },
            { symbol: 'C', position: 5 },
            { symbol: 'C', position: 6 }
        ]);

        const re2 = makeSegRegEx(RegExType.SYMBOL_ORDER, ['A+', 'B+', 'C+']);

        expect(solveReSymbolOrder(re2, ['', '', '', '', ''])).toStrictEqual([
            { symbol: 'A', position: 0 },
            { symbol: 'C', position: 4 }
        ]);
    });

    it('can provide step by step solution instructions for positional information', () => {
        const _makeRegex = makeSegRegEx(RegExType.SYMBOL_POSITIONS);

        const solution = generateSolution({
            board: [
                ['A', 'B'],
                ['C', 'D']
            ],
            regex: {
                [Dim.ROW]: [_makeRegex(['A', '.']), _makeRegex(['.*', 'D'])],
                [Dim.COL]: [_makeRegex(['.', 'C']), _makeRegex(['B', '.*'])]
            },
            size: 2
        });

        expect(solution).toStrictEqual([
            { row: 0, col: 0, value: 'A' },
            { row: 1, col: 1, value: 'D' },
            { row: 1, col: 0, value: 'C' },
            { row: 0, col: 1, value: 'B' }
        ]);
    });

    it('can provide step by step solution instructions for order information', () => {
        const _makeRegex = makeSegRegEx(RegExType.SYMBOL_ORDER);

        const solution = generateSolution({
            board: [
                ['A', 'B'],
                ['C', 'D']
            ],
            regex: {
                [Dim.ROW]: [_makeRegex(['A+', 'B+']), _makeRegex(['C+', 'D+'])],
                [Dim.COL]: [_makeRegex(['A+', 'C+']), _makeRegex(['B+', 'D+'])]
            },
            size: 2
        });

        expect(solution).toStrictEqual([
            { row: 0, col: 0, value: 'A' },
            { row: 0, col: 1, value: 'B' },
            { row: 1, col: 0, value: 'C' },
            { row: 1, col: 1, value: 'D' }
        ]);
    });
}
