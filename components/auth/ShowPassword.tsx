import { OutlineEye, OutlineEyeOff } from "../icons/Icons";
import { Button } from "../ui/button";

export default function ShowPassword({
	showPwd,
	setShowPwd,
}: {
	showPwd: boolean;
	setShowPwd: (showPwd: boolean) => void;
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			type="button"
			onClick={() => setShowPwd(!showPwd)}
		>
			{showPwd ? (
				<OutlineEyeOff className="size-4" />
			) : (
				<OutlineEye className="size-4" />
			)}
		</Button>
	);
}
