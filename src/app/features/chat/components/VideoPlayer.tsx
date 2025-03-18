import { useEvent } from "expo";
import { Video, type VideoReadyForDisplayEvent } from "expo-av";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { Platform, Pressable } from "react-native";

const MAX_WIDTH_OR_HEIGHT = 260;

type Props = {
	videoUri: string | undefined;
};

export default function VideoPlayer({ videoUri }: Props) {
	const [dimensions, setDimensions] = useState<
		| {
				width: number;
				height: number;
		  }
		| undefined
	>(undefined);

	if (!videoUri) {
		return null;
	}

	const player = useVideoPlayer(videoUri, (player) => {
		player.muted = true;
		player.loop = true;
		player.play();
	});

	const { isPlaying } = useEvent(player, "playingChange", {
		isPlaying: player.playing,
	});

	const onReadyForDisplay = (event: VideoReadyForDisplayEvent) => {
		setDimensions({
			width: event.naturalSize.width,
			height: event.naturalSize.height,
		});
	};

	if (!dimensions && Platform.OS === "ios")
		return (
			<Video source={{ uri: videoUri }} onReadyForDisplay={onReadyForDisplay} />
		);

	return (
		<Pressable
			onPress={() => {
				if (isPlaying) {
					player.pause();
				} else {
					player.play();
				}
			}}
		>
			<VideoView
				style={{
					...(dimensions && Platform.OS === "ios"
						? dimensions.width >= dimensions.height
							? {
									width: MAX_WIDTH_OR_HEIGHT,
									height:
										(dimensions.height / dimensions.width) *
										MAX_WIDTH_OR_HEIGHT,
								}
							: {
									height: MAX_WIDTH_OR_HEIGHT,
									width:
										(dimensions.width / dimensions.height) *
										MAX_WIDTH_OR_HEIGHT,
								}
						: {
								height: MAX_WIDTH_OR_HEIGHT,
								width: (MAX_WIDTH_OR_HEIGHT * 3) / 4, // 4:3 ratio
							}),
					borderRadius: 15,
				}}
				player={player}
				allowsFullscreen
				allowsPictureInPicture
				contentFit="cover"
				onFullscreenEnter={() => {
					player.muted = false;
				}}
				onFullscreenExit={() => {
					player.muted = true;
				}}
			/>
		</Pressable>
	);
}
