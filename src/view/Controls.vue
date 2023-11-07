<template>
    <div class="w-screen h-screen flex flex-col">
        <div class="flex justify-center items-center h-full overflow-auto">
            <slot :options="options" />
        </div>

        <div
            class="w-100 flex justify-center p-4 border-t border-t-gray-200 dark:border-t-gray-700 bg-slate-100 dark:bg-slate-800 gap-4"
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

            <div
                class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                @click="game.$reset()"
            >
                <svg
                    class="w-3 h-3 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 14"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m12 7 3-3-3-3m0 12H5.5a4.5 4.5 0 1 1 0-9H14"
                    />
                </svg>

                Reset
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onBeforeUnmount } from 'vue';
    import type { Options } from '@/type/common';
    import ToggleButton from '@/view/ToggleButton.vue';
    import { useGameStore } from '@/app/game';

    const game = useGameStore();

    /* REFS */
    const darkmode = ref<boolean>(document.querySelector('html')?.classList[0] === 'dark');
    const options = ref<Options>({ solution: false, rotate: false });

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
