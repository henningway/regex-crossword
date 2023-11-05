import { map, pipe, times, transpose } from 'ramda';
import { collapse, symbols } from '@/util/string';
import { randomElement } from '@/util/common';
import type { Board, Game } from '@/type/common';
import { guessRegex } from '@/util/regex';

export function generateGame(size: number): Game {
    const allSymbols = symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    const board: Board = times(() => times(() => randomElement(allSymbols), size), size);

    return {
        board,
        regex: {
            rows: map(pipe(collapse, guessRegex), board),
            columns: map(pipe(collapse, guessRegex), columns(board))
        },
        size
    };
}

function columns(board: Board) {
    return transpose(board);
}