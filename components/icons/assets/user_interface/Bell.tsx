import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineBell: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10 20h4a2 2 0 1 1-4 0Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 2a1 1 0 0 0-1 1v1c0 .028.001.055.003.082A6.002 6.002 0 0 0 6 10v1.957c0 .431-.156.847-.439 1.172l-.644.74C2.83 16.261 4.53 20 7.707 20h8.587c3.176 0 4.876-3.738 2.79-6.132l-.645-.74a1.783 1.783 0 0 1-.439-1.17V10a6.002 6.002 0 0 0-5.003-5.918A1.02 1.02 0 0 0 13 4V3a1 1 0 0 0-1-1Zm-4 8a4 4 0 1 1 8 0v1.957c0 .914.33 1.797.931 2.486l.645.74c.959 1.1.177 2.817-1.282 2.817H7.706c-1.46 0-2.24-1.718-1.282-2.818l.645-.739c.6-.689.931-1.572.931-2.486V10Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidBell: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10.062 20.495c-.068-.268.162-.495.438-.495h3c.276 0 .507.227.438.495a2 2 0 0 1-3.876 0ZM13.004 4h-2.009l-1.031.371A5.992 5.992 0 0 0 6 10.01v1.326c0 .734-.345 1.425-.932 1.866C3.021 14.741 4.11 18 6.671 18h10.657c2.562 0 3.65-3.26 1.603-4.799A2.334 2.334 0 0 1 18 11.335V10.01a5.992 5.992 0 0 0-3.964-5.638L13.004 4ZM11 3a1 1 0 1 1 2 0v1h-2V3Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneBell: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10 20h4a2 2 0 1 1-4 0Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M13.004 4h-2.009l-1.026.37A6 6 0 0 0 6 10.014v3.32c0 .734-.345 1.425-.932 1.866C3.021 16.741 4.11 20 6.671 20h10.657c2.562 0 3.65-3.26 1.603-4.799A2.334 2.334 0 0 1 18 13.335v-3.32a6 6 0 0 0-3.97-5.646L13.005 4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11 3a1 1 0 1 1 2 0v1h-2V3Z'
      fill='currentColor'
    />
  </svg>
)
