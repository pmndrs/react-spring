import { configure } from '@storybook/react'
import 'babel-polyfill'
import '../stories/index.css'

// Load all files in the stories folder with a .js extension
const req = require.context('../stories/', true, /.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
