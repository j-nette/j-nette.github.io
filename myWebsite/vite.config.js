import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import authoringPlugin from './dev/authoring-plugin.js'

// Resolve a path relative to this config file.
const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    // The authoring backend is a dev-server-only plugin; never register it for builds.
    plugins: [react(), ...(isBuild ? [] : [authoringPlugin()])],
    resolve: {
      // Swap the authoring modules for inert stubs at build time so no editing
      // UI, upload logic, or write endpoints ship in the deployed bundle.
      alias: {
        '@authoring/api': isBuild
          ? r('./src/dev/devApi.prod.js')
          : r('./src/dev/devApi.js'),
        '@authoring/controls': isBuild
          ? r('./src/components/EditControls.prod.jsx')
          : r('./src/components/EditControls.jsx'),
      },
    },
  }
})
