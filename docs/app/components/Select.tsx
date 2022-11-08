import ReactSelect, {
  ControlProps,
  MenuProps,
  PlaceholderProps,
  ValueContainerProps,
  MultiValue,
} from 'react-select'

import { styled } from '~/styles/stitches.config'

export interface SelectProps {
  options?: { value: string; label: string }[]
  placeholder: string
  onChange?: (newValue: MultiValue<{ value: string }>) => void
}

export const Select = ({
  placeholder,
  options = [],
  onChange,
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
      // @ts-ignore
      onChange={handleChange}
      components={{
        Control: SelectControl,
        DropdownIndicator: null,
        IndicatorSeparator: null,
        Menu: SelectMenu,
        Placeholder: SelectPlaceholder,
        ValueContainer: props => (
          // @ts-ignore
          <SelectValueContainer {...props} placeholder={placeholder} />
        ),
      }}
      styles={{
        container: () => ({
          position: 'relative',
          display: 'inline-block',
          margin: '0 6px',
        }),
        option: (provided, state) => ({
          ...provided,
          cursor: 'pointer',
          backgroundColor: state.isFocused
            ? '#ff6d6d99'
            : state.isSelected
            ? '#ff6d6d99'
            : 'transparent',
        }),
      }}
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
  hasValue,
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
    // @ts-ignore
    <Menu ref={innerRef} {...innerProps}>
      {children}
    </Menu>
  )
}

const Menu = styled('div', {
  position: 'absolute',
  zIndex: '$1',
  //   background: '$white',
  background: '$codeBackground',
  borderRadius: '$r8',
  color: '$black',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  overflow: 'hidden',
  width: 200,

  '@tabletUp': {
    fontSize: '$XS',
    lineHeight: '$XS',
  },
})
