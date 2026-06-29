import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/src\/.*\.js$/.test(id.replace(/\\/g, '/'))) {
      return null
    }

    return transformWithOxc(code, id, {
      lang: 'jsx',
      jsx: {
        runtime: 'automatic',
      },
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [jsxInJs, react()],
})
