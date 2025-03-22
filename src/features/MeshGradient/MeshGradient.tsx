import React from "react";

import { CoonsPatchMeshGradient } from "./components/CoonsPatchMeshGradient";

export const MeshGradient = () => {
	return (
		<CoonsPatchMeshGradient
			rows={3}
			cols={3}
			colors={palette}
			square
			// lines
			// handles
			play
		/>
	);
};

const palette = [
	"#000000",
	"#B80C95",
	"#B80C95",
	"#B80C95",

	"#000000",
	"#C26773",
	"#B80C95",
	"#C26773",

	"#000000",
	"#000000",
	"#C26773",
	"#000000",

	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
	"#000000",
];
