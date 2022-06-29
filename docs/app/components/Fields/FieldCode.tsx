import { styled } from '~/styles/stitches.config'

import { ButtonCopy } from '../Buttons/ButtonCopy'
import { Copy } from '../Text/Copy'

const INSTALL_LINE = 'npm i @react-spring/web'

export const CodeField = () => {
  return (
    <Field>
      <CopyText fontStyle="$code">{INSTALL_LINE}</CopyText>
      <ButtonCopy>{INSTALL_LINE}</ButtonCopy>
    </Field>
  )
}

const Field = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  border: 'solid 1px $steel100',
  padding: 7,
  pl: 14,
  borderRadius: '$r8',
})

const CopyText = styled(Copy, {
  fontFamily: '$mono',
})
