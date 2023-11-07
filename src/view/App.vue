<template>
    <Controls v-slot="{ options }">
        <Board :options="options" />
    </Controls>
</template>

<script setup lang="ts">
    import Board from '@/view/Board.vue';
    import Controls from '@/view/Controls.vue';
</script>
