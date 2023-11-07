import { Game } from '@/type/common';
import { generateGame } from '@/util/game';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
    state: (): Game => generateGame(7)
});
