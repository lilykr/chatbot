import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { Pressable } from "react-native";

const MAX_WIDTH_OR_HEIGHT = 220;

type Props = {
	videoUri: string | undefined;
};

export default function VideoPlayer({ videoUri }: Props) {
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
					width: MAX_WIDTH_OR_HEIGHT,
					height: MAX_WIDTH_OR_HEIGHT,
					borderRadius: 15,
					marginLeft: 6,
					marginRight: 6,
					marginTop: 6,
				}}
				player={player}
				allowsFullscreen
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
