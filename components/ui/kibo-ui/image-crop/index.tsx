"use client";

import { Slot } from "radix-ui";
import {
	type ComponentProps,
	type CSSProperties,
	createContext,
	type MouseEvent,
	type ReactNode,
	type RefObject,
	type SyntheticEvent,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	type PercentCrop,
	type PixelCrop,
	type ReactCropProps,
} from "react-image-crop";
import { cn } from "@/lib/utils";
import { Button } from "../../button";

import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import { OutlineCrop, OutlineRefreshCw } from "@/components/icons/Icons";

const centerAspectCrop = (
	mediaWidth: number,
	mediaHeight: number,
	aspect: number | undefined,
): PercentCrop =>
	centerCrop(
		aspect
			? makeAspectCrop(
					{
						unit: "%",
						width: 90,
					},
					aspect,
					mediaWidth,
					mediaHeight,
				)
			: { x: 0, y: 0, width: 90, height: 90, unit: "%" },
		mediaWidth,
		mediaHeight,
	);

const getCroppedPngImage = async (
	imageSrc: HTMLImageElement,
	scaleFactor: number,
	pixelCrop: PixelCrop,
	maxImageSize: number,
	recursionCount = 0,
	onError?: (error: string) => void,
): Promise<Blob> => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Context is null, this should never happen.");
	}

	// Prevent infinite recursion - max 10 attempts
	if (recursionCount >= 10) {
		console.warn("Maximum recursion depth reached in getCroppedPngImage");
		// Return the image even if it's too large to prevent infinite loop
		return new Promise((resolve) => {
			canvas.toBlob(
				(blob) => {
					resolve(blob || new Blob());
				},
				"image/png",
				0.9,
			);
		});
	}

	// Prevent scaleFactor from becoming too small
	const minScaleFactor = 0.2;
	const effectiveScaleFactor = Math.max(minScaleFactor, scaleFactor);

	const scaleX = imageSrc.naturalWidth / imageSrc.width;
	const scaleY = imageSrc.naturalHeight / imageSrc.height;

	const natCropWidth = pixelCrop.width * scaleX;
	const natCropHeight = pixelCrop.height * scaleY;
	const targetW = Math.max(1, Math.round(natCropWidth * effectiveScaleFactor));
	const targetH = Math.max(1, Math.round(natCropHeight * effectiveScaleFactor));

	console.log("[CROP] Canvas dimensions:", {
		natCropWidth,
		natCropHeight,
		effectiveScaleFactor,
		targetW,
		targetH,
		recursionCount,
	});

	canvas.width = targetW;
	canvas.height = targetH;

	ctx.imageSmoothingEnabled = true;
	(ctx as { imageSmoothingQuality?: string }).imageSmoothingQuality = "high";

	ctx.drawImage(
		imageSrc,
		pixelCrop.x * scaleX,
		pixelCrop.y * scaleY,
		natCropWidth,
		natCropHeight,
		0,
		0,
		targetW,
		targetH,
	);

	return new Promise((resolve) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					resolve(new Blob());
					return;
				}

				// If blob is very small (< 10KB) or we've reached scale limit, don't recurse further
				const isVerySmall = blob.size < 10240; // 10KB
				const reachedScaleLimit = effectiveScaleFactor <= minScaleFactor;
				const isTooLarge = blob.size > maxImageSize;

				console.log("[CROP] Blob analysis:", {
					size: blob.size,
					maxSize: maxImageSize,
					isVerySmall,
					reachedScaleLimit,
					isTooLarge,
					effectiveScaleFactor,
					recursionCount,
				});

				if (
					isTooLarge &&
					!isVerySmall &&
					!reachedScaleLimit &&
					recursionCount < 5
				) {
					console.log("[CROP] Attempting recursion with smaller scale factor");
					getCroppedPngImage(
						imageSrc,
						effectiveScaleFactor * 0.9, // Less aggressive reduction
						pixelCrop,
						maxImageSize,
						recursionCount + 1,
						onError,
					).then(resolve);
				} else if (isTooLarge && recursionCount >= 5) {
					console.log("[CROP] Maximum recursion reached, file too large");
					const maxSizeMB = (maxImageSize / (1024 * 1024)).toFixed(1);
					const currentSizeMB = (blob.size / (1024 * 1024)).toFixed(1);
					onError?.(
						`Obraz jest za duży (${currentSizeMB}MB). Maksymalny rozmiar to ${maxSizeMB}MB.`,
					);
					resolve(blob); // Return the blob anyway, but show error
				} else {
					console.log("[CROP] Resolving with current blob (no recursion)");
					resolve(blob);
				}
			},
			"image/png",
			0.9,
		);
	});
};

type ImageCropContextType = {
	file: File;
	maxImageSize: number;
	imgSrc: string;
	crop: PercentCrop | undefined;
	completedCrop: PixelCrop | null;
	imgRef: RefObject<HTMLImageElement | null>;
	onCrop?: (croppedImage: Blob) => void;
	onError?: (error: string) => void;
	reactCropProps: Omit<ReactCropProps, "onChange" | "onComplete" | "children">;
	handleChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
	handleComplete: (
		pixelCrop: PixelCrop,
		percentCrop: PercentCrop,
	) => Promise<void>;
	onImageLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
	applyCrop: () => Promise<void>;
	resetCrop: () => void;
};

const ImageCropContext = createContext<ImageCropContextType | null>(null);

const useImageCrop = () => {
	const context = useContext(ImageCropContext);
	if (!context) {
		throw new Error("ImageCrop components must be used within ImageCrop");
	}
	return context;
};

export type ImageCropProps = {
	file: File;
	maxImageSize?: number;
	onCrop?: (croppedImage: Blob) => void;
	onError?: (error: string) => void;
	children: ReactNode;
	onChange?: ReactCropProps["onChange"];
	onComplete?: ReactCropProps["onComplete"];
} & Omit<ReactCropProps, "onChange" | "onComplete" | "children">;

export const ImageCrop = ({
	file,
	maxImageSize = 1024 * 1024 * 5,
	onCrop,
	onError,
	children,
	onChange,
	onComplete,
	...reactCropProps
}: ImageCropProps) => {
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [imgSrc, setImgSrc] = useState<string>("");
	const [crop, setCrop] = useState<PercentCrop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
	const [initialCrop, setInitialCrop] = useState<PercentCrop>();

	useEffect(() => {
		const reader = new FileReader();
		reader.addEventListener("load", () =>
			setImgSrc(reader.result?.toString() || ""),
		);
		reader.readAsDataURL(file);
	}, [file]);

	const onImageLoad = useCallback(
		(e: SyntheticEvent<HTMLImageElement>) => {
			const { width, height } = e.currentTarget;
			const newCrop = centerAspectCrop(width, height, reactCropProps.aspect);
			setCrop(newCrop);
			setInitialCrop(newCrop);
		},
		[reactCropProps.aspect],
	);

	const handleChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
		setCrop(percentCrop);
		onChange?.(pixelCrop, percentCrop);
	};

	const handleComplete = async (
		pixelCrop: PixelCrop,
		percentCrop: PercentCrop,
	) => {
		setCompletedCrop(pixelCrop);
		onComplete?.(pixelCrop, percentCrop);
	};

	const applyCrop = async () => {
		if (!(imgRef.current && completedCrop)) {
			return;
		}

		const dpr =
			typeof window !== "undefined" && window.devicePixelRatio
				? window.devicePixelRatio
				: 1;
		const croppedImageBlob = await getCroppedPngImage(
			imgRef.current,
			Math.max(1, Math.min(2, dpr)),
			completedCrop,
			maxImageSize,
			0, // Start with recursion count 0
			onError,
		);

		onCrop?.(croppedImageBlob);
	};

	const resetCrop = () => {
		if (initialCrop) {
			setCrop(initialCrop);
			setCompletedCrop(null);
		}
	};

	const contextValue: ImageCropContextType = {
		file,
		maxImageSize,
		imgSrc,
		crop,
		completedCrop,
		imgRef,
		onCrop,
		onError,
		reactCropProps,
		handleChange,
		handleComplete,
		onImageLoad,
		applyCrop,
		resetCrop,
	};

	return (
		<ImageCropContext.Provider value={contextValue}>
			{children}
		</ImageCropContext.Provider>
	);
};

export type ImageCropContentProps = {
	style?: CSSProperties;
	className?: string;
};

export const ImageCropContent = ({
	style,
	className,
}: ImageCropContentProps) => {
	const {
		imgSrc,
		crop,
		handleChange,
		handleComplete,
		onImageLoad,
		imgRef,
		reactCropProps,
	} = useImageCrop();

	const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
	useEffect(() => {
		if (!imgSrc) {
			setDims(null);
			return;
		}
		const probe = new window.Image();
		probe.onload = () => {
			const w = probe.naturalWidth || probe.width;
			const h = probe.naturalHeight || probe.height;
			setDims({ w, h });
		};
		probe.src = imgSrc;
	}, [imgSrc]);

	const shadcnStyle = {
		"--rc-border-color": "var(--color-border)",
		"--rc-focus-color": "var(--color-primary)",
	} as CSSProperties;

	return (
		<ReactCrop
			className={cn(
				"max-h-[50vh] max-w-[80vw] sm:max-w-[60vw] overflow-hidden",
				className,
			)}
			crop={crop}
			onChange={handleChange}
			onComplete={handleComplete}
			style={{ ...shadcnStyle, ...style }}
			{...reactCropProps}
		>
			{imgSrc && dims && (
				<Image
					alt="crop"
					className="w-auto h-auto max-w-[80vw] max-h-[50vh] sm:max-w-[60vw]"
					src={imgSrc}
					width={dims.w}
					height={dims.h}
					unoptimized
					priority
					onLoadingComplete={(el) => {
						try {
							(
								imgRef as unknown as React.MutableRefObject<HTMLImageElement | null>
							).current = el;
						} catch {}
						try {
							onImageLoad({
								currentTarget: el,
							} as unknown as SyntheticEvent<HTMLImageElement>);
						} catch {}
					}}
				/>
			)}
		</ReactCrop>
	);
};

export type ImageCropApplyProps = ComponentProps<"button"> & {
	asChild?: boolean;
};

export const ImageCropApply = ({
	asChild = false,
	children,
	onClick,
	...props
}: ImageCropApplyProps) => {
	const { applyCrop } = useImageCrop();

	const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
		await applyCrop();
		onClick?.(e);
	};

	if (asChild) {
		return (
			<Slot.Root onClick={handleClick} {...props}>
				{children}
			</Slot.Root>
		);
	}

	return (
		<Button
			onClick={handleClick}
			size={children ? "default" : "icon"}
			{...props}
		>
			{children ?? <OutlineCrop />}
		</Button>
	);
};

export type ImageCropResetProps = ComponentProps<"button"> & {
	asChild?: boolean;
};

export const ImageCropReset = ({
	asChild = false,
	children,
	onClick,
	...props
}: ImageCropResetProps) => {
	const { resetCrop } = useImageCrop();

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		resetCrop();
		onClick?.(e);
	};

	if (asChild) {
		return (
			<Slot.Root onClick={handleClick} {...props}>
				{children}
			</Slot.Root>
		);
	}

	return (
		<Button
			onClick={handleClick}
			size={children ? "default" : "icon"}
			variant="ghost"
			{...props}
		>
			{children ?? <OutlineRefreshCw />}
		</Button>
	);
};

// Keep the original Cropper component for backward compatibility
export type CropperProps = Omit<ReactCropProps, "onChange"> & {
	file: File;
	maxImageSize?: number;
	onCrop?: (croppedImage: Blob) => void;
	onChange?: ReactCropProps["onChange"];
};

export const Cropper = ({
	onChange,
	onComplete,
	onCrop,
	style,
	className,
	file,
	maxImageSize,
	...props
}: CropperProps) => (
	<ImageCrop
		file={file}
		maxImageSize={maxImageSize}
		onChange={onChange}
		onComplete={onComplete}
		onCrop={onCrop}
		{...props}
	>
		<ImageCropContent className={className} style={style} />
	</ImageCrop>
);
