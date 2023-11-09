import { RegExType } from './enum';

export type Board = string[][];

/**
 * Describes an update to the user board.
 */
export interface BoardUpdate {
    row: number;
    col: number;
    value: string;
}

/**
 * Describes one game of RegEx crossword including some meta information and user input.
 */
export interface Game extends EssentialGame {
    allSymbols: string[];
    draftedSymbols: string[];
    entropy: number;
    replayIndex: number;
    solution: BoardUpdate[];
    solutionIndex: number;
    unusedSymbols: string[];
    userInput: BoardUpdate[];
}

/**
 * Describes one game of RegEx crossword.
 */
export interface EssentialGame {
    board: Board;
    regex: { rows: RegEx[]; columns: RegEx[] };
    size: number;
}

interface IndexedSymbol {
    symbol: string;
    position: number;
}

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
    source: string;
    type: T;
}
