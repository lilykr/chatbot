import { useEvent } from "expo";
import { Video, type VideoReadyForDisplayEvent } from "expo-av";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { Pressable } from "react-native";

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

	if (!dimensions)
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
					...(dimensions.width >= dimensions.height
						? {
								width: MAX_WIDTH_OR_HEIGHT,
								height:
									(dimensions.height / dimensions.width) * MAX_WIDTH_OR_HEIGHT,
							}
						: {
								height: MAX_WIDTH_OR_HEIGHT,
								width:
									(dimensions.width / dimensions.height) * MAX_WIDTH_OR_HEIGHT,
							}),
				}}
				player={player}
				allowsFullscreen
				allowsPictureInPicture
				contentFit="cover"
			/>
		</Pressable>
	);
}
