import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const themeGroup = style({
  height: '4.6rem',
  width: '9.2rem',
  position: 'relative',
  backgroundColor: vars.colors.codeBackground,
  borderRadius: vars.radii.r8,
  zIndex: 0,
})

export const themePicker = style({
  background: 'transparent',
  border: 'none',
  width: '50%',
  height: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: vars.radii.r8,
  padding: '0.2rem',
  cursor: 'pointer',
  position: 'relative',
  zIndex: 1,
})

export const themeActiveBlob = style({
  height: 42,
  backgroundColor: vars.colors.white,
  position: 'absolute',
  zIndex: 0,
  top: 2,
  borderRadius: vars.radii.r8,
  transition: 'left 400ms ease-out, right 400ms ease-out',
})
