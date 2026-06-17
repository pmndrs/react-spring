import type { UserConfig } from 'tsdown'

export interface ConfigOptions {
  name: string
  entry: string
}

export function defaultConfig(options: ConfigOptions): UserConfig
