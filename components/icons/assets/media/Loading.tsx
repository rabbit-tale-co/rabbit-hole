import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineLoading: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 2a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1Zm0 15a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0v-3a1 1 0 0 0-1-1Zm9-6a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2h3ZM7 12a1 1 0 0 0-1-1H3a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1Zm10.657-7.071a1 1 0 1 1 1.414 1.414L16.95 8.464a1 1 0 0 1-1.415-1.414l2.122-2.121ZM8.464 15.536a1 1 0 0 0-1.414 0l-2.12 2.121a1 1 0 0 0 1.414 1.414l2.121-2.121a1 1 0 0 0 0-1.414Zm10.607 2.121a1 1 0 0 1-1.414 1.414l-2.121-2.121a1 1 0 0 1 1.414-1.415l2.121 2.122ZM8.464 8.464a1 1 0 0 0 0-1.414L6.343 4.93a1 1 0 1 0-1.414 1.414l2.121 2.12a1 1 0 0 0 1.414 0Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidLoading: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM11 5a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0V5Zm0 12a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2Zm9-5a1 1 0 0 0-1-1h-2a1 1 0 1 0 0 2h2a1 1 0 0 0 1-1ZM7 11a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h2Zm10.657-4.657a1 1 0 0 0-1.414 0l-1.415 1.415a1 1 0 0 0 1.415 1.414l1.414-1.414a1 1 0 0 0 0-1.415Zm-9.9 8.485a1 1 0 0 1 1.414 1.414l-1.414 1.415a1 1 0 1 1-1.414-1.415l1.414-1.414Zm9.9 2.829a1 1 0 0 0 0-1.414l-1.415-1.415a1 1 0 0 0-1.414 1.415l1.414 1.414a1 1 0 0 0 1.415 0Zm-8.485-9.9a1 1 0 0 1-1.414 1.414L6.343 7.757a1 1 0 0 1 1.415-1.414l1.414 1.414Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneLoading: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={getIconClassName(className)}
  >
    <circle cx="12" cy="12" r="10" className='opacity-50' fill='currentColor' />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 4a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1Zm0 12a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1Zm7-5a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM8 12a1 1 0 0 0-1-1H5a1 1 0 1 0 0 2h2a1 1 0 0 0 1-1Zm8.243-5.657a1 1 0 1 1 1.414 1.415l-1.414 1.414a1 1 0 1 1-1.415-1.414l1.415-1.415Zm-7.072 8.485a1 1 0 0 0-1.414 0l-1.414 1.414a1 1 0 1 0 1.414 1.415l1.414-1.415a1 1 0 0 0 0-1.414Zm8.486 1.415a1 1 0 0 1-1.415 1.414l-1.414-1.414a1 1 0 0 1 1.414-1.415l1.415 1.415ZM9.172 9.171a1 1 0 0 0 0-1.414L7.758 6.343a1 1 0 0 0-1.415 1.414l1.415 1.414a1 1 0 0 0 1.414 0Z'
      fill='currentColor'
    />
  </svg>
)
