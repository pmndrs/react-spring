import { ButtonCopy } from '../Buttons/ButtonCopy'
import { Copy } from '../Text/Copy'
import { copyText, field } from './FieldCode.css'

const INSTALL_LINE = 'npm i @react-spring/web'

export const CodeField = () => {
  return (
    <div className={field}>
      <Copy className={copyText} fontStyle="code">
        {INSTALL_LINE}
      </Copy>
      <ButtonCopy>{INSTALL_LINE}</ButtonCopy>
    </div>
  )
}
