import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineCarrot: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M10.293 7.793a1 1 0 0 1 1.414 0l1.5 1.5a1 1 0 0 1-1.414 1.414l-1.5-1.5a1 1 0 0 1 0-1.414Zm-4 5a1 1 0 0 1 1.414 0l1.5 1.5a1 1 0 1 1-1.414 1.414l-1.5-1.5a1 1 0 0 1 0-1.414Zm6.914.5a1 1 0 0 0-1.414 1.414l1.5 1.5a1 1 0 0 0 1.414-1.414l-1.5-1.5ZM16.5 9a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v1.586l2.293-2.293a1 1 0 1 1 1.414 1.414L18.914 7H20.5a1 1 0 1 1 0 2h-4Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M5.82 18.68a24.186 24.186 0 0 0 6.064-2.37c1.421-.801 2.62-1.71 3.443-2.662C16.144 12.7 16.5 11.82 16.5 11c0-1.045-.34-1.761-.79-2.21-.449-.45-1.164-.79-2.21-.79-.82 0-1.701.357-2.647 1.173-.953.822-1.861 2.022-2.663 3.444a24.185 24.185 0 0 0-2.37 6.064Zm-2.322 1.844C3.795 16.182 7.733 6 13.5 6c3 0 5 2 5 5 0 5.767-10.181 9.706-14.524 10.002a.444.444 0 0 1-.478-.478Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidCarrot: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M8.906 9.82a.48.48 0 0 0-.692.004c-.745.799-1.445 1.805-2.066 2.902a.493.493 0 0 0 .083.59l.976.977a1 1 0 1 1-1.414 1.414l-.23-.23a.489.489 0 0 0-.802.16c-.707 1.778-1.167 3.543-1.262 4.886a.444.444 0 0 0 .478.478c2.23-.158 5.62-1.32 8.31-2.95a.487.487 0 0 0 .087-.763l-.58-.58a1 1 0 0 1 1.413-1.415l.888.888a.483.483 0 0 0 .676.015c1.058-1.012 1.73-2.105 1.73-3.196-.001-3.5-1.5-5-5-5-.202 0-.403.023-.604.067-.342.074-.421.495-.174.742l1.484 1.484a1 1 0 0 1-1.414 1.414L8.906 9.82ZM17.5 8a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v.586l1.293-1.293a1 1 0 1 1 1.414 1.414L19.914 6h.586a1 1 0 1 1 0 2h-3Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneCarrot: React.FC<IconProps> = ({ className, size = 24 }) => (
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
      d='M13.5 6C7.733 6 3.795 16.182 3.498 20.524a.444.444 0 0 0 .478.478C8.32 20.705 18.5 16.767 18.5 11c0-3-2-5-5-5Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M15.844 15.963a1 1 0 0 0-.137-.17l-1.5-1.5a1 1 0 1 0-1.414 1.414l1.477 1.477a15.1 15.1 0 0 0 1.574-1.22Zm-10.316-2.52 1.265 1.264a1 1 0 0 0 1.414-1.414l-1.5-1.5a1 1 0 0 0-.247-.181 23.99 23.99 0 0 0-.932 1.83Zm3.619-5.42c.04.065.089.127.146.184l1.5 1.5a1 1 0 1 0 1.414-1.414L10.72 6.807a8.596 8.596 0 0 0-1.574 1.216ZM16.5 9a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v1.586l2.293-2.293a1 1 0 1 1 1.414 1.414L18.914 7H20.5a1 1 0 1 1 0 2h-4Z'
      fill='currentColor'
    />
  </svg>
)
