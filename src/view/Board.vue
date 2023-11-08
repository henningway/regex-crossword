<template>
    <div
        class="text-xl transition-transform border border-gray-900 dark:border-slate-400"
        :class="{ '-rotate-45': options.rotate }"
        @keydown.up="navigate(Direction.UP)"
        @keydown.down="navigate(Direction.DOWN)"
        @keydown.left="navigate(Direction.LEFT)"
        @keydown.right="navigate(Direction.RIGHT)"
        @keydown.capture="keyListener"
    >
        <template
            v-for="(row, rowIndex) in game.board"
            :key="rowIndex"
        >
            <!-- row incl. row regex -->
            <div
                class="flex w-fit leading-none relative"
                :style="{ height: CELL_PX + 'px' }"
            >
                <!-- row -->
                <div
                    v-for="(char, colIndex) in row"
                    :key="colIndex"
                    class="relative h-full flex justify-center items-center border border-gray-900 dark:border-slate-400 p-1"
                    :style="{ width: CELL_PX + 'px' }"
                    :class="{ 'bg-blue-100 dark:bg-rose-800': equals(activeCell, { row: rowIndex, col: colIndex }) }"
                    @click="focus(rowIndex, colIndex)"
                >
                    <!-- solution -->
                    <span
                        v-if="options.solution && game.userBoard[rowIndex][colIndex] === ''"
                        class="transition-transform text-gray-400 dark:text-gray-700 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit select-none pointer-events-none bg-transparent"
                        :class="{ 'rotate-45': options.rotate }"
                    >
                        {{ char }}
                    </span>

                    <span
                        class="transition-transform absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit select-none pointer-events-none bg-transparent"
                        :class="{ 'rotate-45': options.rotate }"
                    >
                        {{ game.userBoard[rowIndex][colIndex] }}
                    </span>

                    <!-- input -->
                    <input
                        ref="inputRefs"
                        type="text"
                        :id="`cell-${rowIndex}-${colIndex}`"
                        class="sr-only transition-transform border-none w-full h-full outline-none transform bg-transparent text-center"
                        :class="{ 'rotate-45': options.rotate }"
                        :value="game.userBoard[rowIndex][colIndex]"
                        @focus="activeCell = { row: rowIndex, col: colIndex }"
                        @blur="activeCell = null"
                    />

                    <!-- column regexes: relatively positioned to element in last row -->
                    <div
                        v-if="rowIndex === game.size - 1"
                        class="absolute top-full left-full origin-top-left rotate-90 flex items-center px-2"
                        :class="{ 'text-green-600': checkColRegex(colIndex) }"
                        :style="{ height: CELL_PX + 'px' }"
                    >
                        {{ trimRegex(game.regex.columns[colIndex]) }}
                    </div>
                </div>

                <!-- row regex -->
                <div
                    class="absolute left-full flex items-center px-2"
                    :class="{ 'text-green-600': checkRowRegex(rowIndex) }"
                    :style="{ height: CELL_PX + 'px' }"
                >
                    {{ trimRegex(game.regex.rows[rowIndex]) }}
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import { useGameStore } from '@/app/game';
    import type { Options } from '@/type/common';
    import { Direction } from '@/type/enum';
    import { collapse } from '@/util/string';
    import { equals, includes, pipe, replace, test, toUpper, transpose } from 'ramda';
    import { ref } from 'vue';

    const CELL_PX = 40;

    const game = useGameStore();

    defineProps<{ options: Options }>();

    /* REFS */
    const activeCell = ref<{ row: number; col: number } | null>(null);
    const inputRefs = ref<HTMLInputElement[]>([]);

    /* METHODS */
    const checkColRegex = (colIndex: number): boolean =>
        test(game.regex.columns[colIndex], collapse(transpose(game.userBoard)[colIndex]));

    const checkRowRegex = (rowIndex: number): boolean =>
        test(game.regex.rows[rowIndex], collapse(game.userBoard[rowIndex]));

    const focus = (row: number, col: number) => {
        inputRefs.value.find((e) => e.id === `cell-${row}-${col}`)?.focus();
    };

    const keyListener = (e: KeyboardEvent) => {
        if (activeCell.value === null) return;

        if (includes(toUpper(e.key), game.allSymbols)) {
            e.stopPropagation();
            update(toUpper(e.key));
            navigate(Direction.RIGHT);
        }

        if (e.key === 'Backspace') {
            update('');
            navigate(Direction.LEFT);
        }

        if (e.key === 'Delete') {
            update('');
            navigate(Direction.RIGHT);
        }
    };

    const navigate = (direction: Direction) => {
        const source = { row: activeCell.value?.row, col: activeCell.value?.col };

        if (source.row === undefined || source.col === undefined) return;

        let target = { row: source.row, col: source.col };

        // first pass: regular, values might be out of bounds
        if (direction === Direction.UP) target.row = source.row - 1;
        if (direction === Direction.DOWN) target.row = source.row + 1;
        if (direction === Direction.LEFT) target.col = source.col - 1;
        if (direction === Direction.RIGHT) target.col = source.col + 1;

        // second pass: handle overflows
        if (target.row === game.size) target = { row: 0, col: target.col + 1 };
        else if (target.col === game.size) target = { row: target.row + 1, col: 0 };
        else if (target.row === -1) target = { row: game.size - 1, col: target.col - 1 };
        else if (target.col === -1) target = { row: target.row - 1, col: game.size - 1 };

        focus(target.row, target.col);
    };

    const trimRegex = (regex: RegExp): string => {
        if (regex.source === '^.*$') return '.*';
        return pipe(replace(/^\^?(\.\*)?/, ''), replace(/(\.\*)?\$?$/, ''))(regex.source);
    };

    const update = (value: string) => {
        if (activeCell.value === null) return;
        game.addUpdate({ row: activeCell.value.row, col: activeCell.value.col, value });
    };
</script>
