import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineHeart: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='m12 7.212-1.334-1.194A4 4 0 0 0 4 9c0 3 1.34 5.212 3.032 6.85 1.722 1.667 3.748 2.668 4.854 3.13a.284.284 0 0 0 .228 0c1.106-.462 3.132-1.463 4.854-3.13C18.66 14.212 20 12 20 9a4 4 0 0 0-6.666-2.982L12 7.212Zm0-2.684A6 6 0 0 0 2 9c0 7.351 6.671 10.806 9.116 11.825.57.238 1.199.238 1.768 0C15.328 19.806 22 16.351 22 9a6 6 0 0 0-10-4.472Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidHeart: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M21.878 7.79c.08.391.122.796.122 1.21 0 7.351-6.671 10.806-9.116 11.825a2.284 2.284 0 0 1-1.768 0 18.486 18.486 0 0 1-1.093-.499C7.108 18.881 2 15.432 2 9a6 6 0 0 1 10-4.472A5.978 5.978 0 0 1 16 3a6.003 6.003 0 0 1 5.878 4.79Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneHeart: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10 20h4a2 2 0 1 1-4 0Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='M21.878 7.79c.08.391.122.796.122 1.21 0 7.351-6.671 10.806-9.116 11.825a2.284 2.284 0 0 1-1.768 0 18.486 18.486 0 0 1-1.093-.499C7.108 18.881 2 15.432 2 9a6 6 0 0 1 10-4.472A5.978 5.978 0 0 1 16 3a6.003 6.003 0 0 1 5.878 4.79Z'
      fill='currentColor'
    />
  </svg>
)
