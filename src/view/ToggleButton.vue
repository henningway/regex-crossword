<template>
    <label
        class="relative cursor-pointer flex items-center text-md font-medium gap-1"
        :class="{ toggleValue }"
    >
        <input
            class="absolute opacity-0"
            :checked="value"
            type="checkbox"
            @click.stop
            @change.stop="toggle"
        />

        <div
            class="relative inline-block transition-colors"
            :class="{ 'bg-gray-700': !toggleValue, 'bg-blue-700': toggleValue }"
            :style="{
                width: width + 'px',
                height: height + 'px',
                borderRadius: Math.round(height / 2) + 'px'
            }"
        >
            <div
                class="absolute left-0 top-0 block overflow-hidden rounded-full bg-white transition duration-300 ease-out"
                :style="{
                    width: radius + 'px',
                    height: radius + 'px',
                    transform: `translate(${toggleValue ? distance : margin}px, ${margin}px)`
                }"
            />
        </div>

        <slot />
    </label>
</template>

<script setup lang="ts">
    import { computed, toRef } from 'vue';

    /* EMITS */
    const emit = defineEmits(['update']);

    /* PROPS */
    const props = withDefaults(
        defineProps<{
            height?: number;
            margin?: number;
            value: boolean;
            width?: number;
        }>(),
        { height: 25, margin: 2, width: 45 }
    );

    /* REFS */
    const toggleValue = toRef(props, 'value');

    /* COMPUTED */
    const radius = computed<number>(() => props.height - props.margin * 2);
    const distance = computed<number>(() => props.width - props.height + props.margin);

    /* METHODS */
    const toggle = () => emit('update', !toggleValue.value);
</script>
