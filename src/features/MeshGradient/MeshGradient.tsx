import React from "react";

import { CoonsPatchMeshGradient } from "./components/CoonsPatchMeshGradient";

export const MeshGradient = () => {
	return (
		<CoonsPatchMeshGradient
			rows={3}
			cols={3}
			colors={palette}
			// lines
			// handles
			play
		/>
	);
};

const palette = [
	"#B80C95",
	"#B80C95",
	"#B80C95",
	"#B80C95",
	"#B80C95",
	"#C26773",
	"#C26773",
	"#C26773",
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
	"#000000",
	"#000000",
];
