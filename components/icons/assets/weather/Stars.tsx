import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineStars: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10.406 4.198c-.255-1.6-2.557-1.6-2.812 0a4.09 4.09 0 0 1-3.395 3.395c-1.6.255-1.6 2.557 0 2.813A4.09 4.09 0 0 1 7.594 13.8c.255 1.6 2.557 1.6 2.812 0a4.09 4.09 0 0 1 3.395-3.395c1.6-.256 1.6-2.558 0-2.813a4.09 4.09 0 0 1-3.395-3.395ZM6.283 8.999A6.098 6.098 0 0 0 9 6.282a6.098 6.098 0 0 0 2.718 2.717A6.098 6.098 0 0 0 9 11.717a6.098 6.098 0 0 0-2.717-2.718Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M19 20a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1Zm-1-9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidStars: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10.406 4.198c-.255-1.6-2.557-1.6-2.812 0a4.09 4.09 0 0 1-3.395 3.395c-1.6.255-1.6 2.557 0 2.813A4.09 4.09 0 0 1 7.594 13.8c.255 1.6 2.557 1.6 2.812 0a4.09 4.09 0 0 1 3.395-3.395c1.6-.256 1.6-2.558 0-2.813a4.09 4.09 0 0 1-3.395-3.395ZM18 21a1 1 0 0 0 1-1v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 0 0 1 1Zm0-10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneStars: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10.406 4.198c-.255-1.6-2.557-1.6-2.812 0a4.09 4.09 0 0 1-3.395 3.395c-1.6.255-1.6 2.557 0 2.813A4.09 4.09 0 0 1 7.594 13.8c.255 1.6 2.557 1.6 2.812 0a4.09 4.09 0 0 1 3.395-3.395c1.6-.256 1.6-2.558 0-2.813a4.09 4.09 0 0 1-3.395-3.395ZM18 21a1 1 0 0 0 1-1v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 0 0 1 1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M18 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
      fill='currentColor'
    />
  </svg>
)
