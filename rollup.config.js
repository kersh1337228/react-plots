import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

const packageJson = require("./package.json");

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
                banner: "'use client';"
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json"
            }),
            postcss()
        ],
        external: [
            "react",
            "react-dom"
        ]
    },
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.types,
                format: "esm"
            }
        ],
        plugins: [
            dts.default()
        ],
        external: [
            /\.css$/
        ],
    },
];