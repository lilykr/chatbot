import { MMKV } from "react-native-mmkv";

type TypedStorage<T extends Record<string, unknown>> = {
	set: <K extends keyof T>(
		key: K,
		valueOrUpdater: T[K] | ((prev: T[K] | undefined) => T[K]),
	) => void;
	get: <K extends keyof T>(key: K) => T[K] | undefined;
	delete: <K extends keyof T>(key: K) => void;
	contains: <K extends keyof T>(key: K) => boolean;
	clearAll: () => void;
	getAllKeys: () => string[];
	listen: <K extends keyof T>(
		key: K,
		callback: (newValue: T[K] | undefined) => void,
	) => {
		remove: () => void;
	};
	addOnValueChangedListener: (callback: (changedKey: keyof T) => void) => {
		remove: () => void;
	};
};

type StoredValue<T> = {
	type: string;
	value: T;
};

export const createTypedStorage = <T extends Record<string, unknown>>(
	options?: ConstructorParameters<typeof MMKV>[0],
): TypedStorage<T> => {
	const mmkv = new MMKV(options);
	const listener = mmkv.addOnValueChangedListener((changedKey) => {
		for (const callback of valueChangeCallbacks) {
			callback(changedKey as keyof T);
		}

		// Also trigger key-specific listeners
		const keyCallbacks = keySpecificListeners.get(changedKey as keyof T);
		if (keyCallbacks) {
			const newValue = getValueForKey(changedKey as keyof T);
			for (const callback of keyCallbacks) {
				callback(newValue);
			}
		}
	});
	const valueChangeCallbacks = new Set<(changedKey: keyof T) => void>();
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const keySpecificListeners = new Map<keyof T, Set<(newValue: any) => void>>();

	// Helper function to get a value for a key (reusing get logic)
	const getValueForKey = <K extends keyof T>(key: K): T[K] | undefined => {
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
	};

	return {
		set: <K extends keyof T>(
			key: K,
			valueOrUpdater: T[K] | ((prev: T[K] | undefined) => T[K]),
		) => {
			const value =
				typeof valueOrUpdater === "function"
					? (valueOrUpdater as (prev: T[K] | undefined) => T[K])(
							mmkv.contains(key as string)
								? ((): T[K] | undefined => {
										const storedString = mmkv.getString(key as string);
										if (!storedString) return undefined;
										try {
											const storedValue = JSON.parse(
												storedString,
											) as StoredValue<unknown>;
											if (storedValue.type === "arraybuffer") {
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
											console.error(
												`Error retrieving value for key ${String(key)}:`,
												error,
											);
											return undefined;
										}
									})()
								: undefined,
						)
					: valueOrUpdater;

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
			return getValueForKey(key);
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

		listen: <K extends keyof T>(
			key: K,
			callback: (newValue: T[K] | undefined) => void,
		) => {
			if (!keySpecificListeners.has(key)) {
				keySpecificListeners.set(key, new Set());
			}

			const callbackSet = keySpecificListeners.get(key)!;
			callbackSet.add(callback);

			return {
				remove: () => {
					const callbackSet = keySpecificListeners.get(key);
					if (callbackSet) {
						callbackSet.delete(callback);
						if (callbackSet.size === 0) {
							keySpecificListeners.delete(key);
						}
					}
				},
			};
		},

		addOnValueChangedListener: (callback: (changedKey: keyof T) => void) => {
			valueChangeCallbacks.add(callback);
			return {
				remove: () => {
					valueChangeCallbacks.delete(callback);
					if (
						valueChangeCallbacks.size === 0 &&
						keySpecificListeners.size === 0
					) {
						listener.remove();
					}
				},
			};
		},
	};
};
