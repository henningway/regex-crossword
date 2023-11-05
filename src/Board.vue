<template>
    <div
        class="text-xl transition-transform"
        :class="{ '-rotate-45': options.rotate }"
        @keydown.up="navigate(Direction.UP)"
        @keydown.down="navigate(Direction.DOWN)"
        @keydown.left="navigate(Direction.LEFT)"
        @keydown.right="navigate(Direction.RIGHT)"
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
                    class="relative h-full flex justify-center items-center border border-black p-1"
                    :style="{ width: CELL_PX + 'px' }"
                    :class="{ 'bg-blue-100': equals(activeCell, { row: rowIndex, col: colIndex }) }"
                    @click="focus(rowIndex, colIndex)"
                >
                    <!-- solution -->
                    <span
                        v-if="options.solution && input[rowIndex][colIndex] === ''"
                        class="transition-transform text-gray-400 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit select-none pointer-events-none bg-transparent"
                        :class="{ 'rotate-45': options.rotate }"
                    >
                        {{ char }}
                    </span>

                    <span
                        class="transition-transform absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit select-none pointer-events-none bg-transparent"
                        :class="{ 'rotate-45': options.rotate }"
                    >
                        {{ input[rowIndex][colIndex] }}
                    </span>

                    <!-- input -->
                    <input
                        ref="inputRefs"
                        type="text"
                        :id="`cell-${rowIndex}-${colIndex}`"
                        class="sr-only transition-transform border-none w-full h-full outline-none transform bg-transparent text-center"
                        :class="{ 'rotate-45': options.rotate }"
                        :value="input[rowIndex][colIndex]"
                        @focus="activeCell = { row: rowIndex, col: colIndex }"
                        @blur="activeCell = null"
                        @input.capture="update(($event.target as HTMLInputElement).value, rowIndex, colIndex)"
                    />

                    <!-- column regexes: relatively positioned to element in last row -->
                    <div
                        v-if="rowIndex === game.size - 1"
                        class="absolute top-full left-full origin-top-left rotate-90 flex items-center px-2"
                        :class="{ 'text-green-600': checkColRegex(colIndex) }"
                        :style="{ height: CELL_PX + 'px' }"
                    >
                        {{ slice(1, -1, game.regex.columns[colIndex].source) }}
                    </div>
                </div>

                <!-- row regex -->
                <div
                    class="absolute left-full flex items-center px-2"
                    :class="{ 'text-green-600': checkRowRegex(rowIndex) }"
                    :style="{ height: CELL_PX + 'px' }"
                >
                    {{ slice(1, -1, game.regex.rows[rowIndex].source) }}
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import type { Board, Game, Options } from '@/type/common';
    import { Direction } from '@/type/enum';
    import { always as _, assocPath, clamp, equals, last, slice, test, times, toUpper, transpose } from 'ramda';
    import { ref } from 'vue';
    import { collapse } from '@/util/string';

    const CELL_PX = 40;

    const props = defineProps<{ game: Game; options: Options }>();

    /* REFS */
    const activeCell = ref<{ row: number; col: number } | null>(null);
    const input = ref<Board>(times(_(times(_(''), props.game.size)), props.game.size));
    const inputRefs = ref<HTMLInputElement[]>([]);

    /* METHODS */
    const focus = (row: number, col: number) => {
        inputRefs.value.find((e) => e.id === `cell-${row}-${col}`)?.focus();
    };

    const checkColRegex = (colIndex: number): boolean => {
        return test(props.game.regex.columns[colIndex], collapse(transpose(input.value)[colIndex]));
    };

    const checkRowRegex = (rowIndex: number): boolean => {
        return test(props.game.regex.rows[rowIndex], collapse(input.value[rowIndex]));
    };

    const navigate = (direction: Direction) => {
        let sourceRow = activeCell.value?.row;
        let sourceCol = activeCell.value?.col;

        if (sourceRow === undefined || sourceCol === undefined) return;

        let targetRow: number = sourceRow;
        let targetCol: number = sourceCol;

        if (direction === Direction.UP) {
            targetRow = clamp(0, props.game.size, sourceRow - 1);
        }

        if (direction === Direction.DOWN) {
            targetRow = clamp(0, props.game.size, sourceRow + 1);
        }

        if (direction === Direction.LEFT) {
            targetCol = clamp(0, props.game.size, sourceCol - 1);
        }

        if (direction === Direction.RIGHT) {
            targetCol = clamp(0, props.game.size, sourceCol + 1);
        }

        focus(targetRow, targetCol);
    };

    const update = (value: string | null, rowIndex: number, colIndex: number) => {
        input.value = assocPath([rowIndex, colIndex], toUpper(value !== null ? last(value) : ''), input.value);
    };
</script>
