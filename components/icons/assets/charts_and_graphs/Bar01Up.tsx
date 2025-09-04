import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineBar01Up: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={getIconClassName(className)}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M21 16a3 3 0 0 0-3-3H8a1 1 0 1 0 0 2h10a1 1 0 1 1 0 2H8a1 1 0 1 0 0 2h10a3 3 0 0 0 3-3Zm-6-8a3 3 0 0 0-3-3H8a1 1 0 0 0 0 2h4a1 1 0 1 1 0 2H8a1 1 0 0 0 0 2h4a3 3 0 0 0 3-3ZM4 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidBar01Up: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={getIconClassName(className)}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M21 16a2 2 0 0 0-2-2H9a2 2 0 1 0 0 4h10a2 2 0 0 0 2-2Zm-6-8a2 2 0 0 0-2-2H9a2 2 0 1 0 0 4h4a2 2 0 0 0 2-2ZM4 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneBar01Up: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={getIconClassName(className)}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M19 13a2 2 0 1 1 0 4H9a2 2 0 1 1 0-4h10Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M13 6a2 2 0 1 1 0 4H9a2 2 0 1 1 0-4h4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M4 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z'
      fill='currentColor'
    />
  </svg>
)
