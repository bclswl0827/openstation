import { ReactNode, useRef } from "react";

interface FileInputButtonProps {
	readonly className?: string;
	readonly onFileSelected: (file: File) => void;
	readonly accept?: string;
	readonly children?: ReactNode;
}

export const FileInputButton = ({ className, onFileSelected, accept, children }: FileInputButtonProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		inputRef.current?.click();
	};

	return (
		<button className={className} onClick={handleClick}>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				onChange={(e) => onFileSelected(e.target.files![0])}
				hidden
			/>
			{children}
		</button>
	);
};
