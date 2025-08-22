import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true, // 允許外部設備訪問
    port: 5001, // 固定端口號
    // 為了手機訪問，暫時禁用 HTTPS
    // https: {
    //   key: './localhost+2-key.pem',
    //   cert: './localhost+2.pem'
    // }
  },
})
