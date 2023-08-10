import { defineConfig } from "vite"; // 动态配置函数
import { createVuePlugin } from "vite-plugin-vue2";
import { resolve } from "path";
import { PREFIX } from "./src/utils"


const genBaseUrl = (mode) => {
  switch (mode) {
    case "production":
      return `${PREFIX}`
    default:
      return "/"
  }
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [createVuePlugin()],
    base: genBaseUrl(mode),
    resolve: {
      // 别名
      alias: {
        "@": resolve(__dirname, "./src"),
        assets: resolve(__dirname, "./assets"),
      },
    },
    // server: {
    //   host: "0.0.0.0",
    // },
    // test: {
    //   testTimeout: 30000,
    // },
  }
})
