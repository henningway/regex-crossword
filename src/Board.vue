<template>
    <div>
        <div
            v-for="row in game.board"
            class="flex w-fit"
        >
            <div
                v-for="char in row"
                class="w-[30px] h-[30px] flex justify-center items-center border border-black leading-none"
            >
                {{ char }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { Game } from '@/type/common';

    const props = defineProps<{ game: Game }>();
</script>
