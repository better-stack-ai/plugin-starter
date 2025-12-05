import { defineBuildConfig } from "unbuild";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { copyFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
// Custom plugin to copy CSS during build
function copyStylePlugin(rootDir, outDir) {
    return {
        name: "copy-style",
        generateBundle() {
            const srcPath = resolve(rootDir, "src/style.css");
            const distPath = resolve(outDir, "style.css");
            mkdirSync(dirname(distPath), { recursive: true });
            copyFileSync(srcPath, distPath);
        },
    };
}
export default defineBuildConfig({
    rollup: {
        emitCJS: true,
        output: {
            preserveModules: true,
        },
        esbuild: {
            treeShaking: true,
            jsx: "automatic",
            jsxImportSource: "react",
        },
    },
    declaration: true,
    outDir: "dist",
    clean: true,
    failOnWarn: false,
    externals: [
        // @btst/stack - critical to keep external to avoid duplicate context
        /^@btst\/stack(\/.*)?$/,
        // peerDependencies
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@tanstack/react-query",
        "sonner",
        "@btst/yar",
        /^@radix-ui\/.*/,
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "tailwind-merge",
        "zod",
        // NOTE: @workspace/ui is intentionally NOT externalized
        // so it gets bundled with preserveModules, placing it at dist/packages/ui/src
        // This allows Tailwind to scan UI components when the package is installed from npm
    ],
    entries: [
        "./src/api/index.ts",
        "./src/client/index.ts",
    ],
    hooks: {
        "rollup:options"(ctx, options) {
            // Ensure preserveModules is set on outputs
            if (options.output) {
                if (Array.isArray(options.output)) {
                    options.output.forEach((output) => {
                        if (output) {
                            output.preserveModules = true;
                        }
                    });
                }
                else if (options.output) {
                    options.output.preserveModules = true;
                }
            }
            // Normalize plugins array
            const existingPlugins = Array.isArray(options.plugins)
                ? options.plugins
                : [];
            // Add copy style plugin to copy CSS during build
            existingPlugins.push(copyStylePlugin(ctx.options.rootDir, ctx.options.outDir));
            // Add preserve directives plugin last
            existingPlugins.push(preserveDirectives({ suppressPreserveModulesWarning: true }));
            options.plugins = existingPlugins;
            // Ensure preserveModules is set again after plugins
            if (options.output) {
                if (Array.isArray(options.output)) {
                    options.output.forEach((output) => {
                        if (output) {
                            output.preserveModules = true;
                        }
                    });
                }
                else if (options.output) {
                    options.output.preserveModules = true;
                }
            }
        },
    },
});
