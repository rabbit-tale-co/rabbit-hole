import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineEdit: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 21a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12.412 3.174a4 4 0 0 1 5.657 0l.757.758a4 4 0 0 1 0 5.657l-6.906 6.906a2 2 0 0 1-1.015.545l-4.503.918a2 2 0 0 1-2.36-2.359l.918-4.504a2 2 0 0 1 .546-1.014l6.906-6.907Zm4.242 1.415a2 2 0 0 0-2.828 0L13.414 5 17 8.586l.412-.412a2 2 0 0 0 0-2.828l-.758-.757ZM8.414 10 12 6.415 15.586 10 12 13.586 8.414 10ZM7 11.415l-.08.08-.918 4.504 4.504-.918.08-.08L7 11.414Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidEdit: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 21a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm7.94-15.647a.5.5 0 0 0-.708 0l-3.878 3.88a.5.5 0 0 0 0 .706l4.707 4.707a.5.5 0 0 0 .707 0l3.878-3.878a.5.5 0 0 0 0-.707L11.94 5.353Zm-1.299 11.146c.164-.046.195-.249.074-.37L5.87 11.285c-.12-.12-.323-.09-.369.075l-1.457 5.243a1.1 1.1 0 0 0 1.354 1.354l5.243-1.457Zm3.068-13.622a3 3 0 0 1 4.242 0l1.172 1.172a3 3 0 0 1 0 4.242l-.355.356a.5.5 0 0 1-.707 0l-4.707-4.708a.5.5 0 0 1 0-.707l.355-.355Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneEdit: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M4 21a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M13.709 2.877a3 3 0 0 1 4.242 0l1.172 1.172a3 3 0 0 1 0 4.242l-.416.416-5.414-5.414.416-.416Zm-7.912 7.92a1.5 1.5 0 0 0-.296.562l-1.457 5.243a1.1 1.1 0 0 0 1.354 1.354l5.243-1.457a1.5 1.5 0 0 0 .562-.296l-5.406-5.406Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      className='opacity-50'
      d='m18.707 8.707-5.414-5.414L5.886 10.7a2.065 2.065 0 0 0-.09.097l5.407 5.406c.034-.028.066-.058.097-.089l7.407-7.407Z'
      fill='currentColor'
    />
  </svg>
)
