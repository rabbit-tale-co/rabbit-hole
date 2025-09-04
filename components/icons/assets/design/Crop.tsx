import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineCrop: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M3 7a1 1 0 0 1 1-1h11a3 3 0 0 1 3 3v11a1 1 0 1 1-2 0V9a1 1 0 0 0-1-1H4a1 1 0 0 1-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M21 17a1 1 0 0 1-1 1H9a3 3 0 0 1-3-3V4a1 1 0 1 1 2 0v11a1 1 0 0 0 1 1h11a1 1 0 0 1 1 1Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidCrop: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M21 17a1 1 0 0 1-1 1H9a3 3 0 0 1-3-3V4a1 1 0 1 1 2 0v11a1 1 0 0 0 1 1h11a1 1 0 0 1 1 1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2ZM4 6a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2H4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 7a1 1 0 0 1 1-1h4a3 3 0 0 1 3 3v4a1 1 0 1 1-2 0V9a1 1 0 0 0-1-1h-4a1 1 0 0 1-1-1Zm7 9a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneCrop: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      opacity={0.5}
      d='M3 7a1 1 0 0 1 1-1h11a3 3 0 0 1 3 3v11a1 1 0 1 1-2 0V9a1 1 0 0 0-1-1H4a1 1 0 0 1-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M21 17a1 1 0 0 1-1 1H9a3 3 0 0 1-3-3V4a1 1 0 1 1 2 0v11a1 1 0 0 0 1 1h11a1 1 0 0 1 1 1Z'
      fill='currentColor'
    />
  </svg>
)
