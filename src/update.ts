import { assocPath, toUpper } from 'ramda';
import { input } from './Board.vue';

/* METHODS */
export const update = (value: string | null, rowIndex: number, colIndex: number) => {
console.log(value, rowIndex, colIndex);
input.value = assocPath([rowIndex, colIndex], toUpper(value !== null ? last(value) : ''), input.value);
};
