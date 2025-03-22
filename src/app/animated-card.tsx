import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../components/BouncyPressable";
import { SkiaAnimatedCard } from "../components/SkiaAnimatedCard";

export default function AnimatedCardPage() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<>
			<SkiaAnimatedCard
				onPressLinkedin={() => console.log("LinkedIn")}
				onPressGithub={() => console.log("Github")}
				onPressChat={() => console.log("Chat")}
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
				<BouncyPressable onPress={() => router.push("/homepage")}>
					<AntDesign name="closecircleo" size={48} color="white" />
				</BouncyPressable>
			</View>
		</>
	);
}
