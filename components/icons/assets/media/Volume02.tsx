import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineVolume02: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M22 6a1 1 0 1 0-2 0v12a1 1 0 1 0 2 0V6Zm-4 4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11 7.004c0-.96-1.223-1.369-1.8-.6L6.5 10H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1.5l2.7 3.597c.577.768 1.8.36 1.8-.6V7.003ZM7.601 5.203C9.331 2.898 13 4.122 13 7.004v9.992c0 2.882-3.668 4.106-5.399 1.802L5.501 16H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h.5l2.101-2.797Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidVolume02: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M22 6a1 1 0 1 0-2 0v12a1 1 0 1 0 2 0V6Zm-4 4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4Zm-5-3.996c0-1.712-2.011-2.632-3.307-1.514L5.628 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.628l4.065 3.51c1.296 1.118 3.307.197 3.307-1.515V6.005Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneVolume02: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M22 6a1 1 0 1 0-2 0v12a1 1 0 1 0 2 0V6Zm-4 4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      opacity='0.5'
      d='M13 6.004c0-1.712-2.011-2.632-3.307-1.514L5.628 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.628l4.065 3.51c1.296 1.118 3.307.197 3.307-1.515V6.005Z'
      fill='currentColor'
    />
  </svg>
)
