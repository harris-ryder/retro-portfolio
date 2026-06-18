import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        centrifuge: resolve(__dirname, 'centrifugePage.html'),
        doge: resolve(__dirname, 'dogePage.html'),
        infinity: resolve(__dirname, 'infinityPage.html'),
        masks: resolve(__dirname, 'masksPage.html'),
        muracle: resolve(__dirname, 'muraclePage.html'),
        paintball: resolve(__dirname, 'paintballPage.html'),
        panl: resolve(__dirname, 'panlPage.html'),
        vacuum: resolve(__dirname, 'vacuumPage.html'),
        van: resolve(__dirname, 'vanPage.html'),
      },
    },
  },
})
