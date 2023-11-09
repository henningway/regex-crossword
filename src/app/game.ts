import { Board, BoardUpdate, Game } from '@/type/common';
import { emptyBoard, generateGame, replayUpdates } from '@/util/game';
import { defineStore } from 'pinia';
import { take } from 'ramda';

export const useGameStore = defineStore('game', {
    state: (): Game => generateGame(7),
    getters: {
        solutionBoard: (state): Board =>
            replayUpdates(emptyBoard(state.size), take(state.solutionIndex, state.solution)),
        userBoard: (state): Board => replayUpdates(emptyBoard(state.size), take(state.replayIndex, state.userInput))
    },
    actions: {
        addUpdate(update: BoardUpdate) {
            if (this.replayIndex < this.userInput.length) this.userInput = take(this.replayIndex, this.userInput);

            this.userInput.push(update);
            this.updateReplayIndex(this.userInput.length);
        },
        new(size: number, gaussian: boolean) {
            this.$patch(generateGame(size, gaussian));
        },
        updateSolutionIndex(value: number) {
            this.solutionIndex = value;
        },
        updateReplayIndex(value: number) {
            this.replayIndex = value;
        }
    }
});
