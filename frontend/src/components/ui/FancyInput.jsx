import * as React from 'react'

/**
 * FancyInput — animated conic-gradient border with rotating light effect.
 * Drop-in replacement for the plain Input component.
 * Forwards all standard input props (type, value, onChange, disabled, etc.)
 */
const FancyInput = React.forwardRef(({ className, style, ...props }, ref) => {
  return (
    <div className="sv-fancy-input-border">
      <div className="sv-fancy-input-content">
        <div className="sv-fancy-input-light">
          <span className="sv-fancy-clip" />
        </div>
        <input
          ref={ref}
          className="sv-fancy-input"
          {...props}
        />
      </div>
    </div>
  )
})

FancyInput.displayName = 'FancyInput'
export { FancyInput }
