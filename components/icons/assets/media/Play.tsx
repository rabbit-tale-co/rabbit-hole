import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlinePlay: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 6.007C4 2.71 7.762.83 10.399 2.806l7.997 5.993c2.135 1.6 2.135 4.802 0 6.402L10.4 21.194C7.762 23.17 4 21.288 4 17.993V6.007Zm5.2-1.6C7.88 3.417 6 4.358 6 6.006v11.986c0 1.648 1.88 2.588 3.2 1.6l7.997-5.993a2 2 0 0 0 0-3.2L9.199 4.405Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidPlay: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8.722 2.547C6.733 1.154 4 2.576 4 5.004v13.993c0 2.427 2.733 3.85 4.722 2.456l10.008-7.012c1.693-1.187 1.693-3.695 0-4.881L8.722 2.547Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotonePlay: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      opacity='0.5'
      d='M8.722 2.547C6.733 1.154 4 2.576 4 5.004v13.993c0 2.427 2.733 3.85 4.722 2.456l10.008-7.012c1.693-1.187 1.693-3.695 0-4.881L8.722 2.547Z'
      fill='currentColor'
    />
  </svg>
)
