import { BoardUpdate, EssentialGame, ExtendedChar, IndexedSymbol, RegEx } from '@/type/common';
import { Dim, RegExType } from '@/type/enum';
import { makeSegRegEx } from '@/util/regex';
import {
    addIndex,
    chain,
    curry,
    filter,
    head,
    last,
    map,
    pipe,
    prop,
    range,
    reverse,
    sortBy,
    takeWhile,
    test,
    uniq
} from 'ramda';

type Solver = (game: EssentialGame, dim: Dim) => (index: number) => BoardUpdate[];

export function generateSolution(game: EssentialGame): BoardUpdate[] {
    return nextUpdates(game);
}

/**
 * Provides the next set of BoardUpdates to solve given game.
 */
function nextUpdates(game: EssentialGame): BoardUpdate[] {
    const runSolver = (solver: Solver, dim: Dim): BoardUpdate[] => chain(solver(game, dim), range(0, game.size));

    return uniq([
        ...runSolver(solveSymbolPositions, Dim.ROW),
        ...runSolver(solveSymbolPositions, Dim.COL),
        ...runSolver(solveSymbolOrder, Dim.ROW),
        ...runSolver(solveSymbolOrder, Dim.COL)
    ]);
}

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_POSITIONS at given row index.
 */
const solveSymbolPositions = curry((game: EssentialGame, dim: Dim, index: number): BoardUpdate[] => {
    const re = game.regex[dim][index];

    if (re.type !== RegExType.SYMBOL_POSITIONS) return [];

    return uniq(makeBoardUpdates(solveReSymbolPositions(re, game.size), index, dim));
});

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_ORDER at given row index.
 */
const solveSymbolOrder = curry((game: EssentialGame, dim: Dim, index: number): BoardUpdate[] => {
    const re = game.regex[dim][index];

    if (re.type !== RegExType.SYMBOL_ORDER) return [];

    return uniq(makeBoardUpdates(solveReSymbolOrder(re, game.size), index, dim));
});

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
function solveReSymbolOrder(re: RegEx, size: number): IndexedSymbol[] {
    const entries: IndexedSymbol<ExtendedChar>[] = [
        { symbol: head(re.segments!)![0] as ExtendedChar, position: 0 },
        { symbol: last(re.segments!)![0] as ExtendedChar, position: size - 1 }
    ];

    const filterSymbols = filter((entry: IndexedSymbol<ExtendedChar>) => entry.symbol !== '.') as (
        list: IndexedSymbol<ExtendedChar>[]
    ) => IndexedSymbol[];

    return pipe(sortBy(prop('position')), filterSymbols)(entries);
}

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

const mapI = addIndex(map);

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
        const re = makeSegRegEx(RegExType.SYMBOL_ORDER, ['M+', 'I+', 'S+', 'I+', 'S+', 'I+', 'P+', 'I+']);

        expect(solveReSymbolOrder(re, 11)).toStrictEqual([
            { symbol: 'M', position: 0 },
            { symbol: 'I', position: 10 }
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
