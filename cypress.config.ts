import { defineConfig } from 'cypress'
import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    scrollBehavior: false,
    fixturesFolder: false,
    screenshotOnRunFailure: false,
    excludeSpecPattern: ['**/__snapshots__/*'],
    viewportHeight: 600,
    viewportWidth: 1200,
    setupNodeEvents(on) {
      addMatchImageSnapshotPlugin(on)
    },
  },
})
