import type React from "react";
import type { IconProps } from "../../IconProps";
import { getIconClassName } from "../../IconProps";

export const SolidLogo: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 1041 1627.42"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={getIconClassName(className)}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M820.93 892.34c-27.38-15.72-34.08-52.41-13.85-76.64 75.64-90.6 141.58-191.77 195.48-302.71 84.62-174.18 26.59-380.68-128.28-487.13-25.57-17.57-60.83-7.99-74.38 19.91L430.76 805.59a50.925 50.925 0 0 1-45.81 28.67c-33.59 0-57.88-31.92-49.12-64.34 33.33-123.35 51.12-253.07 51.12-386.96C386.95 189.31 244.52 28.93 58.7.86 28.03-3.77.5 20.25.5 51.27v1331.98c0 135.01 109.45 244.46 244.45 244.46h439.63c197.06 0 357.72-159.71 356.92-356.76-.67-162.15-89.26-303.24-220.57-378.61Zm-191.57 441.27H327.54c-50.87 0-84.39-52.79-63.01-98.94 37.39-80.71 119.12-136.69 213.92-136.69 94.8 0 176.53 55.98 213.92 136.69 21.39 46.15-12.14 98.94-63.01 98.94Z"
			fill="currentColor"
		/>
	</svg>
);
