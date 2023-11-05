import { keyListener } from './Board.vue';

onBeforeUnmount(() => document.removeEventListener('keydown', keyListener));
