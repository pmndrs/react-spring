import type { ProcessedDoc } from './docs'

export type SubtitleSchema = Record<
  string,
  { href: string; label: string; id: string }[]
>

export const makeSubnavigation = (docs: ProcessedDoc[]): SubtitleSchema =>
  docs.reduce((acc, curr) => {
    acc[curr.id] = curr.subtitles.map(({ id, title }) => ({
      href: `#${id}`,
      label: title,
      id,
    }))

    return acc
  }, {} as SubtitleSchema)

interface NavigationSchemaItem {
  sidebarPosition?: number
  title: string
  children: NavigationSchemaItem[]
  id: string
  href: string
}

export type NavigationSchema = Array<NavigationSchemaItem>

export const makeNavigation = (docs: ProcessedDoc[]): NavigationSchema => {
  const unorderedDocs = docs.reduce((acc, doc) => {
    const routes = doc.docPath.split('/').slice(1)

    let prevSchema: NavigationSchemaItem | null = null
    routes.reduce((schemas, route, level) => {
      const doesSchemaAtRouteExist = schemas.find(schem => schem.id === route)

      const isIndexRoute = level === routes.length - 1 && doc.baseID === 'index'

      if (route === '') {
        schemas.push({
          href: '/docs',
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
        schemas.push(schemaAtRoute)
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
