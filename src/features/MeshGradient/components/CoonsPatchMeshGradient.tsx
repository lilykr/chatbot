// From https://github.com/Shopify/react-native-skia/blob/main/apps/paper/src/Examples/Aurora/components/CoonsPatchMeshGradient.tsx

import type { CubicBezierHandle } from "@shopify/react-native-skia";
import {
	BackdropBlur,
	Canvas,
	Group,
	ImageShader,
	Patch,
	Skia,
	add,
	isEdge,
	useClock,
	useImage,
	vec,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { createNoise2D } from "./SimpleNoise";

import { Cubic } from "./Cubic";
import { Curves } from "./Curves";
import { symmetric } from "./Math";
import { useHandles } from "./useHandles";

const rectToTexture = (
	vertices: CubicBezierHandle[],
	[tl, tr, br, bl]: [number, number, number, number],
) =>
	[
		vertices[tl]?.pos,
		vertices[tr]?.pos,
		vertices[br]?.pos,
		vertices[bl]?.pos,
	] as const;

const rectToColors = (
	colors: string[],
	[tl, tr, br, bl]: [number, number, number, number],
) => [colors[tl], colors[tr], colors[br], colors[bl]];

const useRectToPatch = (
	mesh: SharedValue<CubicBezierHandle[]>,
	indices: [number, number, number, number],
): SharedValue<
	[CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle]
> =>
	useDerivedValue(() => {
		const tl = mesh.value[indices[0]];
		const tr = mesh.value[indices[1]];
		const br = mesh.value[indices[2]];
		const bl = mesh.value[indices[3]];
		return [
			{
				pos: tl!.pos,
				c1: tl!.c2,
				c2: tl!.c1,
			},
			{
				pos: tr!.pos,
				c1: symmetric(tr!.c1, tr!.pos),
				c2: tr!.c2,
			},
			{
				pos: br!.pos,
				c1: symmetric(br!.c2, br!.pos),
				c2: symmetric(br!.c1, br!.pos),
			},
			{
				pos: bl!.pos,
				c1: bl!.c1,
				c2: symmetric(bl!.c2, bl!.pos),
			},
		];
	}, [mesh]);

interface CoonsPatchMeshGradientProps {
	rows: number;
	cols: number;
	colors: string[];
	debug?: boolean;
	lines?: boolean;
	handles?: boolean;
	play?: boolean;
}

const F = 10000;
const A = 80;

export const CoonsPatchMeshGradient = ({
	rows,
	cols,
	colors,
	debug,
	lines,
	handles,
	play,
}: CoonsPatchMeshGradientProps) => {
	const { width, height } = useWindowDimensions();
	const win = useMemo(
		() => Skia.XYWHRect(0, 0, width, height),
		[height, width],
	);

	const clock = useClock();
	const image = useImage(require("../../../../assets/debug.png"));
	const dx = width / cols;
	const dy = dx; //100; // height / rows;
	const C = dx / 3;

	const defaultMesh = new Array(cols + 1)
		.fill(0)
		.map((_c, col) =>
			new Array(rows + 1).fill(0).map((_r, row) => {
				const pos = vec(row * dx, col * dy);
				return {
					pos,
					c1: add(pos, vec(C, 0)),
					c2: add(pos, vec(0, C)),
				};
			}),
		)
		.flat(2);
	const rects = new Array(rows).fill(0).flatMap((_r, row) =>
		new Array(cols).fill(0).map((_c, col) => {
			const l = cols + 1;
			const tl = row * l + col;
			const tr = tl + 1;
			const bl = (row + 1) * l + col;
			const br = bl + 1;
			return [tl, tr, br, bl];
		}),
	);
	const noises = defaultMesh.map(() => [
		createNoise2D(),
		createNoise2D(),
		createNoise2D(),
	]);
	const meshNoise = useDerivedValue(() => {
		return defaultMesh.map((pt, i) => {
			if (isEdge(pt.pos, win)) {
				return pt;
			}
			const [noisePos, noiseC1, noiseC2] = noises[i]!;
			return {
				pos: add(
					pt.pos,
					vec(
						A * noisePos!(clock.value / F, 0),
						A * noisePos!(0, clock.value / F),
					),
				),
				c1: add(
					pt.c1,
					vec(
						A * noiseC1!(clock.value / F, 0),
						A * noiseC1!(0, clock.value / F),
					),
				),
				c2: add(
					pt.c1,
					vec(
						A * noiseC2!(clock.value / F, 0),
						A * noiseC2!(0, clock.value / F),
					),
				),
			};
		});
	}, [clock]);

	const meshGesture = useSharedValue(defaultMesh);

	const gesture = useHandles(meshGesture, defaultMesh, win);
	const mesh = play ? meshNoise : meshGesture;

	return (
		<View
			style={[
				StyleSheet.absoluteFill,
				{
					backgroundColor: "#000000",
					zIndex: 1,
					flex: 1,
				},
			]}
		>
			<GestureDetector gesture={gesture}>
				<Canvas style={{ width, height }}>
					<Group>
						<ImageShader image={image} tx="repeat" ty="repeat" />
						{rects.map((r, i) => {
							return (
								<RectPatch
									// biome-ignore lint/suspicious/noArrayIndexKey: Acceptable here
									key={i}
									r={r as [number, number, number, number]}
									mesh={mesh}
									debug={!!debug}
									lines={!!lines}
									colors={colors}
									defaultMesh={defaultMesh}
								/>
							);
						})}
					</Group>
					{defaultMesh.map(({ pos }, index) => {
						if (isEdge(pos, win) || !handles) {
							return null;
						}
						return (
							<Cubic
								// biome-ignore lint/suspicious/noArrayIndexKey: Acceptable here
								key={index}
								mesh={mesh}
								index={index}
								color={colors[index]!}
							/>
						);
					})}
					<BackdropBlur blur={10} clip={{ x: 0, y: 0, width, height }} />
				</Canvas>
			</GestureDetector>
		</View>
	);
};

interface RectPatchProps {
	r: [number, number, number, number];
	debug?: boolean;
	lines?: boolean;
	colors: string[];
	mesh: SharedValue<CubicBezierHandle[]>;
	defaultMesh: CubicBezierHandle[];
}

const RectPatch = ({
	r,
	debug,
	lines,
	colors,
	mesh,
	defaultMesh,
}: RectPatchProps) => {
	const patch = useRectToPatch(mesh, r);
	return (
		<>
			<Patch
				patch={patch}
				colors={debug ? undefined : rectToColors(colors, r)}
				texture={rectToTexture(defaultMesh, r)}
			/>
			{lines && <Curves patch={patch} />}
		</>
	);
};
