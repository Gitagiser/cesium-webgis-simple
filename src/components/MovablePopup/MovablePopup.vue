<template>
  <transition name="popup-fade">
    <div
      class="movable-popup"
      :style="{ left: left + 'px', top: top + 'px' }"
      @mousedown="onMouseDown"
    >
      <div class="popup-header">
        <slot name="header">
          <h3 class="popup-title">弹窗标题</h3>
        </slot>
        <button
          class="popup-close-btn"
          @click="isVisible = false"
        >
          &times;
        </button>
      </div>
      <div class="popup-content">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, defineComponent } from 'vue';

export default defineComponent({
  name: 'MovablePopup',
  props: {
    // 初始横坐标位置，类型为数字，默认值为0
    initialLeft: {
      type: Number,
      default: 0
    },
    // 初始纵坐标位置，类型为数字，默认值为0
    initialTop: {
      type: Number,
      default: 0
    },
    // 控制弹窗是否可见，类型为布尔值，默认值为false
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 使用ref来创建响应式数据，初始值为传入的props.visible
    const isVisible = ref<boolean>(props.visible);
    // 使用ref来创建响应式数据，初始值为传入的props.initialLeft
    const left = ref<number>(props.initialLeft);
    // 使用ref来创建响应式数据，初始值为传入的props.initialTop
    const top = ref<number>(props.initialTop);
    let startX: number;
    let startY: number;

    // 鼠标按下事件处理函数
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    // 鼠标移动事件处理函数
    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      left.value += dx;
      top.value += dy;
      startX = e.clientX;
      startY = e.clientY;
    };

    // 鼠标抬起事件处理函数
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    onMounted(() => {
      if (props.visible) {
        isVisible.value = true;
      }
    });

    onUnmounted(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });

    return {
      isVisible,
      left,
      top,
      onMouseDown
    };
  }
});
</script>

<style scoped>
.movable-popup {
  position: fixed;
  z-index: 999;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  min-width: 200px;
  min-height: 100px;
  transition: all 0.3s ease;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.popup-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.popup-close-btn {
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
}

.popup-close-btn:hover {
  color: #374151;
}

.popup-content {
  padding: 16px;
  font-size: 16px;
  line-height: 1.5;
  color: #374151;
}

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.popup-fade-enter,
.popup-fade-leave-to {
  opacity: 0;
}
</style>