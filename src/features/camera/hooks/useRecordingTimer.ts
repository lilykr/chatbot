import { useEffect, useRef, useState } from "react";

export const useRecordingTimer = (isRecording: boolean) => {
	const [recordingTime, setRecordingTime] = useState(0);
	const timerRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		if (isRecording) {
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			setRecordingTime(0);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isRecording]);

	return recordingTime;
};
