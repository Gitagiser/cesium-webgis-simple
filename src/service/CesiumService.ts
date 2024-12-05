import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
// 创建一个ref来保存viewer实例
const viewerRef = ref<Cesium.Viewer | null>(null);
// 初始化Cesium viewer的函数
function initCesium() {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    // 可以在这里配置Cesium Viewer的初始参数，如地形、光照等
    timeline: true,
    animation: true,
    sceneModePicker: true,
    geocoder: false, // 位置查找工具
    baseLayerPicker: false, // 图层选择器（地形影像服务）
    // timeline: false, // 底部时间线
    // animation: false, // 左下角仪表盘（动画器件）
    infoBox: true, // 打开自带详情弹窗
    shouldAnimate: true, // 允许播放动画
    // terrain: Cesium.Terrain.fromWorldTerrain() // 地形数据
  });
  // 去除版权信息
  viewer._cesiumWidget._creditContainer.style.display = "none";
//   viewer.cesiumWidget.creditContainer.style.display = "none";
  // // 创建默认高程数据源
  // var terrainProvider = new Cesium.CesiumTerrainProvider({
  //   url: Cesium.IonResource.fromAssetId(1),
  // });

  // viewer.terrainProvider = terrainProvider;

  // 停止时间的进度
  viewer.clock.shouldAnimate = false;

  // 开启光照
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.light = new Cesium.SunLight({
    color: Cesium.Color.WHITE,
    intensity: 5.0,
  });
  viewerRef.value = viewer;
}
onMounted(() => {
  initCesium();
});
// 提供一个方法来获取viewer实例
function getViewer(): Cesium.Viewer | null {
  return viewerRef.value;
}
export { getViewer };
