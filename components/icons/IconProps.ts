import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Interface `IconProps` extends standard SVG properties with two optional additional properties.
 * It can be used with SVG based icon components.
 *
 * @interface
 * @exports
 * @property {string} className - Optional. A CSS class name that can be used to style the SVG icon component.
 * @property {number} size - Optional. A number that can be used to set the size of the SVG icon component. Defaults to 24.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
	className?: string
	size?: number
}

/**
 * Helper function to merge default icon classes with provided className
 * Automatically includes flex-shrink-0 to prevent icon shrinking
 */
export const getIconClassName = (className?: string): string => {
	return cn('flex-shrink-0', className)
}
