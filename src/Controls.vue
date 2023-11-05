<template>
    <div class="w-screen h-screen flex flex-col">
        <div class="flex justify-center items-center h-full overflow-scroll">
            <slot :options="options" />
        </div>

        <div class="w-100 flex justify-center p-4 border border-t-gray-200 bg-slate-100 gap-4">
            <div class="flex items-center">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        :value="options.rotate"
                        class="sr-only peer"
                        @input="toggleRotation"
                    />
                    <div
                        class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                    />
                    <span class="ml-2 text-md font-medium">Rotate</span>
                </label>
            </div>

            <div class="flex items-center">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        :value="options.solution"
                        class="sr-only peer"
                        @input="toggleSolution"
                    />
                    <div
                        class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                    />
                    <span class="ml-2 text-md font-medium">Solution</span>
                </label>
            </div>

            <div
                class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                @click="$emit('reset')"
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

    defineEmits(['reset']);

    /* REFS */
    const options = ref<Options>({ solution: false, rotate: false });

    /* METHODS */
    const toggleSolution = () => (options.value = { ...options.value, solution: !options.value.solution });
    const toggleRotation = () => (options.value = { ...options.value, rotate: !options.value.rotate });

    /* INIT */
    const keyListener = (e: KeyboardEvent) => {
        if (e.ctrlKey) {
            if (e.key === 'r') {
                toggleRotation();
                e.preventDefault();
            }

            if (e.key === 's') {
                toggleSolution();
                e.preventDefault();
            }
        }
    };

    document.addEventListener('keydown', keyListener);
    onBeforeUnmount(() => document.removeEventListener('keydown', keyListener));
</script>
