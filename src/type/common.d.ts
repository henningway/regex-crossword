export type Board = string[][];

/**
 * Describes an update to the user board.
 */
export interface BoardUpdate {
    row: number;
    col: number;
    value: string;
}

export interface Game {
    allSymbols: string[];
    draftedSymbols: string[];
    entropy: number;
    board: Board;
    regex: {
        rows: RegExp[];
        columns: RegExp[];
    };
    undoIndex: number;
    unusedSymbols: string[];
    userInput: BoardUpdate[];
    size: number;
}

export interface Options {
    gaussian: boolean;
    size: number;
    solution: boolean;
    rotate: boolean;
}
