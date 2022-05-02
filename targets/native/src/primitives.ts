import {
  Text,
  View,
  Image,
  ImageProps,
  ViewProps,
  TextProps,
} from 'react-native'
import { ComponentClass, ReactNode } from 'react'

export const primitives = {
  View: View as ComponentClass<ViewProps & { children?: ReactNode }>,
  Text: Text as ComponentClass<TextProps & { children?: ReactNode }>,
  Image: Image as ComponentClass<ImageProps>,
}
