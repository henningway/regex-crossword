import { Board, BoardUpdate, Game } from '@/type/common';
import { generateGame } from '@/util/game';
import { defineStore } from 'pinia';
import { assocPath, reduce, repeat, take } from 'ramda';

export const useGameStore = defineStore('game', {
    state: (): Game => generateGame(7),
    getters: {
        userBoard: (state): Board =>
            reduce(
                (board: Board, update: BoardUpdate) => assocPath([update.row, update.col], update.value, board),
                repeat(repeat('', state.size), state.size) as Board,
                take(state.undoIndex, state.userInput)
            )
    },
    actions: {
        addUpdate(update: BoardUpdate) {
            if (this.undoIndex < this.userInput.length) this.userInput = take(this.undoIndex, this.userInput);

            this.userInput.push(update);
            this.updateUserIndex(this.userInput.length);
        },
        new(size: number, gaussian: boolean) {
            this.$patch(generateGame(size, gaussian));
        },
        updateUserIndex(value: number) {
            this.undoIndex = value;
        }
    }
});
