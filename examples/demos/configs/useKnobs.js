import React, { useState } from 'react'

function Knob({ name, value, onChange, min = 1, max = 500 }) {
  return (
    <div style={{ position: 'relative', margin: 10 }}>
      <label>
        {name}: {value}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
      </label>
    </div>
  )
}

export default function useKnobs(initialValues, options) {
  const [values, setValues] = useState(initialValues)
  return [
    values,
    <div
      style={{
        top: 20,
        left: 20,
        width: 150,
        zIndex: 999999,
        position: 'absolute',
        padding: 20,
      }}>
      {Object.keys(values).map(name => (
        <Knob
          {...options}
          key={name}
          name={name}
          value={values[name]}
          onChange={newValue =>
            setValues({
              ...values,
              [name]: newValue,
            })
          }
        />
      ))}
    </div>,
  ]
}
