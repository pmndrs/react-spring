import type { Format, Options } from 'tsup'

export const defaultConfig = (
  config: Omit<Options, 'external' | 'format' | 'minify' | 'dts'>,
  options: Options
): Options => ({
  ...config,
  clean: !options.watch,
  target: 'esnext',
  external: [
    'react',
    'react-dom',
    'react-native',
    '@react-three/fiber',
    'three',
    'react-konva',
    'konva',
    'react-zdog',
    'zdog',
  ],
  dts: true,
  minify: !options.watch,
  format: ['cjs', 'esm'] as Format[],
})
