import type React from 'react'
import type { IconProps } from '../../IconProps'

export const OutlineTwitter: React.FC<IconProps> = ({ className, size = 24 }) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
      d='M2.299 13.948A2 2 0 0 1 4 13c.185 0 .405 0 .649-.006a6.762 6.762 0 0 1-.51-1.028c-.702-1.78-.654-3.8-.045-5.715a2 2 0 0 1 3.777-.102c.336.889.745 1.24 1.208 1.45.295.135.666.235 1.144.302C10.886 5.611 12.955 4 15.5 4a5.6 5.6 0 0 1 2.047.41c.239.096.481.21.716.344l1.42-.229a2 2 0 0 1 2.174 2.718l-.861 2.152c-.07 3.411-1.041 6.104-2.894 7.957C16.182 19.272 13.607 20 11 20c-1.703 0-3.463-.281-4.993-.893-1.505-.602-2.997-1.614-3.796-3.213a2 2 0 0 1 .088-1.946ZM19 9l1-2.5-2.222.357a1.673 1.673 0 0 0-.055-.05C17.26 6.396 16.354 6 15.5 6c-2 0-3.5 1.5-3.5 3.5v.5c-.725 0-1.392-.03-2-.11-.927-.125-1.718-.371-2.374-.821C6.932 8.592 6.39 7.888 6 6.857c-.353 1.11-.457 2.202-.311 3.194.15 1.027.568 1.948 1.253 2.67C7.47 13.28 8.156 13.72 9 14c-.706.471-1.635.72-2.524.852a9.284 9.284 0 0 1-.113.016C5.407 15 4.509 15 4 15c.4.8 1.12 1.44 2.031 1.92C7.399 17.64 9.2 18 11 18c4.5 0 8-2.5 8-9Z'
      fill='currentColor'
    />
  </svg>
)

export const SolidTwitter: React.FC<IconProps> = ({ className, size = 24 }) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
      d='M20 8.002V8l1.875-2.023a.48.48 0 0 0-.415-.802l-2.35.31a4 4 0 0 0-6.823 4.007c-2.996-.07-6.204-.663-7.826-3.877-.2-.397-.776-.42-.904.006C2.383 9.541 4.449 14.635 9 16c-1.136 1.11-4.054 1.411-6.442 1.193-.465-.043-.757.487-.397.784C4.163 19.637 6.94 20 9.5 20 16 20 20.499 14.501 20 8.002Z'
      fill='currentColor'
    />
  </svg>
)

export const DuotoneTwitter: React.FC<IconProps> = ({ className, size = 24 }) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
      d='M20 8.002V8l1.875-2.023a.48.48 0 0 0-.415-.802l-2.35.31a4 4 0 0 0-6.823 4.007C12.894 11 11.557 13.5 9 16c-1.136 1.11-4.054 1.411-6.442 1.193-.465-.043-.757.487-.397.784C4.163 19.637 6.94 20 9.5 20 16 20 20.499 14.501 20 8.002Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M9 16C4.447 14.635 2.382 9.542 3.556 5.622c.127-.427.703-.404.903-.006C6.208 9.086 9.77 9.5 12.5 9.5c6 0 4.5 8.9-3.5 6.5Z'
      fill='currentColor'
    />
  </svg>
)
