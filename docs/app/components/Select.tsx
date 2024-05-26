import ReactSelect, {
  ControlProps,
  MenuProps,
  PlaceholderProps,
  ValueContainerProps,
  MultiValue,
  OptionProps,
} from 'react-select'
import {
  controlDiv,
  menu,
  menuBackground,
  option,
  placeholderSpan,
} from './Select.css'

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
    <div
      className={controlDiv({
        isFocused,
      })}
      // @ts-ignore
      ref={innerRef}
      {...innerProps}
    >
      {children}
    </div>
  )
}

const SelectPlaceholder = ({
  children,
}: Pick<PlaceholderProps, 'children'>) => (
  <span className={placeholderSpan}>{children}</span>
)

const SelectValueContainer = ({
  children,
  placeholder,
}: ValueContainerProps & { placeholder: string }) => {
  const [placeholderChild, menu] = children as React.ReactElement[]

  if (placeholderChild.key !== 'placeholder') {
    return (
      <div>
        <SelectPlaceholder>{placeholder}</SelectPlaceholder>
        {menu}
      </div>
    )
  }

  return <div>{children}</div>
}

const SelectMenu = (props: MenuProps) => {
  const { children, innerRef, innerProps } = props

  return (
    <>
      <div className={menuBackground} />
      {/* @ts-ignore */}
      <div className={menu} ref={innerRef} {...innerProps}>
        {children}
      </div>
    </>
  )
}

const SelectOption = (props: OptionProps) => {
  const { children, isFocused, isSelected, innerRef, innerProps } = props

  return (
    <div
      className={option}
      // @ts-ignore
      ref={innerRef}
      // @ts-expect-error - innerProps is not typed
      isFocused={isFocused}
      style={{ backgroundColor: isFocused ? '#ff6d6d99' : 'transparent' }}
      {...innerProps}
    >
      {children}
      {isSelected ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      ) : null}
    </div>
  )
}
