import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineBrush: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8 6.586 17.414 16l-2.293 2.293a3 3 0 0 1-4.242 0l-.247-.247-.999 1.412a3.653 3.653 0 1 1-5.091-5.091l1.412-.999-.247-.247a3 3 0 0 1 0-4.242L8 6.586Zm0 2.828-.879.879a1 1 0 0 0 0 1.414l.667.667a1.5 1.5 0 0 1-.195 2.285L5.697 16A1.653 1.653 0 1 0 8 18.304l1.341-1.897a1.5 1.5 0 0 1 2.286-.195l.666.667a1 1 0 0 0 1.414 0l.879-.879L8 9.414Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10.412 4.174a4 4 0 0 1 5.656 0l3.758 3.757a4 4 0 0 1 0 5.657L16 17.414 6.586 8l3.826-3.826Zm4.242 1.414a2 2 0 0 0-2.828 0L9.414 8 16 14.586l2.412-2.412a2 2 0 0 0 0-2.828l-3.758-3.758Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidBrush: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M9.669 16.54 7.67 19.797a2.521 2.521 0 1 1-3.467-3.467l3.256-1.997a.5.5 0 0 0 .092-.78l-1.138-1.138a2 2 0 0 1 0-2.828l.732-.732a.5.5 0 0 1 .708 0l7.292 7.293a.5.5 0 0 1 0 .707l-.732.732a2 2 0 0 1-2.828 0l-1.138-1.138a.5.5 0 0 0-.78.093Zm6.977-1.894L9.353 7.353a.5.5 0 0 1 0-.707l2.766-2.765a3 3 0 0 1 4.242 0L20.12 7.64a3 3 0 0 1 0 4.242l-2.765 2.765a.5.5 0 0 1-.708 0Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneBrush: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M9.669 16.54 7.67 19.796a2.521 2.521 0 1 1-3.467-3.467L7.46 14.33a.5.5 0 0 0 .092-.78l-1.138-1.137a2 2 0 0 1 0-2.828L8.5 7.5l8 8-2.086 2.086a2 2 0 0 1-2.828 0l-1.138-1.138a.5.5 0 0 0-.78.092Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      opacity={0.5}
      d='m16.5 15.5-8-8 3.619-3.619a3 3 0 0 1 4.242 0L20.12 7.64a3 3 0 0 1 0 4.242L16.5 15.5Z'
      fill='currentColor'
    />
  </svg>
)
