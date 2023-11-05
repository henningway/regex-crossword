import { times } from 'ramda';
import { symbols } from '@/util/string';
import { randomElement } from '@/util/common';
import type { Game } from '@/type/common';

export function generateGame(size: number): Game {
    const allSymbols = symbols('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    const board: string[][] = times(() => times(() => randomElement(allSymbols), size), size);

    return {
        board
    };
}
