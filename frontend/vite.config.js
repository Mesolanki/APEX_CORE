import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/APEX_CORE/',
  plugins: [react(),
    tailwindcss()
  ],
  server: {
   allowedHosts: [
      'snappable-dominga-smolderingly.ngrok-free.dev'
    ]
  }
})
