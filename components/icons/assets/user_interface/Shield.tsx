import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineShield: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12.366 4.069a1 1 0 0 0-.732 0l-6 2.362a1 1 0 0 0-.634.93v3.641a9 9 0 0 0 4.762 7.94l1.767.943a1 1 0 0 0 .942 0l1.767-.943A9 9 0 0 0 19 11.002v-3.64a1 1 0 0 0-.634-.93l-6-2.363Zm-1.465-1.861a3 3 0 0 1 2.198 0l6 2.362A3 3 0 0 1 21 7.362v3.64a11 11 0 0 1-5.82 9.704l-1.766.943a3 3 0 0 1-2.826 0l-1.767-.943A11 11 0 0 1 3 11.002v-3.64A3 3 0 0 1 4.9 4.57l6-2.362Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidShield: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12.716 2.134a2 2 0 0 0-1.433 0l-7 2.686A2 2 0 0 0 3 6.687v4.221a11 11 0 0 0 5.954 9.775l2.129 1.099a2 2 0 0 0 1.835 0l2.128-1.1A11 11 0 0 0 21 10.909v-4.22a2 2 0 0 0-1.284-1.868l-7-2.686Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneShield: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12.716 2.134a2 2 0 0 0-1.433 0l-7 2.686A2 2 0 0 0 3 6.687v4.221a11 11 0 0 0 5.954 9.775l2.129 1.099a2 2 0 0 0 1.835 0l2.128-1.1A11 11 0 0 0 21 10.909v-4.22a2 2 0 0 0-1.284-1.868l-7-2.686Z'
      fill='currentColor'
    />
  </svg>
)
