import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineTrash: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M7 8v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8h2v10a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8h2Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 11a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M8 6V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h3a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2h3Zm2-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4V5Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidTrash: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-9Zm4 3a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0v-4Zm4 0a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0v-4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 2a2 2 0 0 0-2 2H5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2h-3a2 2 0 0 0-2-2h-4Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneTrash: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M19 8H5v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10 12a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M8 6V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h3a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2h3Zm2-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4V5Z'
      fill='currentColor'
    />
  </svg>
)
