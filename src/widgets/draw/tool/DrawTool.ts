import Cesium from 'cesium';

// 定义构造函数参数的接口
interface DrawToolConfig {
  viewer: Cesium.Viewer;
  type: 'point' | 'polyline' | 'polygon' | 'circle';
  callback: (positions: Cesium.Cartesian3[]) => void;
}

class DrawTool {
  private viewer: Cesium.Viewer;
  private _type: 'point' | 'polyline' | 'polygon' | 'circle';
  private callback: (positions: Cesium.Cartesian3[]) => void;
  private _positions: Cesium.Cartesian3[] = []; // 活动点
  private handler: Cesium.ScreenSpaceEventHandler;

  // 定义不同绘制类型的处理逻辑
  private enmu: {
    point: {
      addEntities: (position: Cesium.Cartesian3, config?: any) => Cesium.Entity;
      handler: (viewer: Cesium.Viewer, fn: (position: Cesium.Cartesian3) => void) => void;
    };
    polyline: {
      addEntities: (positions: Cesium.Cartesian3[], config?: any) => Cesium.Entity;
      handler: (viewer: Cesium.Viewer, fn: (positions: Cesium.Cartesian3[]) => void) => void;
    };
    polygon: {
      addEntities: (positions: Cesium.Cartesian3[], config?: any) => Cesium.Entity;
      handler: (viewer: Cesium.Viewer, fn: (positions: Cesium.Cartesian3[]) => void) => void;
    };
    circle: {
      addEntities: (center: Cesium.Cartesian3, radius: number, config?: any) => Cesium.Entity;
      handler: (viewer: Cesium.Viewer, fn: (center: Cesium.Cartesian3, radius: number) => void) => void;
    };
  };

  constructor(arg: DrawToolConfig) {
    this.viewer = arg.viewer;
    this._type = arg.type;
    this.callback = arg.callback;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.enmu = {
      point: {
        // 添加点实体
        addEntities: (position, config) => {
          let viewer = this.viewer;
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
        },
        // 处理点的点击事件
        handler: (viewer, fn) => {
          let handler = this.handler;
          handler.setInputAction((movement: Cesium.ScreenSpaceMouseEvent) => {
            let ray = viewer.camera.getPickRay(movement.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            if (position) {
              fn(position);
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          // 左键双击停止绘制
          handler.setInputAction(() => {
            handler.destroy();
            handler = null!;
          }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

          // 右击单击停止绘制
          handler.setInputAction(() => {
            handler.destroy();
            handler = null!;
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
      },
      polyline: {
        // 添加线实体
        addEntities: (positions, config_) => {
          let viewer = this.viewer;
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
        },
        // 处理线的点击事件
        handler: (viewer, fn) => {
          let handler = this.handler;
          let tempPoints: Cesium.Cartesian3[] = [];
          handler.setInputAction((click: Cesium.ScreenSpaceMouseEvent) => {
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            if (position) {
              tempPoints.push(position);
              let tempLength = tempPoints.length;
              let point = this.enmu.point.addEntities(tempPoints[tempPoints.length - 1]);
              if (tempLength > 1) {
                fn([
                  tempPoints[tempPoints.length - 2],
                  tempPoints[tempPoints.length - 1],
                ]);
              }
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          // 右键点击操作
          handler.setInputAction(() => {
            tempPoints = [];
            handler.destroy();
            handler = null!;
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
      },
      polygon: {
        // 添加多边形实体
        addEntities: (positions, config_) => {
          let viewer = this.viewer;
          if (positions.length < 2) return;
          let config = config_ ? config_ : {};
          return viewer.entities.add({
            name: "多边形几何对象",
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy(positions),
              material: Cesium.Color.RED.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.BLACK,
            },
          });
        },
        // 处理多边形的点击事件
        handler: (viewer, fn) => {
          let handler = this.handler;
          let tempPoints: Cesium.Cartesian3[] = [];
          handler.setInputAction((click: Cesium.ScreenSpaceMouseEvent) => {
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            if (position) {
              tempPoints.push(position);
              let tempLength = tempPoints.length;
              let point = this.enmu.point.addEntities(tempPoints[tempPoints.length - 1]);
              if (tempLength > 2) {
                fn([...tempPoints]);
              }
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          // 右键点击操作
          handler.setInputAction(() => {
            if (tempPoints.length > 2) {
              fn([...tempPoints]);
            }
            tempPoints = [];
            handler.destroy();
            handler = null!;
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
      },
      circle: {
        // 添加圆实体
        addEntities: (center, radius, config_) => {
          let viewer = this.viewer;
          let config = config_ ? config_ : {};
          return viewer.entities.add({
            name: "圆几何对象",
            ellipse: {
              semiMajorAxis: radius,
              semiMinorAxis: radius,
              material: Cesium.Color.BLUE.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.BLACK,
              center: center,
            },
          });
        },
        // 处理圆的点击事件
        handler: (viewer, fn) => {
          let handler = this.handler;
          let center: Cesium.Cartesian3 | null = null;
          let radius = 0;
          handler.setInputAction((click: Cesium.ScreenSpaceMouseEvent) => {
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            if (!center) {
              center = position;
            } else if (position) {
              radius = Cesium.Cartesian3.distance(center, position);
              fn(center, radius);
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          // 右键点击操作
          handler.setInputAction(() => {
            center = null;
            radius = 0;
            handler.destroy();
            handler = null!;
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
      },
    };
  }

  // 创建绘制工具
  createDraw() {
    let type = this.enmu[this._type];
    let viewer = this.viewer;
    // 开启深度检测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    type.handler(viewer, (position: Cesium.Cartesian3 | [Cesium.Cartesian3, Cesium.Cartesian3] | Cesium.Cartesian3[], radius?: number) => {
      if (this._type === 'point') {
        this._positions.push(position as Cesium.Cartesian3);
        this.enmu.point.addEntities(position as Cesium.Cartesian3);
      } else if (this._type === 'polyline') {
        this._positions.push(...(position as Cesium.Cartesian3[]));
        this.enmu.polyline.addEntities(position as Cesium.Cartesian3[]);
      } else if (this._type === 'polygon') {
        this._positions.push(...(position as Cesium.Cartesian3[]));
        this.enmu.polygon.addEntities(position as Cesium.Cartesian3[]);
      } else if (this._type === 'circle') {
        this.enmu.circle.addEntities(position as Cesium.Cartesian3, radius!);
      }
      this.callback(this._positions);
    });
  }

  // 清除绘制
  clear() {
    this.viewer.entities.removeAll();
    this._positions = [];
    if (this.handler) {
      this.handler.destroy();
      this.handler = null!;
    }
  }
}

export default DrawTool;