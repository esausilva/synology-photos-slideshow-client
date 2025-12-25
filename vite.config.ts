import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { browserslistToTargets } from 'lightningcss'
import { patchCssModules } from 'vite-css-modules';
import tsConfigPaths from 'vite-tsconfig-paths'
import browserslist from 'browserslist'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3500,
    host: true,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(), // react's vite plugin must come after start's vite plugin
    patchCssModules(),
  ],
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
    cssMinify: 'lightningcss'
  }
})
