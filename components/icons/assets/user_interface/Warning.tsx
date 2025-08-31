import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineWarning: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M18.782 16.107 13.79 6.104c-.737-1.476-2.843-1.476-3.58 0L5.219 16.107A2 2 0 0 0 7.008 19h9.985a2 2 0 0 0 1.79-2.893ZM15.58 5.211c-1.473-2.952-5.685-2.952-7.158 0L3.428 15.214C2.101 17.874 4.035 21 7.008 21h9.985c2.972 0 4.906-3.127 3.579-5.786L15.579 5.211Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M13 8a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidWarning: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M14.684 4.66c-1.106-2.212-4.262-2.212-5.367 0l-5.997 12C2.323 18.653 3.773 21 6.003 21h11.994c2.23 0 3.68-2.346 2.683-4.34l-5.996-12ZM11 9a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0V9Zm0 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneWarning: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      opacity={0.5}
      d='M9.317 4.66c1.105-2.212 4.261-2.212 5.367 0l5.996 12c.997 1.994-.453 4.34-2.683 4.34H6.003c-2.23 0-3.68-2.346-2.683-4.34l5.997-12Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 8a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'
      fill='currentColor'
    />
  </svg>
)
