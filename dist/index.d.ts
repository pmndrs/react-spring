// This is the file TypeScript will see when it looks inside the module without any sub-paths
// This should just reexport the package.json's "main".
export * from './web'
// Add this (and to all other entry points) if a default export is ever added
// export { default } from './web'
