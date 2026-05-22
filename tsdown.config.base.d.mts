import type { UserConfig } from 'tsdown'

export type BundleName =
  | 'development'
  | 'production.min'
  | 'legacy-esm'
  | 'modern'
  | 'modern.development'
  | 'modern.production.min'

export interface ConfigOptions {
  name: string
  entry: string
  buildFilter?: BundleName[]
}

export function defaultConfig(options: ConfigOptions): UserConfig[]
