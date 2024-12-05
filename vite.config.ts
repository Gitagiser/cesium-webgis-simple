import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cesium from "vite-plugin-cesium";
import * as path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173, // 设置服务启动端口号
    // open: true, // 设置服务启动时是否自动打开浏览器
    cors: true, // 允许跨域

    // 设置代理，根据我们项目实际情况配置
    proxy: {
      "/3dtiles": {
        //apiTest是自行设置的请求前缀，按照这个来匹配请求，有这个字段的请求，就会进到代理来
        target: "http://127.0.0.1:8080",
        changeOrigin: true, //是否跨域
        rewrite: (path) => path.replace(/^\/3dtiles/, "/3dtiles"),
      },
    },
  },
});
