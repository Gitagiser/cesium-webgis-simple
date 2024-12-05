<template>
  <div style="display: flex">
    <el-input type="primary" v-model="insertUrl"></el-input>
    <el-button type="primary" plain @click="loadTileset">从URL加载</el-button>
    <el-button type="primary" plain @click="clearTileset">清除</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
onMounted(() => {
  console.log("cesium", Cesium);
});
const insertUrl = ref("https://data.mars3d.cn/3dtiles/qx-hfdxy/tileset.json");
let currentTileset = ref<Cesium.Cesium3DTileset | null>(null);
async function loadTileset(): void {
  const url = insertUrl.value.trim();
  if (!url) {
    alert("请输入有效的3D Tiles URL");
    return;
  }
  if (currentTileset.value) {
    viewer.scene.primitives.remove(currentTileset);
    currentTileset = null;
  }

  // 使用完整的URL（如果是相对路径，添加域名）
  const fullUrl = url.startsWith("http") ? url : window.location.origin + url;
  console.log("Loading tileset from:", fullUrl);

  // 加载tileset
  const tileset = await Cesium.Cesium3DTileset.fromUrl(fullUrl, {
    maximumScreenSpaceError: 16,
    maximumMemoryUsage: 4096,
  });
  currentTileset = viewer.scene.primitives.add(tileset);

  // 等待tileset加载完成
  await tileset.readyPromise;
  //   viewer.zoomTo(currentTileset);
  // 计算合适的视角
  const boundingSphere = tileset.boundingSphere;
  const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
  const surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    0.0
  );
  const offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    boundingSphere.radius * 2.0
  );

  // 飞行到合适的位置
  viewer.camera.flyTo({
    destination: offset,
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-45.0),
      roll: 0.0,
    },
    duration: 1.5,
    complete: function () {
      console.log("Camera flight completed");
    },
  });
}

function clearTileset() {
  viewer.scene.primitives.remove(currentTileset);
  currentTileset = null;
}
</script>

<style scoped></style>
