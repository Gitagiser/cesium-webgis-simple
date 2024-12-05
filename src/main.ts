import { createApp } from "vue";
import 'animate.css';
import App from "./App.vue";
const app = createApp(App);
// 路由设置
import router from "./router/index";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

// pinia
import { setupStore } from "./store";

setupStore(app);
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

app.mount("#app");
