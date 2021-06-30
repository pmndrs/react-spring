import { PureComponent } from 'react'

interface State {
  hasError: boolean
}

interface Props {}

export class ErrorBoundary extends PureComponent<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    const { hasError } = this.state
    const { children } = this.props

    return hasError ? <h1>Something went wrong.</h1> : children
  }
}
