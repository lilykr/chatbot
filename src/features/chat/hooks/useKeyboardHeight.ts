import {
	KeyboardState,
	runOnJS,
	useDerivedValue,
} from "react-native-reanimated";

import { useState } from "react";
import { useAnimatedKeyboard } from "react-native-reanimated";

export const useKeyboardHeight = () => {
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const keyboard = useAnimatedKeyboard();

	useDerivedValue(() => {
		if (keyboard.state.value === KeyboardState.OPEN) {
			runOnJS(setKeyboardHeight)(keyboard.height.value);
		} else {
			runOnJS(setKeyboardHeight)(0);
		}
	});

	return keyboardHeight;
};
