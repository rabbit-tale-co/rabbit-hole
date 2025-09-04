import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineBold: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M5 10h8a6 6 0 0 1 0 12H8a3 3 0 0 1-3-3v-9Zm2 2v7a1 1 0 0 0 1 1h5a4 4 0 0 0 0-8H7Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M5 5a3 3 0 0 1 3-3h4a5 5 0 0 1 0 10H5V5Zm3-1a1 1 0 0 0-1 1v5h5a3 3 0 1 0 0-6H8Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidBold: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M14 9a2 2 0 0 1-2 2h-2V7h2a2 2 0 0 1 2 2Zm-4 8v-4h3a2 2 0 1 1 0 4h-3Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.436 5.184C3 6.04 3 7.16 3 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 21 7.16 21 9.4 21h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 17.96 21 16.84 21 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748ZM8 7a2 2 0 0 1 2-2h2a4 4 0 0 1 3.063 6.572A4 4 0 0 1 13 19h-3a2 2 0 0 1-2-2V7Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneBold: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      className='opacity-50'
      d='M3 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6V9.4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a4 4 0 0 0 2.063-7.428A4 4 0 0 0 12 5h-2Zm2 6a2 2 0 1 0 0-4h-2v4h2Zm-2 2v4h3a2 2 0 1 0 0-4h-3Z'
      fill='currentColor'
    />
  </svg>
)
