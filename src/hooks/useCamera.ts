import { useCallback, useState } from "react";
import { Keyboard } from "react-native";

export const useCamera = () => {
	const [showCamera, setShowCamera] = useState(false);

	const openCamera = useCallback(() => {
		setShowCamera(true);
		Keyboard.dismiss();
	}, []);

	const handleCloseCamera = useCallback(() => {
		setShowCamera(false);
	}, []);

	return {
		showCamera,
		openCamera,
		handleCloseCamera,
	};
};
