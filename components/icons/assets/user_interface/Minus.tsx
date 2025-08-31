import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineMinus: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M19 11a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h14Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidMinus: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 12a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H6a2 2 0 0 1-2-2Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneMinus: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M19 11a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h14Z'
      fill='currentColor'
    />
  </svg>
)
