<template>
    <div class="w-screen h-screen flex flex-col">
        <div class="flex justify-center items-center h-full overflow-scroll">
            <slot :options="options" />
        </div>

        <div class="w-100 flex justify-center p-4 border border-t-gray-300 bg-white gap-2">
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

                reset
            </div>

            <div
                class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                @click="toggleRotation"
            >
                <svg
                    class="w-3 h-3 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                >
                    <path
                        d="M17 9a1 1 0 0 0-1 1 6.994 6.994 0 0 1-11.89 5H7a1 1 0 0 0 0-2H2.236a1 1 0 0 0-.585.07c-.019.007-.037.011-.055.018-.018.007-.028.006-.04.014-.028.015-.044.042-.069.06A.984.984 0 0 0 1 14v5a1 1 0 1 0 2 0v-2.32A8.977 8.977 0 0 0 18 10a1 1 0 0 0-1-1ZM2 10a6.994 6.994 0 0 1 11.89-5H11a1 1 0 0 0 0 2h4.768a.992.992 0 0 0 .581-.07c.019-.007.037-.011.055-.018.018-.007.027-.006.04-.014.028-.015.044-.042.07-.06A.985.985 0 0 0 17 6V1a1 1 0 1 0-2 0v2.32A8.977 8.977 0 0 0 0 10a1 1 0 1 0 2 0Z"
                    />
                </svg>
                rotate
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onBeforeUnmount } from 'vue';

    defineEmits(['reset']);

    /* REFS */
    const options = ref<{ rotate: boolean }>({ rotate: true });

    /* METHODS */
    const toggleRotation = () => (options.value = { ...options.value, rotate: !options.value.rotate });

    /* INIT */
    const keyListener = (e: KeyboardEvent) => {
        if (e.key === 'r' && e.ctrlKey) {
            toggleRotation();
            e.preventDefault();
        }
    };

    document.addEventListener('keydown', keyListener);
    onBeforeUnmount(() => document.removeEventListener('keydown', keyListener));
</script>
