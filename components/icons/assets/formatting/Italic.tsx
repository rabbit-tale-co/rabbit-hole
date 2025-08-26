import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineItalic: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M14.217 2.024a1 1 0 0 1 .76 1.193l-4 18a1 1 0 1 1-1.953-.434l4-18a1 1 0 0 1 1.193-.76Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M9 2a1 1 0 0 0 0 2h10a1 1 0 1 0 0-2H9ZM5 20a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H5Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidItalic: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.436 5.184C3 6.04 3 7.16 3 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 21 7.16 21 9.4 21h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 17.96 21 16.84 21 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748ZM16 5h-6a1 1 0 0 0 0 2h1.82l-1.667 10H8a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1.82l1.667-10H16a1 1 0 1 0 0-2Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneItalic: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M3 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6V9.4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 5h6a1 1 0 1 1 0 2h-2.153L12.18 17H14a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h2.153l1.666-10H10a1 1 0 0 1 0-2Z'
      fill='currentColor'
    />
  </svg>
)
