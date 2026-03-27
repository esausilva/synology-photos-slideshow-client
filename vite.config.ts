import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { browserslistToTargets } from 'lightningcss'
import { patchCssModules } from 'vite-css-modules';
import browserslist from 'browserslist'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite';

export default defineConfig({
  server: {
    port: 3500,
    host: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      srcDirectory: 'src',
    }),
    nitro(),
    viteReact(), // react's vite plugin must come after start's vite plugin
    patchCssModules(),
  ],
  nitro: {},
  css: {
    transformer: 'lightningcss',
    modules: {
      localsConvention: 'camelCase',
    },
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%')),
      cssModules: true,
    }
  },
  build: {
    cssMinify: 'lightningcss',
    emptyOutDir: true,
  }
})
