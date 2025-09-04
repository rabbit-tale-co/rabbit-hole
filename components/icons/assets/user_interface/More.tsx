import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineMore: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1.5 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM19 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1.5 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM5 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1.5 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidMore: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneMore: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 9c-1.578 0-2.857 1.343-2.857 3s1.279 3 2.857 3c1.578 0 2.857-1.343 2.857-3S13.577 9 12 9Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M4.857 9C3.28 9 2 10.343 2 12s1.28 3 2.857 3c1.578 0 2.857-1.343 2.857-3S6.435 9 4.857 9Zm14.286 0c-1.578 0-2.857 1.343-2.857 3s1.279 3 2.857 3C20.72 15 22 13.657 22 12s-1.28-3-2.857-3Z'
      fill='currentColor'
    />
  </svg>
)
