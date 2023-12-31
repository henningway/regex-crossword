import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
    base: '/regex-crossword/',
    plugins: [vue()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    test: { includeSource: ['src/**/*.{js,ts}'] }
});
