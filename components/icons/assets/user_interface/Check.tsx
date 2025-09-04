import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineCheck: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M18.555 5.168a1 1 0 0 1 .277 1.387l-8 12a1 1 0 0 1-1.54.152l-3-3a1 1 0 1 1 1.415-1.414l2.138 2.137 7.323-10.985a1 1 0 0 1 1.387-.277Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidCheck: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.11 5.336a2 2 0 0 1 .554 2.774l-6 9a2 2 0 0 1-3.078.304l-3-3a2 2 0 1 1 2.828-2.828l1.275 1.275 4.647-6.97a2 2 0 0 1 2.773-.555Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneCheck: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M18.555 5.168a1 1 0 0 1 .277 1.387l-8 12a1 1 0 0 1-1.54.152l-3-3a1 1 0 1 1 1.415-1.414l2.138 2.137 7.323-10.985a1 1 0 0 1 1.387-.277Z'
      fill='currentColor'
    />
  </svg>
)
