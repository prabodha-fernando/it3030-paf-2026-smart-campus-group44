import React from 'react'

/**
 * StatusBadge Component
 * Displays a styled pill badge indicating the operational status of a campus resource.
 *
 * @param {Object} props
 * @param {'ACTIVE' | 'OUT_OF_SERVICE'} props.status - The current status of the resource
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The visual size of the badge
 */
const StatusBadge = ({ status, size = 'md' }) => {
  const isActive = status === 'ACTIVE'

  const sizes = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-0.5 gap-1',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  }

  return (
    <span 
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full ring-1 transition-all duration-300 ${sizes[size] || sizes.md} ${
        isActive
          ? 'bg-primary-50 text-primary-700 ring-primary-100 shadow-[0_2px_10px_-3px_rgba(var(--color-primary-500),0.1)]'
          : 'bg-red-50 text-red-600 ring-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.1)]'
      }`}
    >
      {/* Dot Wrapper for Animation */}
      <span className={`relative flex items-center justify-center shrink-0 ${dotSizes[size] || dotSizes.md}`}>
        {/* Animated Pulse Ring (Only plays when Active) */}
        {isActive && (
          <span className="absolute inline-flex w-full h-full rounded-full opacity-60 bg-primary-400 animate-ping" />
        )}
        {/* Solid Core Dot */}
        <span className={`relative inline-flex rounded-full w-full h-full ${isActive ? 'bg-primary-500' : 'bg-red-500'}`} />
      </span>
      
      {isActive ? 'Active' : 'Out of Service'}
    </span>
  )
}

export default StatusBadge