import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS === 'true' ? '/UNFOLD_260925/' : '/',
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  test: { environment: 'jsdom', globals: true },
})
