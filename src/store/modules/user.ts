import { defineStore } from 'pinia'
import { store } from '../index'
interface userInfoType {
    username: string,
    age: number,
    gender: string
}
export const useUserStore = defineStore('user', () => {
// 此处使用的是组合式API的方式，更多情况可查看官网
    let userInfo: userInfoType = {
        username: '小明',
        age: 18,
        gender: '男'
    }
    return {
        userInfo
    }
},
)
// 最后到处定义的useUserStore
export function useUserStoreHook() {
    return useUserStore(store)
}
