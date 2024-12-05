<template>
  <div id="cesiumContainer"></div>
  <!-- <div class="tool" style="position: fixed; top: 20px; left: 10px">
    <el-button type="primary" @click="dialogVisible = !dialogVisible" class="animate__animated animate__bounce">{{ dialogVisible ? "隐藏":"显示" }}</el-button>
    <drawTool v-if="dialogVisible"></drawTool>
    <threedtiles v-if="dialogVisible"></threedtiles>
  </div> -->
  <search class="animate__lightSpeedInLeft"/>
</template>

<script setup lang="ts">
import { onMounted, defineComponent, ref } from "vue";
import * as Cesium from "cesium";
import drawTool from "@/widgets/draw/index.vue";
import threedtiles from "@/widgets/preview/threedtiles/threedtiles.vue";
import MovablePopup from "@/components/MovablePopup/MovablePopup.vue";
import search from "../search/search.vue";

window.Cesium = Cesium;
const dialogVisible = ref(false);

onMounted(() => {
  const container = document.getElementById("cesiumContainer");
  Cesium.Ion.defaultAccessToken =
    import.meta.env.VITE_APP_CESIUM_defaultAccessToken;

  window.viewer = new Cesium.Viewer(container, {
    timeline: true,
    animation: true,
    sceneModePicker: true,
    geocoder: false, // 位置查找工具
    baseLayerPicker: false, // 图层选择器（地形影像服务）
    timeline: false, // 底部时间线
    animation: false, // 左下角仪表盘（动画器件）
    infoBox: true, // 打开自带详情弹窗
    shouldAnimate: true, // 允许播放动画
    terrain: Cesium.Terrain.fromWorldTerrain(), // 地形数据

    sceneModePicker: false, // 关闭鼠标捕捉锁定
    enableMouseEventPassthrough: false, // 设置为false，关闭鼠标捕捉锁定
  });

  // 停止时间的进度
  viewer.clock.shouldAnimate = false;

  // 开启光照
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.light = new Cesium.SunLight({
    color: Cesium.Color.WHITE,
    intensity: 5.0,
  });
});
</script>
<style scoped lang="less">
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.tool{
    .classtttt{
        width: 100%;
        height: 200px;
        background-color: aqua;
    }
}

</style>
