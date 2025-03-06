import type React from "react";
import {
	Dimensions,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import type { CarouselReply } from "../types/chat";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

interface CarouselProps {
	items: CarouselReply[];
	onSelect: (reply: CarouselReply) => void;
	color?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
	items,
	onSelect,
	color = "#007AFF",
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
					>
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: item.image }}
								style={styles.image}
								resizeMode="cover"
							/>
							<View style={styles.captionOverlay}>
								<Text style={styles.caption}>{item.caption}</Text>
							</View>
						</View>
						<View style={styles.content}>
							<Text style={[styles.title, { color }]}>{item.title}</Text>
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
		backgroundColor: "white",
		borderRadius: 15,
		marginRight: 15,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		overflow: "hidden",
	},
	imageContainer: {
		position: "relative",
	},
	image: {
		width: CARD_WIDTH,
		height: CARD_WIDTH * 0.75,
		backgroundColor: "#f0f0f0",
	},
	captionOverlay: {
		position: "absolute",
		bottom: 10,
		left: 10,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		padding: 5,
		borderRadius: 4,
	},
	caption: {
		fontSize: 12,
		color: "#fff",
	},
	content: {
		padding: 15,
		flex: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
		flex: 1,
	},
});
