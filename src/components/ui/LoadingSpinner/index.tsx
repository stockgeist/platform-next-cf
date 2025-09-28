import React from 'react'

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  // Calculate border thickness based on size
  const thickness = Math.max(2, Math.floor(size / 12))

  return (
    <div
      className="border-t-primary animate-spin rounded-full border-solid border-gray-300"
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderTopWidth: thickness,
      }}
    />
  )
}
