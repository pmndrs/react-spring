import type { ProcessedDoc } from './docs'

export type SubtitleSchemaItem = Array<{
  href: string
  label: string
  id: string
}>

export type SubtitleSchema = Record<string, SubtitleSchemaItem>

export const makeSubnavigation = (docs: ProcessedDoc[]): SubtitleSchema =>
  docs.reduce((acc, curr) => {
    const id = `${curr.docPath === '/' ? curr.docPath : `${curr.docPath}/`}${
      curr.baseID
    }`

    if (!curr.noSubnav) {
      acc[id] = curr.subtitles.map(({ id, title }) => ({
        href: `#${id}`,
        label: title,
        id,
      }))
    }

    return acc
  }, {} as SubtitleSchema)

export interface NavigationSchemaItem {
  sidebarPosition?: number
  title: string
  children: NavigationSchemaItem[]
  id: string
  href: string
  noPage?: boolean
}

export type NavigationSchema = Array<NavigationSchemaItem>

export const makeNavigation = (docs: ProcessedDoc[]): NavigationSchema => {
  const unorderedDocs = docs.reduce((acc, doc) => {
    const routes = doc.docPath.split('/').slice(1)
    // console.log('---------', routes[0], '/', doc.baseID, '---------')

    let prevSchema: NavigationSchemaItem | null = null
    routes.reduce((schemas, route, level) => {
      const doesSchemaAtRouteExist = schemas.find(schem => schem.id === route)

      const isIndexRoute = level === routes.length - 1 && doc.baseID === 'index'

      if (route === '') {
        schemas.push({
          href: doc.noPage
            ? ''
            : `/docs${isIndexRoute ? '' : `/${doc.baseID}`}`,
          id: doc.baseID,
          title: doc.title,
          sidebarPosition: doc.sidebarPosition,
          children: [],
        })
        return schemas
      }

      const schemaAtRoute =
        doesSchemaAtRouteExist && !isIndexRoute
          ? doesSchemaAtRouteExist
          : {
              href: prevSchema
                ? `${prevSchema.href}/${route}`
                : `/docs/${route}`,
              id: route,
              noPage: doc.noPage,
              children: doesSchemaAtRouteExist
                ? doesSchemaAtRouteExist.children
                : [],
              sidebarPosition: isIndexRoute ? doc.sidebarPosition : undefined,
              title: isIndexRoute ? doc.title : route,
            }

      /**
       * If we've made a new schema object then
       * append it the current list of schemas
       */
      if (!doesSchemaAtRouteExist || isIndexRoute) {
        const index = schemas.findIndex(
          schema => schema.id === schemaAtRoute.id
        )
        if (index < 0) {
          schemas.push(schemaAtRoute)
        } else {
          schemas[index] = schemaAtRoute
        }
      }

      /**
       * If this isn't the last route return
       * the children array of schemas
       */
      if (level !== routes.length - 1 || isIndexRoute) {
        if (!prevSchema) {
          prevSchema = schemaAtRoute
        }
        return schemaAtRoute.children
      }

      /**
       * If this is the last in the route
       * array then we attach the document data
       */
      if (level === routes.length - 1) {
        if (prevSchema) {
          prevSchema = null
        }
        schemaAtRoute.children.push({
          id: doc.baseID,
          title: doc.title,
          sidebarPosition: doc.sidebarPosition,
          children: [],
          href: `${schemaAtRoute.href}/${doc.baseID}`,
          noPage: doc.noPage,
        })

        return schemas
      }

      return schemas
    }, acc)

    return acc
  }, [] as NavigationSchema)

  const sortSchemaArray = (
    a: NavigationSchemaItem,
    b: NavigationSchemaItem
  ) => {
    if (a.children.length > 0) {
      a.children.sort(sortSchemaArray)
    }

    return (a.sidebarPosition ?? Infinity) - (b.sidebarPosition ?? Infinity)
  }

  const orderedDocs = unorderedDocs.sort(sortSchemaArray)

  return orderedDocs
}
