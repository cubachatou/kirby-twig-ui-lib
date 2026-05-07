import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [tailwindcss()],
	publicDir: false,
	build: {
		outDir: "assets/dist",
		emptyOutDir: true,
		manifest: true,
		rollupOptions: {
			input: {
				main: "assets/js/main.js",
			},
		},
	},
});
