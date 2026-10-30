import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const envDir = fileURLToPath(new URL('../..', import.meta.url))
const deployedApiOrigin = 'https://dbms-superadmin-be.onrender.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET?.trim() || deployedApiOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
