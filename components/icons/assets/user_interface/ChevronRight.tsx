import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineChevronRight: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8.293 5.293a1 1 0 0 0 0 1.414L13.586 12l-5.293 5.293a1 1 0 1 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414l-6-6a1 1 0 0 0-1.414 0Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidChevronRight: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8.586 5.586a2 2 0 0 0 0 2.828L12.172 12l-3.586 3.586a2 2 0 1 0 2.828 2.828l5-5a2 2 0 0 0 0-2.828l-5-5a2 2 0 0 0-2.828 0Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneChevronRight: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8.293 5.293a1 1 0 0 0 0 1.414L13.586 12l-5.293 5.293a1 1 0 1 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414l-6-6a1 1 0 0 0-1.414 0Z'
      fill='currentColor'
    />
  </svg>
)
