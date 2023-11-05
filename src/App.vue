<template>
    <div class="w-screen h-screen flex justify-center items-center">
        <Board
            :game="game"
        />
    </div>
</template>

<script setup lang="ts">
    import Board from '@/Board.vue';
    import { generateGame } from '@/util/game';
    import type { Game } from '@/type/common';

    const game: Game = generateGame(5   );
</script>
