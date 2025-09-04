import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineSend: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M7.346 3.327c-2.198-1.097-4.711.768-4.297 3.19l.908 5.315a1 1 0 0 1 0 .336l-.909 5.324c-.413 2.422 2.1 4.287 4.298 3.189l12-5.997c2.212-1.105 2.21-4.262-.002-5.367L7.346 3.327ZM5.02 6.18a1 1 0 0 1 1.433-1.064l11.998 5.99a1 1 0 0 1 0 1.79L6.452 18.891a1 1 0 0 1-1.432-1.063L5.844 13H10a1 1 0 1 0 0-2H5.844L5.02 6.18Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidSend: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M3.022 5.284c-.23-1.598 1.43-2.796 2.874-2.074l14.001 7c1.475.738 1.474 2.842 0 3.579L5.895 20.78c-1.444.721-3.104-.477-2.873-2.075l.699-4.849a1 1 0 0 1 .99-.857H10a1 1 0 1 0 0-2H4.712a1 1 0 0 1-.99-.857l-.7-4.859Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneSend: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M5.897 3.21c-1.444-.722-3.104.476-2.874 2.074l.946 6.573a1 1 0 0 1 0 .285l-.946 6.564c-.23 1.598 1.43 2.796 2.873 2.075l14-6.992c1.476-.737 1.476-2.841.002-3.579l-14.001-7Z'
      fill='currentColor'
    />

    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.846 13H10a1 1 0 1 0 0-2H3.846l.123.857a1 1 0 0 1 0 .285L3.846 13Z'
      fill='currentColor'
    />
  </svg>
)
