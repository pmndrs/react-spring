import { Text, View, Image, ViewProps, TextProps } from 'react-native'
import { ComponentClass, ReactNode } from 'react'

export const primitives = {
  View: View as ComponentClass<
    // @types/react-native forgot to add "children" to the "View" component??
    ViewProps & { children?: ReactNode }
  >,
  Text: Text as ComponentClass<
    // @types/react-native forgot to add "children" to the "Text" component??
    TextProps & { children?: ReactNode }
  >,
  Image,
}
