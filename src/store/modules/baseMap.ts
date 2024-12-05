import { defineStore } from 'pinia'
import { store } from '../index'
interface baseCesiumMap {
    username: string,
    age: number,
    gender: string
}
export const baseCesiumMap = defineStore('baseMap', () => {
// 此处使用的是组合式API的方式，更多情况可查看官网
    let baseMap: baseCesiumMap = {
        username: '小明',
        age: 18,
        gender: '男'
    }
    return {
        baseMap
    }
},
)
// 最后到处定义的useUserStore
export function baseCesiumMapHook() {
    return baseCesiumMap(store)
}
