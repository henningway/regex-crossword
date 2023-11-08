import type { Board, Game } from '@/type/common';
import { randomElement, randomSubset } from '@/util/common';
import { guessRegex } from '@/util/regex';
import { collapse, symbols } from '@/util/string';
import { map, pipe, times, transpose } from 'ramda';

const alphabet = symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export function generateGame(size: number): Game {
    const availableSymbols = randomSubset(alphabet, 5 + Math.floor(size / 2));

    const board: Board = times(() => times(() => randomElement(availableSymbols), size), size);

    return {
        allSymbols: alphabet,
        draftedSymbols: availableSymbols,
        board,
        regex: { rows: generateRegexes(board), columns: generateRegexes(columns(board)) },
        undoIndex: 0,
        userInput: [],
        size
    };
}

function columns(board: Board) {
    return transpose(board);
}

function generateRegexes(board: Board): RegExp[] {
    return map(pipe(collapse, guessRegex), board);
}
