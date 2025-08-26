import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineClearNight: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12.85 2.48a1 1 0 0 1 .035.978A8 8 0 0 0 20 15.12h.004a1 1 0 0 1 .888 1.458A10 10 0 0 1 12 22C6.477 22 2 17.523 2 12c0-5.521 4.475-9.998 9.996-10a1 1 0 0 1 .854.48Zm-2.4 1.67a8 8 0 1 0 7.82 12.82c-4.7-.82-8.27-4.916-8.27-9.85 0-1.033.157-2.03.449-2.97Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidClearNight: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12.885 3.458A1 1 0 0 0 11.995 2C6.476 2.002 2 6.479 2 12c0 5.523 4.477 10 10 10a10 10 0 0 0 8.892-5.422 1 1 0 0 0-.888-1.458H20a8 8 0 0 1-7.115-11.662Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneClearNight: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M12.885 3.458A1 1 0 0 0 11.995 2C6.476 2.002 2 6.479 2 12c0 5.523 4.477 10 10 10a10 10 0 0 0 8.892-5.422 1 1 0 0 0-.888-1.458H20a8 8 0 0 1-7.115-11.662Z'
      fill='currentColor'
    />
  </svg>
)
