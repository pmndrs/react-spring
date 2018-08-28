import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'

const testStories = storiesOf('Tests', module)

testStories.addDecorator(withKnobs)

export { testStories }
