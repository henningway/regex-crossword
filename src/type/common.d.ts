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
    board: Board;
    regex: {
        rows: RegExp[];
        columns: RegExp[];
    };
    undoIndex: number;
    userInput: BoardUpdate[];
    size: number;
}

export interface Options {
    size: number;
    solution: boolean;
    rotate: boolean;
}
