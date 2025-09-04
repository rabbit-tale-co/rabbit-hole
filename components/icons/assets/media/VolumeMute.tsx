import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineVolumeMute: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.707 9.293a1 1 0 1 0-1.414 1.414L17.586 12l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 13.414l1.293 1.293a1 1 0 0 0 1.414-1.414L20.414 12l1.293-1.293a1 1 0 0 0-1.414-1.414L19 10.586l-1.293-1.293Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11 7.004c0-.96-1.223-1.369-1.8-.6L6.5 10H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1.5l2.7 3.596c.577.769 1.8.36 1.8-.6V7.004ZM7.601 5.202C9.331 2.898 13 4.122 13 7.004v9.992c0 2.882-3.668 4.106-5.399 1.801L5.501 16H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h.5l2.101-2.798Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidVolumeMute: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.707 9.293a1 1 0 1 0-1.414 1.414L17.586 12l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 13.414l1.293 1.293a1 1 0 0 0 1.414-1.414L20.414 12l1.293-1.293a1 1 0 0 0-1.414-1.414L19 10.586l-1.293-1.293ZM13 6.004c0-1.712-2.011-2.632-3.307-1.514L5.628 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.628l4.065 3.51c1.296 1.118 3.307.197 3.307-1.515V6.005Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneVolumeMute: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.707 9.293a1 1 0 1 0-1.414 1.414L17.586 12l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 13.414l1.293 1.293a1 1 0 0 0 1.414-1.414L20.414 12l1.293-1.293a1 1 0 0 0-1.414-1.414L19 10.586l-1.293-1.293Z'
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
