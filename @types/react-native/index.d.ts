// Avoid global conflicts from "@types/react-native" in node_modules
declare module 'react-native' {
  export * from 'react-native-types'
}
