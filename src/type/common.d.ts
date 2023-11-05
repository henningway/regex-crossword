export interface Game {
    board: Board;
    regex: {
        rows: RegExp[];
        columns: RegExp[];
    };
    size: number;
}

export type Board = string[][];
