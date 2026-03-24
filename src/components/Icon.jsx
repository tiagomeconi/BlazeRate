import React from 'react';

/**
 * Wrapper for Google Material Symbols Rounded.
 * Usage: <Icon name="search" />
 *        <Icon name="star" filled size={24} />
 */
const Icon = ({ name, size = 20, filled = false, style = {}, className = '' }) => (
  <span
    className={`material-symbols-rounded ${className}`}
    style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      ...style,
    }}
  >
    {name}
  </span>
);

export default Icon;
