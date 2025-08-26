import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineCompass: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12.5 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0 2c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='m10.578 9.354 5.3-1.339a.5.5 0 0 1 .607.607l-1.339 5.3a1 1 0 0 1-.725.724l-5.299 1.339a.5.5 0 0 1-.607-.607l1.339-5.3a1 1 0 0 1 .724-.724ZM12.5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidCompass: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M22.5 12c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10Zm-6.623-3.985-5.299 1.339a1 1 0 0 0-.724.725l-1.339 5.298a.5.5 0 0 0 .607.608l5.3-1.339a1 1 0 0 0 .724-.725l1.339-5.299a.5.5 0 0 0-.607-.607Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneCompass: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M22.5 12c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10Z'
      fill='currentColor'
    />

    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='m10.578 9.354 5.3-1.339a.5.5 0 0 1 .607.607l-1.339 5.3a1 1 0 0 1-.725.724l-5.299 1.339a.5.5 0 0 1-.607-.607l1.339-5.3a1 1 0 0 1 .724-.724ZM12.5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
      fill='currentColor'
    />
  </svg>
)
