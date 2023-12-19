import { Dim, RegExType } from '@/type/enum';

export type Board = Char[][];

// prettier-ignore
export type Char = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

/**
 * Describes an update to the user board.
 */
export interface BoardUpdate {
    row: number;
    col: number;
    value: Char | null;
}

export type ExtendedChar = Char | '.';

/**
 * Describes one game of RegEx crossword including some meta information and user input.
 */
export interface Game extends EssentialGame {
    allSymbols: Char[];
    draftedSymbols: Char[];
    entropy: number;
    regex: { [Dim.ROW]: RegEx[]; [Dim.COL]: RegEx[] };
    replayIndex: number;
    solution: BoardUpdate[];
    solutionIndex: number;
    unusedSymbols: Char[];
    userInput: BoardUpdate[];
}

/**
 * Describes one game of RegEx crossword.
 */
export interface EssentialGame {
    board: Board;
    regex: { [Dim.ROW]: (RegEx | null)[]; [Dim.COL]: (RegEx | null)[] };
    size: number;
}

interface IndexedSymbol<C extends Char | ExtendedChar | MaybeEmptyChar = Char> {
    symbol: C;
    position: number;
}

export type MaybeEmptyChar = Char | '' | null;

export type NullableBoard = (Char | null)[][];

/**
 * Describes options that are used for presentation and generation of games.
 */
export interface Options {
    gaussian: boolean;
    size: number;
    solution: boolean;
    rotate: boolean;
}

export interface RegEx<T extends RegExType = RegExType> {
    re: RegExp;
    segments?: string[];
    source: string;
    type: T;
    meta: T extends RegExType.NEXT_SYMBOL | RegExType.PREVIOUS_SYMBOL
        ? {
              anchor: Char;
              other: Char[];
          }
        : undefined;
}
