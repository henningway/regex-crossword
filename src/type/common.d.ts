export type Board = string[][];

export interface Game {
    allSymbols: string[];
    board: Board;
    regex: {
        rows: RegExp[];
        columns: RegExp[];
    };
    userBoard: Board;
    size: number;
}

export interface Options {
    solution: boolean;
    rotate: boolean;
}
