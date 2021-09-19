import { useCallback, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSpring, animated } from 'react-spring'
import clsx from 'clsx'

import { PAGES, Page } from 'references/pages'

import { useMeasure } from 'hooks/useMeasure'

const MenuLink = ({ label, to, currentPath, ...rest }) => {
  return (
    <Link href={to} passHref>
      <a
        className={clsx({
          'is-active': to === currentPath,
        })}
        {...rest}>
        {label}
      </a>
    </Link>
  )
}

const MenuHeader = ({ label, expanded, ...rest }) => (
  <Link href="">
    <a
      className={clsx({
        'can-expand': true,
        'is-expanded': expanded,
      })}
      {...rest}>
      {label}
    </a>
  </Link>
)

const CollapsibleMenu = ({
  label,
  pathPrefix,
  currentPath,
  children,
  open,
}) => {
  const [bind, { height }] = useMeasure()
  const [expanded, setExpanded] = useState<boolean>(
    (open && currentPath === '/') || currentPath.startsWith(pathPrefix)
  )
  const props = useSpring({ height: expanded ? height : 0 })

  const handleClick = useCallback(e => {
    e.preventDefault()
    setExpanded(prevExpanded => !prevExpanded)
  }, [])

  return (
    <>
      <MenuHeader expanded={expanded} label={label} onClick={handleClick} />
      <animated.div style={{ overflow: 'hidden', ...props }}>
        <div {...bind}>{children}</div>
      </animated.div>
    </>
  )
}

export const Nav = () => {
  return (
    <NavContainer>
      <MainMenuUl>{PAGES.map(NavTree)}</MainMenuUl>
    </NavContainer>
  )
}

const NavTree = (page: Page) => {
  const { pathname } = useRouter()
  if (page.routes) {
    return (
      <li key={page.title}>
        <CollapsibleMenu
          pathPrefix={`/${page.title}`}
          label={page.title}
          currentPath={pathname}
          open>
          <SubMenuUl>{page.routes.map(NavTree)}</SubMenuUl>
        </CollapsibleMenu>
      </li>
    )
  } else {
    return (
      <li key={page.title}>
        <MenuLink to={page.url} label={page.title} currentPath={pathname} />
      </li>
    )
  }
}

const NavContainer = styled.nav`
  position: sticky;
  top: 20px;
  left: 20px;
  width: 260px;
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: rgba(54, 54, 69, 0.05);
  border-radius: 20px;
`

const MainMenuUl = styled.ul`
  padding: 20px 30px;
  li a {
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    color: #000;
  }

  li a.is-active {
    color: #ff4f4f;
  }

  li a.can-expand::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 6px 4px 0;
    border-color: transparent #6a6a7b transparent transparent;
    border-radius: 1px;
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    margin-left: 10px;
    margin-bottom: 2px;
  }

  li a.can-expand.is-expanded::after {
    border-width: 6px 4px 0 4px;
    border-color: #6a6a7b transparent transparent transparent;
  }

  li {
    margin-top: 10px;
  }
`
const SubMenuUl = styled.ul`
  overflow: hidden;
  li a {
    font-size: 16px;
    font-weight: 400;
    text-decoration: none;
    color: #000;
  }

  li a.is-active {
    color: #ff4f4f;
  }

  li {
    margin-top: 10px;
    margin-left: 20px;
  }
`
