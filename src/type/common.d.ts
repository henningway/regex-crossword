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
 * Describes one game of RegEx crossword including user input.
 */
export interface Game {
    allSymbols: string[];
    draftedSymbols: string[];
    entropy: number;
    board: Board;
    regex: {
        rows: RegEx[];
        columns: RegEx[];
    };
    undoIndex: number;
    unusedSymbols: string[];
    userInput: BoardUpdate[];
    size: number;
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
