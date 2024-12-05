<template>
  <div style="display: flex;width: auto;z-index: 999;padding: 20px;">
    <el-button type="primary" plain @click="draw('point')" class="animate__backInLeft">点</el-button>
    <el-button type="primary" plain @click="draw('polyline')" class="animate__backInLeft">线</el-button>
    <el-button type="primary" plain @click="draw('polygon')" class="animate__backInLeft">面</el-button>
    <el-button type="primary" plain @click="clear()" class="animate__backInLeft">清除</el-button>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
var material = null;
var handler = null;
var openDrawLine = false;
let tempEntities = [];


onMounted(() => {});
/**
 * 根据类型绘制对象
 * @param type point、polyline、polygon
 */
function draw(type) {
  //绘制点
  let that = this;
  let viewer = window.viewer;
  let tempEntities = this.tempEntities;
  let position = [];
  let tempPoints = [];
  let arg = {
    viewer:window.viewer,
    Cesium:window.Cesium,
    type:type
  }
  // 开启深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  switch (type) {
    case "point":
      // 监听鼠标左键
      handler.setInputAction(function (movement) {
        debugger;
        // 从相机位置通过windowPosition 世界坐标中的像素创建一条射线。返回Cartesian3射线的位置和方向。
        let ray = viewer.camera.getPickRay(movement.position);
        // 查找射线与渲染的地球表面之间的交点。射线必须以世界坐标给出。返回Cartesian3对象
        position = viewer.scene.globe.pick(ray, viewer.scene);
        let point = that.drawPoint(position);
        tempEntities.push(point);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 左键双击停止绘制
      handler.setInputAction(function () {
        handler.destroy(); //关闭事件句柄
        handler = null;
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      // 右击单击停止绘制
      handler.setInputAction(function () {
        handler.destroy(); //关闭事件句柄
        handler = null;
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      break;
    case "polyline":
      //鼠标移动事件
      handler.setInputAction(function (movement) {},
      Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //左键点击操作
      handler.setInputAction(function (click) {
        //调用获取位置信息的接口
        let ray = viewer.camera.getPickRay(click.position);
        position = viewer.scene.globe.pick(ray, viewer.scene);
        tempPoints.push(position);
        let tempLength = tempPoints.length;
        //调用绘制点的接口
        let point = that.drawPoint(tempPoints[tempPoints.length - 1]);
        tempEntities.push(point);
        if (tempLength > 1) {
          let pointline = that.drawPolyline([
            tempPoints[tempPoints.length - 2],
            tempPoints[tempPoints.length - 1],
          ]);
          tempEntities.push(pointline);
        } else {
          // tooltip.innerHTML = "请绘制下一个点，右键结束";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      //右键点击操作
      handler.setInputAction(function (click) {
        tempPoints = [];
        handler.destroy(); //关闭事件句柄
        handler = null;
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      break;
    case "polygon":
      //鼠标移动事件
      handler.setInputAction(function (movement) {},
      Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //左键点击操作
      handler.setInputAction(function (click) {
        //调用获取位置信息的接口
        let ray = viewer.camera.getPickRay(click.position);
        position = viewer.scene.globe.pick(ray, viewer.scene);
        tempPoints.push(position);
        let tempLength = tempPoints.length;
        //调用绘制点的接口
        let point = that.drawPoint(position);
        tempEntities.push(point);
        if (tempLength > 1) {
          let pointline = that.drawPolyline([
            tempPoints[tempPoints.length - 2],
            tempPoints[tempPoints.length - 1],
          ]);
          tempEntities.push(pointline);
        } else {
          // tooltip.innerHTML = "请绘制下一个点，右键结束";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      //右键点击操作
      handler.setInputAction(function (click) {
        let cartesian = viewer.camera.pickEllipsoid(
          click.position,
          viewer.scene.globe.ellipsoid
        );

        if (cartesian) {
          let tempLength = tempPoints.length;
          if (tempLength < 3) {
            alert("请选择3个以上的点再执行闭合操作命令");
          } else {
            //闭合最后一条线
            let pointline = that.drawPolyline([
              tempPoints[tempPoints.length - 1],
              tempPoints[0],
            ]);
            tempEntities.push(pointline);
            that.drawPolygon(tempPoints);
            tempEntities.push(tempPoints);
            handler.destroy(); //关闭事件句柄
            handler = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      break;
  }
}
function drawPoint(position, config) {
  let viewer = window.viewer;
  let config_ = config ? config : {};
  return viewer.entities.add({
    name: "点几何对象",
    position: position,
    point: {
      color: Cesium.Color.SKYBLUE,
      pixelSize: 10,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}
function drawPolyline(positions, config_) {
  let viewer = window.viewer;
  if (positions.length < 1) return;
  let config = config_ ? config_ : {};
  return viewer.entities.add({
    name: "线几何对象",
    polyline: {
      positions: positions,
      width: config.width ? config.width : 5.0,
      material: new Cesium.PolylineGlowMaterialProperty({
        color: config.color
          ? new Cesium.Color.fromCssColorString(config.color)
          : Cesium.Color.GOLD,
      }),
      depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
        color: config.color
          ? new Cesium.Color.fromCssColorString(config.color)
          : Cesium.Color.GOLD,
      }),
      clampToGround: true,
    },
  });
}
function drawPolygon(positions, config_) {
  let viewer = window.viewer;
  if (positions.length < 2) return;
  let config = config_ ? config_ : {};
  return viewer.entities.add({
    name: "长方体",
    show: true,
    polygon: {
      hierarchy: positions,
      outline: true,
      outlineWidth: 100,
      arcType: Cesium.ArcType.RHUMB,
      material: Cesium.Color.RED.withAlpha(0.5),
    }
  });
}
function getCoord() {
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    var earthPosition = viewer.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid
    );
    var cartographic = Cesium.Cartographic.fromCartesian(
      earthPosition,
      viewer.scene.globe.ellipsoid,
      new Cesium.Cartographic()
    );
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var height = cartographic.height;
    console.log(lng + "," + lat, "point"); //打印经纬度
    addPoint(lat, lng, 20); // 点
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction((event) => {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //移除事件
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
function getCoord2() {
  let positions = [];

  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    var earthPosition = viewer.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid
    );
    var cartographic = Cesium.Cartographic.fromCartesian(
      earthPosition,
      viewer.scene.globe.ellipsoid,
      new Cesium.Cartographic()
    );
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var height = cartographic.height;
    console.log(lng + "," + lat, "line"); //打印经纬度
    if (!openDrawLine) return;
    positions.push([lat, lng]);
    addPolyline(positions);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction((event) => {
    openDrawLine = false;
    console.log("关闭画线");
    console.log(positions);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //移除事件
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  handler.setInputAction((event) => {
    openDrawLine = false;
    console.log("清除");
    positions = [];
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

// 绘制点
function addPoint(latitude, longitude, height) {
  var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  viewer.entities.add({
    name: "Point",
    position: position,
    point: {
      pixelSize: 10,
      color: Cesium.Color.BLUE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  });
}

// 绘制线
function addPolyline(coordinates) {
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
      width: 5,
      material: Cesium.Color.GREEN,
    },
  });
}

// 绘制多边形
function addPolygon(coordinates) {
  viewer.entities.add({
    polygon: {
      hierarchy: Cesium.PolygonHierarchy.fromCartographicArray(coordinates),
      material: Cesium.Color.YELLOW.withAlpha(0.5),
    },
  });
}

function DrawPoint(viewer) {
  this.viewer = window.viewer;
  this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  this.positions = [];
  this.entity = viewer.entities.add({
    name: "Manual Drawing",
    point: new Cesium.PointGraphics(),
  });
}
function clear() {
  viewer.entities.removeAll();
}
DrawPoint.prototype.startDrawing = function () {
  this.handler.setInputAction(
    function (movement) {
      var pickedPosition = viewer.scene.pickPosition(movement.endPosition);
      if (pickedPosition) {
        var position = Cesium.Cartesian3.fromDegrees(
          pickedPosition.longitude,
          pickedPosition.latitude,
          0.0
        );
        this.positions.push(position);

        // 更新点
        this.entity.point.show = true;
        this.entity.point.position = position;
        this.entity.point.color = Cesium.Color.RED;
        this.entity.point.pixelSize = 10;

        // 清除上次绘制的点
        viewer.entities.remove(this.entity);
        this.entity = viewer.entities.add({
          name: "Manual Drawing",
          point: new Cesium.PointGraphics({
            positions: this.positions,
            color: Cesium.Color.RED,
            pixelSize: 10,
          }),
        });
      }
    }.bind(this),
    Cesium.ScreenSpaceEventType.LEFT_DOWN
  );

  this.handler.setInputAction(
    function () {
      this.clearPoints();
    }.bind(this),
    Cesium.ScreenSpaceEventType.RIGHT_DOWN
  );
};

DrawPoint.prototype.clearPoints = function () {
  this.positions = [];
  this.entity.point.show = false;
  viewer.entities.remove(this.entity);
  this.entity = viewer.entities.add({
    name: "Manual Drawing",
    point: new Cesium.PointGraphics(),
  });
};
</script>
<style scoped></style>
