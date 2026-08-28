import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

/**
 * The build stamp every reported run carries (platform/share.ts). Balance
 * moves between deploys, and runs from four different games blended together
 * support no conclusion — this is what lets the instruments separate cohorts.
 */
function build(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim() || 'dev'
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [react()],
  base: './',
  define: { __BUILD__: JSON.stringify(build()) },
})
