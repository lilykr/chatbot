import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
	StyleSheet,
	View,
	Pressable,
	Image,
	Animated,
	Dimensions,
	Easing,
} from "react-native";
import { Text } from "./Text";
import { colors } from "../constants/colors";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
const LOGO = require("../../assets/avatar.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCROLL_DURATION = 3000; // Duration for one complete scroll
const LEFT_ELEMENTS_WIDTH = 72;
interface HeaderProps {
	title: string;
	showBackButton?: boolean;
}

export const Header = ({ title, showBackButton = true }: HeaderProps) => {
	const safeAreaInsets = useSafeAreaInsets();
	const scrollX = useRef(new Animated.Value(0)).current;
	const titleWidth = useRef(0);

	const handleBack = () => {
		router.back();
	};

	const startScrollAnimation = () => {
		if (titleWidth.current > SCREEN_WIDTH - LEFT_ELEMENTS_WIDTH) {
			// Account for padding and other elements
			Animated.sequence([
				Animated.timing(scrollX, {
					toValue: -(titleWidth.current - (SCREEN_WIDTH - LEFT_ELEMENTS_WIDTH)),
					duration: SCROLL_DURATION,
					useNativeDriver: true,
					easing: Easing.linear,
				}),
				Animated.timing(scrollX, {
					toValue: 0,
					duration: SCROLL_DURATION,
					useNativeDriver: true,
					easing: Easing.linear,
				}),
			]).start((finished) => {
				if (finished) {
					startScrollAnimation();
				}
			});
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		startScrollAnimation();
	}, [titleWidth.current]);

	return (
		<BlurView
			intensity={80}
			tint="dark"
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
				},
			]}
		>
			{showBackButton && (
				<Pressable onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color="white" />
				</Pressable>
			)}
			<View style={styles.logoBorder}>
				<Image source={LOGO} style={styles.logo} />
			</View>
			<View style={{ position: "relative" }}>
				<View style={styles.titleContainer}>
					<Animated.View style={{ transform: [{ translateX: scrollX }] }}>
						<Text
							style={styles.title}
							weight="medium"
							onLayout={(e) => {
								titleWidth.current = e.nativeEvent.layout.width;
								startScrollAnimation();
							}}
							numberOfLines={1}
						>
							{title}
						</Text>
					</Animated.View>
				</View>
			</View>
		</BlurView>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		zIndex: 100,
	},
	backButton: {
		marginRight: 12,
		padding: 4,
	},
	logoBorder: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 8,
		padding: 2,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	titleContainer: {
		flex: 1,
		overflow: "hidden",
		height: 22,
		position: "absolute",
		top: -8,
	},
	title: {
		paddingRight: 32,
		fontSize: 18,
		color: "white",
		left: 0,
	},
});
