import type React from 'react'
import type { IconProps } from '../../IconProps'
import { getIconClassName } from '../../IconProps'

export const OutlineCrown: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M17 17H7v2h10v-2ZM5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4H5Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 3a1 1 0 0 1 .857.486l2.412 4.018 4.106-3.285a1 1 0 0 1 1.609.96L18.834 17H5.166L3.016 5.179a1 1 0 0 1 1.609-.96L8.73 7.504l2.412-4.018A1 1 0 0 1 12 3Zm0 2.944-2.731 4.552L5.462 7.45 6.835 15h10.33l1.373-7.55-3.807 3.046L12 5.944Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidCrown: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M5 18a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2ZM3.014 5.159a.5.5 0 0 1 .76-.52l4.772 3.07a.5.5 0 0 0 .71-.184l2.304-4.261a.5.5 0 0 1 .88 0l2.304 4.262a.5.5 0 0 0 .71.183l4.78-3.07a.5.5 0 0 1 .761.52l-1.832 9.04a1 1 0 0 1-.98.801H5.818a1 1 0 0 1-.98-.802L3.014 5.159Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneCrown: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M5 16h14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.008 5.137a.5.5 0 0 1 .763-.51l4.775 3.08a.5.5 0 0 0 .711-.182l2.303-4.261a.5.5 0 0 1 .88 0l2.303 4.26a.5.5 0 0 0 .711.183l4.775-3.08a.5.5 0 0 1 .763.51L19 16H5L3.008 5.137Z'
      fill='currentColor'
    />
  </svg>
)
