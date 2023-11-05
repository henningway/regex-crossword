<template>
    <div class="transform -rotate-45 text-xl">
        <template v-for="(row, rowIndex) in game.board">
            <!-- row incl. row regex -->
            <div
                class="flex w-fit leading-none relative"
                :style="{ height: CELL_PX + 'px' }"
            >
                <!-- row -->
                <div
                    v-for="(char, colIndex) in row"
                    class="relative h-full flex justify-center items-center border border-black p-1"
                    :style="{ width: CELL_PX + 'px' }"
                >
                    <span
                        class="text-gray-200 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit select-none pointer-events-none rotate-45 bg-transparent"
                    >
                        {{ char }}
                    </span>

                    <input
                        type="text"
                        class="border-none w-5 h-full outline-none transform rotate-45 bg-transparent"
                        :value="input[rowIndex][colIndex]"
                        @input="update(($event.target as HTMLInputElement).value, rowIndex, colIndex)"
                    />

                    <!-- column regexes: relatively positioned to element in last row -->
                    <div
                        v-if="rowIndex === game.size - 1"
                        class="absolute top-full left-full origin-top-left rotate-90 flex items-center px-2"
                        :class="{ 'text-green-600': checkColRegex(colIndex) }"
                        :style="{ height: CELL_PX + 'px' }"
                    >
                        {{ game.regex.columns[colIndex] }}
                    </div>
                </div>

                <!-- row regex -->
                <div
                    class="absolute left-full flex items-center px-2"
                    :class="{ 'text-green-600': checkRowRegex(rowIndex) }"
                    :style="{ height: CELL_PX + 'px' }"
                >
                    {{ game.regex.rows[rowIndex] }}
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import type { Board, Game } from '@/type/common';
    import { always as _, assocPath, last, test, times, toUpper, transpose } from 'ramda';
    import { ref } from 'vue';
    import { collapse } from '@/util/string';

    const CELL_PX = 40;

    const props = defineProps<{ game: Game }>();

    /* REFS */
    const input = ref<Board>(times(_(times(_(''), props.game.size)), props.game.size));

    /* METHODS */
    const checkRowRegex = (rowIndex: number): boolean => {
        return test(props.game.regex.rows[rowIndex], collapse(input.value[rowIndex]));
    };

    const checkColRegex = (colIndex: number): boolean => {
        return test(props.game.regex.columns[colIndex], collapse(transpose(input.value)[colIndex]));
    };

    const update = (value: string | null, rowIndex: number, colIndex: number) => {
        input.value = assocPath([rowIndex, colIndex], toUpper(value !== null ? last(value) : ''), input.value);
    };
</script>
