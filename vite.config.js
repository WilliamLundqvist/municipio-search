import { defineConfig } from 'vite';
import { resolve } from 'path';

function iifeWrapper() {
    return {
        name: 'iife-wrapper',
        generateBundle(_options, bundle) {
            for (const chunk of Object.values(bundle)) {
                if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
                    chunk.code = `(function(){"use strict";\n${chunk.code}\n})();`;
                }
            }
        },
    };
}

export default defineConfig({
    base: './',
    plugins: [iifeWrapper()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'source/js/main.ts'),
                suggestions: resolve(__dirname, 'source/js/suggestions.ts'),
                style: resolve(__dirname, 'source/sass/municipio-search.scss'),
                'suggestions-style': resolve(__dirname, 'source/sass/suggestions.scss'),
            },
            output: {
                entryFileNames: 'js/[name].[hash].js',
                chunkFileNames: 'js/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'css/[name].[hash][extname]';
                    }
                    return 'assets/[name].[hash][extname]';
                },
            },
        },
    },
    css: {
        devSourcemap: true,
    },
});
