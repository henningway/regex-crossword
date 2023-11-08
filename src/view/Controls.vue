<template>
    <div class="w-screen h-screen flex flex-col">
        <div class="flex justify-center items-center h-full overflow-auto">
            <slot :options="options" />
        </div>

        <div
            class="w-100 flex justify-center items-center p-4 border-t border-t-gray-200 dark:border-t-gray-700 bg-slate-100 dark:bg-slate-800 gap-4 font-medium"
        >
            <ToggleButton
                :value="darkmode"
                @update="toggleDarkmode"
            >
                Dark
            </ToggleButton>

            <ToggleButton
                :value="options.rotate"
                @update="toggleRotation"
            >
                Rotate
            </ToggleButton>

            <ToggleButton
                :value="options.solution"
                @update="toggleSolution"
            >
                Solution
            </ToggleButton>

            <div class="w-[1px] h-[35px] bg-gray-200 dark:bg-gray-700 -mt-[10px] -mb-[10px]" />

            <label for="replay-slider">Replay:</label>
            <input
                id="replay-slider"
                type="range"
                class="w-[200px] h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
                min="0"
                :max="game.userInput.length"
                @input="(event) => game.updateUserIndex(parseInt((event.target as HTMLInputElement).value))"
                :value="game.undoIndex"
            />

            <div class="w-[1px] h-[35px] bg-gray-200 dark:bg-gray-700 -mt-[10px] -mb-[10px]" />

            New game:

            <div class="flex items-center gap-2">
                <label for="size"> Size </label>
                <input
                    id="size"
                    class="w-[60px] p-2 border border-gray-300 rounded-md bg-gray-50 sm:text-xs dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none"
                    type="number"
                    min="2"
                    max="12"
                    v-model="options.size"
                    @keydown.prevent
                />
            </div>

            <button
                type="button"
                class="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                @click="game.new(options.size)"
            >
                Create
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useGameStore } from '@/app/game';
    import type { Options } from '@/type/common';
    import ToggleButton from '@/view/ToggleButton.vue';
    import { onBeforeUnmount, ref } from 'vue';

    const game = useGameStore();

    /* REFS */
    const darkmode = ref<boolean>(document.querySelector('html')?.classList[0] === 'dark');
    const options = ref<Options>({ solution: false, rotate: true, size: 7 });

    /* METHODS */
    const toggleSolution = () => (options.value = { ...options.value, solution: !options.value.solution });
    const toggleRotation = () => (options.value = { ...options.value, rotate: !options.value.rotate });

    const toggleDarkmode = () => {
        const htmlEl = document.querySelector('html');

        if (htmlEl?.classList.contains('dark')) {
            htmlEl?.classList.remove('dark');
            htmlEl?.classList.add('light');
            darkmode.value = false;
        } else {
            htmlEl?.classList.remove('light');
            htmlEl?.classList.add('dark');
            darkmode.value = true;
        }
    };

    /* INIT */
    const keyListener = (e: KeyboardEvent) => {
        if (e.key === 'd') {
            toggleDarkmode();
            e.preventDefault();
        }

        if (e.key === 'r') {
            toggleRotation();
            e.preventDefault();
        }

        if (e.key === 's') {
            toggleSolution();
            e.preventDefault();
        }
    };

    document.addEventListener('keydown', keyListener);
    onBeforeUnmount(() => document.removeEventListener('keydown', keyListener));
</script>
