import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineBookmark: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 7a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v11.99c0 2.553-2.987 3.939-4.937 2.29l-2.417-2.044a1 1 0 0 0-1.292 0L8.937 21.28C6.987 22.929 4 21.543 4 18.99V7Zm5-3a3 3 0 0 0-3 3v11.99a1 1 0 0 0 1.646.763l2.417-2.044a3 3 0 0 1 3.874 0l2.417 2.044A1 1 0 0 0 18 18.989V7a3 3 0 0 0-3-3H9Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidBookmark: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8 2a4 4 0 0 0-4 4v14c0 1.684 1.953 2.615 3.26 1.554l4.11-3.335a1 1 0 0 1 1.26 0l4.11 3.335c1.307 1.06 3.26.13 3.26-1.553V6a4 4 0 0 0-4-4H8Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneBookmark: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8 2a4 4 0 0 0-4 4v14c0 1.684 1.953 2.615 3.26 1.554l4.11-3.335a1 1 0 0 1 1.26 0l4.11 3.335c1.307 1.06 3.26.13 3.26-1.553V6a4 4 0 0 0-4-4H8Z'
      fill='currentColor'
    />
  </svg>
)
