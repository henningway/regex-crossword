import { BoardUpdate, EssentialGame, IndexedSymbol, RegEx } from '@/type/common';
import { RegExType } from '@/type/enum';
import { expand } from '@/util/string';
import { addIndex, chain, concat, curry, filter, map, pipe, range, reverse } from 'ramda';

export function generateSolution(game: EssentialGame): BoardUpdate[] {
    return nextUpdates(game);
}

/**
 * Provides the next set of BoardUpdates to solve given game.
 */
function nextUpdates(game: EssentialGame): BoardUpdate[] {
    return chain(solveSymbolPositions(game), range(0, game.size));
}

/**
 * Provides BoardUpdates to solve RegExType.SYMBOL_POSITIONS at given row index.
 */
const solveSymbolPositions = curry((game: EssentialGame, index: number): BoardUpdate[] => {
    const re = game.regex.rows[index];

    if (re.type !== RegExType.SYMBOL_POSITIONS) return [];

    return makeBoardUpdates(
        [...symbolPositions(re.source, game.size), ...symbolPositions(re.source, game.size, true)],
        index
    );
});

/**
 * Provides exact index and value of symbols at the start of a regex of RegExType.SYMBOL_POSITIONS.
 */
function symbolPositions(source: string, size: number, fromEnd = false): IndexedSymbol[] {
    const makeEntry = (s: string, outerIndex: number, innerIndex: number) => ({
        symbol: s,
        position: fromEnd ? size - 1 - (outerIndex + innerIndex) : outerIndex + innerIndex
    });

    const makeEntries = (match: Required<RegExpMatchArray>): IndexedSymbol[] =>
        //@ts-ignore
        mapI((s, i) => makeEntry(s, match.index, i), expand(match[0]) as string[]);

    const matches = [...(fromEnd ? reverse(source) : source).matchAll(/^[^\*]+/g)] as Required<RegExpMatchArray>[];

    return pipe(
        chain(makeEntries),
        filter((entry: IndexedSymbol) => entry.symbol !== '.')
    )(matches);
}

function makeBoardUpdates(symbols: IndexedSymbol[], index: number, row = true): BoardUpdate[] {
    return map(
        ({ symbol, position }) => ({ col: row ? position : index, row: row ? index : position, value: symbol }),
        symbols
    );
}

const mapI = addIndex(map);

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('can provide index and value of symbols at the start and end of a regex matching a string of known length', () => {
        expect(symbolPositions('MI.S.*I.PI', 11)).toStrictEqual([
            { symbol: 'M', position: 0 },
            { symbol: 'I', position: 1 },
            { symbol: 'S', position: 3 }
        ]);

        expect(symbolPositions('MI.S.*I.PI', 11, true)).toStrictEqual([
            { symbol: 'I', position: 10 },
            { symbol: 'P', position: 9 },
            { symbol: 'I', position: 7 }
        ]);
    });
}
