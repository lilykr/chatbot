import { MMKV } from "react-native-mmkv";

type TypedStorage<T extends Record<string, unknown>> = {
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	get: <K extends keyof T>(key: K) => T[K] | undefined;
	delete: <K extends keyof T>(key: K) => void;
	contains: <K extends keyof T>(key: K) => boolean;
	clearAll: () => void;
	getAllKeys: () => string[];
};

type StoredValue<T> = {
	type: string;
	value: T;
};

export const createTypedStorage = <T extends Record<string, unknown>>(
	options?: ConstructorParameters<typeof MMKV>[0],
): TypedStorage<T> => {
	const mmkv = new MMKV(options);

	return {
		set: <K extends keyof T>(key: K, value: T[K]) => {
			if (value === undefined || value === null) {
				mmkv.delete(key as string);
				return;
			}

			const valueType = typeof value;
			const storedValue: StoredValue<unknown> = {
				type: value instanceof ArrayBuffer ? "arraybuffer" : valueType,
				value:
					value instanceof ArrayBuffer
						? Array.from(new Uint8Array(value)) // Convert ArrayBuffer to array for storage
						: value,
			};

			mmkv.set(key as string, JSON.stringify(storedValue));
		},

		get: <K extends keyof T>(key: K): T[K] | undefined => {
			if (!mmkv.contains(key as string)) return undefined;

			try {
				const storedString = mmkv.getString(key as string);
				if (!storedString) return undefined;

				const storedValue = JSON.parse(storedString) as StoredValue<unknown>;

				if (storedValue.type === "arraybuffer") {
					// Convert array back to ArrayBuffer
					const array = storedValue.value as number[];
					const buffer = new ArrayBuffer(array.length);
					const view = new Uint8Array(buffer);
					array.forEach((value, index) => {
						view[index] = value;
					});
					return buffer as unknown as T[K];
				}

				return storedValue.value as T[K];
			} catch (error) {
				console.error(`Error retrieving value for key ${String(key)}:`, error);
				return undefined;
			}
		},

		delete: <K extends keyof T>(key: K) => {
			mmkv.delete(key as string);
		},

		contains: <K extends keyof T>(key: K) => {
			return mmkv.contains(key as string);
		},

		clearAll: () => {
			mmkv.clearAll();
		},

		getAllKeys: () => {
			return mmkv.getAllKeys();
		},
	};
};
