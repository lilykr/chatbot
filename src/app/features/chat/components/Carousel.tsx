import type React from "react";
import {
	Dimensions,
	Image,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { Text } from "../../../../components/Text";
import { colors } from "../../../../constants/colors";
import type { CarouselReply } from "../types/chat";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Platform.OS === "ios" ? width * 0.6 : width * 0.7;

interface CarouselProps {
	items: CarouselReply[];
	onSelect: (reply: CarouselReply) => void;
	color?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
	items,
	onSelect,
	color,
}) => {
	return (
		<View style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.scrollView}
				snapToInterval={CARD_WIDTH + 15}
				decelerationRate="fast"
				contentContainerStyle={{ alignItems: "center" }}
			>
				{items.map((item, index) => (
					<Pressable
						key={`${item.value}-${index}`}
						style={styles.card}
						onPress={() => onSelect(item)}
						testID={`carousel_item_${item.value}`}
					>
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: item.image }}
								style={styles.image}
								resizeMode="cover"
							/>
							<View style={styles.overlay} />
							<View style={styles.captionOverlay}>
								<Text style={styles.caption}>{item.caption}</Text>
							</View>
						</View>
						<View style={styles.content}>
							<Text style={[styles.title, { color }]} weight="bold">
								{item.title}
							</Text>
							<Text style={styles.description} numberOfLines={3}>
								{item.description}
							</Text>
						</View>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
		flex: 1,
		minHeight: CARD_WIDTH,
		maxHeight: CARD_WIDTH * 1.5,
	},
	scrollView: {
		flexGrow: 0,
	},
	card: {
		width: CARD_WIDTH,
		height: CARD_WIDTH * 1.1,
		backgroundColor: colors.night,
		borderRadius: 25,
		marginRight: 15,
		borderWidth: 1,
		borderColor: colors.white,
		overflow: "hidden",
	},
	imageContainer: {
		position: "relative",
	},
	image: {
		width: CARD_WIDTH,
		height: CARD_WIDTH * 0.65,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	captionOverlay: {
		position: "absolute",
		bottom: 10,
		left: 10,
		backgroundColor: colors.darkGrey,
		padding: 5,
		borderRadius: 4,
	},
	caption: {
		fontSize: 10,
		color: colors.white,
	},
	content: {
		padding: 15,
		flex: 1,
	},
	title: {
		fontSize: 18,
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: colors.white,
		flex: 1,
	},
});
