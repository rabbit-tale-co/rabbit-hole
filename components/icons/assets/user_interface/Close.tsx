import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineClose: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.657 6.343a1 1 0 0 0-1.414 0L12 10.586 7.757 6.344a1 1 0 1 0-1.414 1.414L10.585 12l-4.242 4.242a1 1 0 0 0 1.414 1.415L12 13.414l4.243 4.243a1 1 0 0 0 1.414-1.414L13.414 12l4.243-4.243a1 1 0 0 0 0-1.414Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidClose: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.414 9.414a2 2 0 1 0-2.828-2.828L12 9.172 9.414 6.586a2 2 0 1 0-2.828 2.828L9.172 12l-2.586 2.586a2 2 0 1 0 2.828 2.828L12 14.828l2.586 2.586a2 2 0 1 0 2.828-2.828L14.828 12l2.586-2.586Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneClose: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17.657 17.656a1 1 0 0 0 0-1.414L13.415 12l4.242-4.242a1 1 0 0 0-1.414-1.414L12 10.586 7.757 6.343a1 1 0 1 0-1.414 1.414L10.586 12l-4.243 4.243a1 1 0 1 0 1.414 1.415l4.244-4.244 4.242 4.242a1 1 0 0 0 1.414 0Z'
      fill='currentColor'
    />
  </svg>
)
