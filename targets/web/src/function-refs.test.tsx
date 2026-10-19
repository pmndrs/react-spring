import * as React from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { animated, SpringValue } from './index'
import { createHost } from '@react-spring/animated'

it('animates a function ref prop without rendering every frame', async () => {
  let renders = 0
  const FunctionBox = (props: React.ComponentPropsWithRef<'div'>) => {
    renders++
    return <div {...props} data-renders={renders} />
  }
  const Box = animated(FunctionBox)
  const ref = React.createRef<HTMLDivElement>()
  const opacity = new SpringValue(0)
  const screen = await render(<Box ref={ref} style={{ opacity }} />)
  const element = ref.current
  expect(element).toBeInstanceOf(HTMLDivElement)
  const initialRenders = element?.dataset.renders
  const animation = opacity.start(1, { config: { duration: 30 } })
  await advanceUntilIdle()
  await animation
  expect(element?.style.opacity).toBe('1')
  expect(element?.dataset.renders).toBe(initialRenders)
  await screen.unmount()
  expect(ref.current).toBeNull()
  opacity.set(0)
})

it('renders function components that do not forward their refs', async () => {
  const Box = animated(({ title }: { title: string }) => <div title={title} />)
  const title = new SpringValue('first')
  const screen = await render(<Box title={title} />)
  title.set('second')
  await advanceUntilIdle()
  await expect.element(screen.getByTitle('second')).toBeInTheDocument()
})

it('falls back to rendering when a host rejects direct updates', async () => {
  const { animated: animate } = createHost([], {
    applyAnimatedValues: () => false,
  })
  const Box = animate((props: React.ComponentPropsWithRef<'div'>) => (
    <div {...props} />
  ))
  const title = new SpringValue('first')
  const screen = await render(<Box title={title} />)
  title.set('second')
  await advanceUntilIdle()
  await expect.element(screen.getByTitle('second')).toBeInTheDocument()
})

it('preserves callback ref cleanup', async () => {
  const Box = animated((props: React.ComponentPropsWithRef<'div'>) => (
    <div {...props} />
  ))
  let attached: HTMLDivElement | null = null
  let cleaned = false
  const screen = await render(
    <Box
      ref={(node: HTMLDivElement | null) => {
        attached = node
        return () => {
          cleaned = true
        }
      }}
    />
  )
  expect(attached).toBeInstanceOf(HTMLDivElement)
  cleaned = false
  await screen.unmount()
  expect(cleaned).toBe(true)
})

it('continues to support forwardRef components', async () => {
  const Box = animated(
    React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
      (props, ref) => <div {...props} ref={ref} />
    )
  )
  const ref = React.createRef<HTMLDivElement>()
  const title = new SpringValue('first')
  await render(<Box ref={ref} title={title} />)
  title.set('second')
  await advanceUntilIdle()
  expect(ref.current?.title).toBe('second')
})
