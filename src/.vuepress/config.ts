import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "全国高校音游地图",
  description: "供高校新生更方便地找到学校附近的机厅",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
