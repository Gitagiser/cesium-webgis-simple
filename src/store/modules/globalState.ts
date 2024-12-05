import { defineStore } from 'pinia'
import { store } from '../index'
interface globalState {
    activeProp: [string],
    age: number,
    gender: string
}
export const globalState = defineStore('globalState', () => {
// 此处使用的是组合式API的方式，更多情况可查看官网
    let userInfo: globalState = {
        activeProp: ["draw"],
        age: 18,
        gender: '男'
    }
    return {
        userInfo
    }
},
)
// 最后到处定义的globalState
export function globalStateHook() {
    return globalState(store)
}
