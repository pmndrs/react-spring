import ReactSelect, {
  ControlProps,
  MenuProps,
  PlaceholderProps,
  ValueContainerProps,
  MultiValue,
  OptionProps,
} from 'react-select'

import { dark, styled } from '~/styles/stitches.config'

export interface SelectProps {
  options?: { value: string; label: string }[]
  placeholder: string
  onChange?: (newValue: MultiValue<{ value: string }>) => void
  value: MultiValue<{ value: string }>
}

export const Select = ({
  placeholder,
  options = [],
  onChange,
  value,
}: SelectProps) => {
  const handleChange = (newValue: MultiValue<{ value: string }>) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <ReactSelect
      placeholder={placeholder}
      options={options}
      isClearable={false}
      isMulti
      isSearchable={false}
      hideSelectedOptions={false}
      // menuIsOpen
      // @ts-ignore
      onChange={handleChange}
      components={{
        // @ts-ignore
        Control: SelectControl,
        DropdownIndicator: null,
        IndicatorSeparator: null,
        // @ts-ignore
        Menu: SelectMenu,
        Placeholder: SelectPlaceholder,
        // @ts-ignore
        Option: SelectOption,
        ValueContainer: props => (
          // @ts-ignore
          <SelectValueContainer {...props} placeholder={placeholder} />
        ),
      }}
      styles={{
        container: () => ({
          display: 'inline-block',
          margin: '0 6px',

          '@media(min-width: 768px)': {
            position: 'relative',
          },
        }),
      }}
      value={value}
    />
  )
}

const SelectControl = (props: ControlProps) => {
  const { children, isFocused, innerRef, innerProps } = props

  return (
    <ControlDiv
      // @ts-ignore
      ref={innerRef}
      {...innerProps}
      css={{
        borderBottom: isFocused ? 'solid 2px $red100' : 'solid 2px $black',
      }}>
      {children}
    </ControlDiv>
  )
}

const ControlDiv = styled('div', {
  background: 'transparent',
  fontWeight: '$default',
  cursor: 'pointer',
})

const SelectPlaceholder = ({
  children,
}: Pick<PlaceholderProps, 'children'>) => (
  <PlaceholderSpan>{children}</PlaceholderSpan>
)

const PlaceholderSpan = styled('span', {
  fontSize: '$XXS',
  lineHeight: '$XXS',

  '@tabletUp': {
    fontSize: '$XS',
    lineHeight: '$XS',
  },
})

const SelectValueContainer = ({
  children,
  placeholder,
}: ValueContainerProps & { placeholder: string }) => {
  const [placeholderChild, menu] = children as React.ReactElement[]

  if (placeholderChild.key !== 'placeholder') {
    return (
      <ValueContainerDiv>
        <SelectPlaceholder>{placeholder}</SelectPlaceholder>
        {menu}
      </ValueContainerDiv>
    )
  }

  return <ValueContainerDiv>{children}</ValueContainerDiv>
}

const ValueContainerDiv = styled('div', {})

const SelectMenu = (props: MenuProps) => {
  const { children, innerRef, innerProps } = props

  return (
    <>
      <MenuBackground />
      {/* @ts-ignore */}
      <Menu ref={innerRef} {...innerProps}>
        {children}
      </Menu>
    </>
  )
}

const MenuBackground = styled('div', {
  backgroundColor: '$white',
  opacity: 0.2,
  position: 'absolute',
  inset: 0,
  zIndex: '$1',
})

const Menu = styled('div', {
  position: 'absolute',
  zIndex: '$2',
  background: '$codeBackground',
  color: '$black',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  overflow: 'hidden',
  boxShadow:
    'rgba(27,31,36,0.12) 0px 1px 3px, rgba(66,74,83,0.12) 0px 8px 24px',
  width: '100%',
  borderTopRightRadius: '$r8',
  borderTopLeftRadius: '$r8',

  bottom: 0,
  left: 0,

  [`.${dark} &`]: {
    boxShadow:
      'rgba(27,31,36,0.5) 0px 1px 3px, rgba(18 21 23 / 40%) 0px 8px 24px',
  },

  '@tabletUp': {
    bottom: 'unset',
    borderRadius: '$r8',
    width: 200,
    fontSize: '$XS',
    lineHeight: '$XS',
  },
})

const SelectOption = (props: OptionProps) => {
  const { children, isFocused, isSelected, innerRef, innerProps } = props

  return (
    <Option
      // @ts-ignore
      ref={innerRef}
      isFocused={isFocused}
      style={{ backgroundColor: isFocused ? '#ff6d6d99' : 'transparent' }}
      {...innerProps}>
      {children}
      {isSelected ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"></path>
        </svg>
      ) : null}
    </Option>
  )
}

const Option = styled('div', {
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$10 $40 $10 $20',
})
