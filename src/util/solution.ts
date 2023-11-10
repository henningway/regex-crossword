import { BoardUpdate, EssentialGame, ExtendedChar, IndexedSymbol, RegEx } from '@/type/common';
import { Dim, RegExType } from '@/type/enum';
import { makeSegRegEx } from '@/util/regex';
import { addIndex, chain, curry, filter, map, pipe, range, reverse, takeWhile, test, uniq } from 'ramda';

export function generateSolution(game: EssentialGame): BoardUpdate[] {
    return nextUpdates(game);
}

/**
 * Provides the next set of BoardUpdates to solve given game.
 */
function nextUpdates(game: EssentialGame): BoardUpdate[] {
    return [
        ...(chain(solveSymbolPositions(game, Dim.ROW), range(0, game.size)) as BoardUpdate[]),
        ...(chain(solveSymbolPositions(game, Dim.COL), range(0, game.size)) as BoardUpdate[])
    ];
}

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_POSITIONS at given row index.
 */
const solveSymbolPositions = curry((game: EssentialGame, dim: Dim, index: number): BoardUpdate[] => {
    const re = game.regex[dim][index];

    if (re.type !== RegExType.SYMBOL_POSITIONS) return [];

    return uniq(
        makeBoardUpdates([...symbolPositions(re, game.size), ...symbolPositions(re, game.size, true)], index, dim)
    );
});

/**
 * Provides exact index and value of symbols at the start of a regex of RegExType.SYMBOL_POSITIONS.
 */
function symbolPositions(re: RegEx, size: number, fromEnd = false): IndexedSymbol[] {
    const makeEntries = (matches: string[]): IndexedSymbol[] =>
        mapI((s, i) => ({ symbol: s, position: fromEnd ? size - 1 - i : i }), matches);

    const matches: string[] = takeWhile(test(/^[A-Z\.]$/), fromEnd ? reverse(re.segments!) : re.segments!);

    return pipe(
        makeEntries,
        filter((entry: IndexedSymbol<ExtendedChar>) => entry.symbol !== '.')
    )(matches);
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

    const reMississippi = makeSegRegEx(RegExType.SYMBOL_POSITIONS, ['M', 'I', '.', 'S', '.*', 'I', '.', 'P', 'I']);

    it('can provide index and value of symbols at the start and end of a regex matching a string of known length', () => {
        expect(symbolPositions(reMississippi, 11)).toStrictEqual([
            { symbol: 'M', position: 0 },
            { symbol: 'I', position: 1 },
            { symbol: 'S', position: 3 }
        ]);

        expect(symbolPositions(reMississippi, 11, true)).toStrictEqual([
            { symbol: 'I', position: 10 },
            { symbol: 'P', position: 9 },
            { symbol: 'I', position: 7 }
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
                [Dim.ROW]: [_makeRegex(['A', '.']), _makeRegex(['.*', 'B'])],
                [Dim.COL]: [_makeRegex(['.', 'C']), _makeRegex(['D', '.*'])]
            },
            size: 2
        });

        expect(solution).toStrictEqual([
            { col: 0, row: 0, value: 'A' },
            { col: 1, row: 1, value: 'B' },
            { col: 0, row: 1, value: 'C' },
            { col: 1, row: 0, value: 'D' }
        ]);
    });
}
