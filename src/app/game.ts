import { Game } from '@/type/common';
import { generateGame } from '@/util/game';
import { defineStore } from 'pinia';
import { repeat } from 'ramda';

export const useGameStore = defineStore('game', {
    state: (): Game => generateGame(7),
    actions: {
        reset() {
            this.userBoard = repeat(repeat('', this.size), this.size);
        }
    }
});
