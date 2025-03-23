import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../../components/BouncyPressable";
import { SkiaAnimatedCard } from "./SkiaAnimatedCard";

export function AnimatedCard() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<>
			<SkiaAnimatedCard
				onPressLinkedin={() =>
					Linking.openURL("https://www.linkedin.com/in/lisaloukara/")
				}
				onPressGithub={() =>
					Linking.openURL("https://github.com/lilykr/chatbot")
				}
				onPressChat={() => router.push("/chatWithLily/new")}
			/>
			<View
				style={{
					position: "absolute",
					bottom: insets.bottom + 20,
					width: "100%",
					alignItems: "center",
					opacity: 0.5,
				}}
			>
				<BouncyPressable onPress={() => router.back()}>
					<AntDesign name="closecircleo" size={48} color="white" />
				</BouncyPressable>
			</View>
		</>
	);
}
