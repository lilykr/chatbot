import uuid from "react-native-uuid";
import { storage } from "./storage";

export const deviceId = (() => {
	const getOrCreateDeviceId = () => {
		let _deviceId = storage.get("deviceId");
		if (!_deviceId) {
			_deviceId = uuid.v4() as string;
			storage.set("deviceId", _deviceId);
		}
		return _deviceId;
	};
	return getOrCreateDeviceId();
})();
