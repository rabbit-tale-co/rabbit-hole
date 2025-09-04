import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineHeadphones: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 5a7 7 0 0 0-7 7v5.531a1 1 0 1 1-2 0V12a9 9 0 0 1 18 0v6a1 1 0 1 1-2 0v-6a7 7 0 0 0-7-7Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M15 15.955a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Zm4 0v2.09a1 1 0 1 1-2 0v-2.09a1 1 0 1 1 2 0Zm-16 0a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Zm4 0v2.09a1 1 0 0 1-2 0v-2.09a1 1 0 0 1 2 0Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidHeadphones: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 5a7 7 0 0 0-7 7v5.531a1 1 0 1 1-2 0V12a9 9 0 0 1 18 0v6a1 1 0 1 1-2 0v-6a7 7 0 0 0-7-7Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M15 15.955a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Zm-12 0a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneHeadphones: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      opacity='0.5'
      d='M12 5a7 7 0 0 0-7 7v5.531a1 1 0 1 1-2 0V12a9 9 0 0 1 18 0v6a1 1 0 1 1-2 0v-6a7 7 0 0 0-7-7Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M15 15.955a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Zm-12 0a3 3 0 0 1 6 0v2.09a3 3 0 1 1-6 0v-2.09Z'
      fill='currentColor'
    />
  </svg>
)
