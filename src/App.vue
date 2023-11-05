<template>
    <Controls
        v-slot="{ options }"
        @reset="game = generateGame(7)"
    >
        <Board
            :game="game"
            :options="options"
        />
    </Controls>
</template>

<script setup lang="ts">
    import Board from '@/Board.vue';
    import Controls from '@/Controls.vue';
    import { generateGame } from '@/util/game';
    import type { Game } from '@/type/common';
    import { ref } from 'vue';

    /* REFS */
    const game = ref<Game>(generateGame(7));
</script>
