import '@testing-library/cypress/add-commands'
import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command'

addMatchImageSnapshotCommand({
  capture: 'viewport',
})
