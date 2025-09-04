import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineDragIndicator: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M16 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidDragIndicator: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M16 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneDragIndicator: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M16 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      opacity={0.5}
      d='M8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
      fill='currentColor'
    />
  </svg>
)
