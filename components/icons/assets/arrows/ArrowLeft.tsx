import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineArrowLeft: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M2 12a1 1 0 0 0 1 1h18a1 1 0 1 0 0-2H3a1 1 0 0 0-1 1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.293 11.293a1 1 0 0 0 0 1.414l7 7a1 1 0 0 0 1.414-1.414L4.414 12l6.293-6.293a1 1 0 0 0-1.414-1.414l-7 7Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidArrowLeft: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M13 12a1 1 0 0 0 1 1h7a1 1 0 1 0 0-2h-7a1 1 0 0 0-1 1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.293 12.707a1 1 0 0 1 0-1.414l7-7A1 1 0 0 1 11 5v14a1 1 0 0 1-1.707.707l-7-7Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneArrowLeft: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M2 12a1 1 0 0 0 1 1h18a1 1 0 1 0 0-2H3a1 1 0 0 0-1 1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.293 11.293a1 1 0 0 0 0 1.414l7 7a1 1 0 0 0 1.414-1.414L4.414 12l6.293-6.293a1 1 0 0 0-1.414-1.414l-7 7Z'
      fill='currentColor'
    />
  </svg>
)
