<template>
  <div>
    <el-input v-model="username" placeholder="用户名"></el-input>
    <div>{{ userInfo.username }}的年龄是{{ userInfo.age }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../../store/modules/user";

const userStore = useUserStore();
let userInfo = userStore.userInfo;
const username = ref("");
</script>

<style scoped></style>
