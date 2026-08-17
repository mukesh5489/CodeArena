import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) {
  const variantStyles = {
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    text: 'rounded-md h-4 my-1',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`skeleton ${variantStyles[variant] || variantStyles.rectangular} ${className}`}
      style={style}
    />
  );
}
