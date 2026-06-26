<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {MapPin,ArrowRight,ShieldCheck,Sparkles,BarChart3,UserPlus} from 'lucide-vue-next'
import {ElMessage} from 'element-plus'
import {api} from '../services/api'

const router=useRouter()
const account=ref('admin')
const password=ref('123456')
const loading=ref(false)

const login=async()=>{
  if(!account.value||!password.value)return ElMessage.warning('请输入账号和密码')
  loading.value=true
  try{
    const result=await api.login({account:account.value,password:password.value})
    const user=result.user
    localStorage.setItem('travel-token',result.token)
    localStorage.setItem('travel-role',user.role||'visitor')
    localStorage.setItem('travel-user',user.name)
    localStorage.setItem('travel-account',user.account)
    localStorage.setItem('travel-user-id',user.id)
    ElMessage.success(`欢迎回来，${user.name}`)
    router.push(user.role==='admin'?'/':'/portal')
  }catch(e){
    ElMessage.error(e.message||'账号或密码错误')
  }finally{
    loading.value=false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="aurora a1"></div><div class="aurora a2"></div><div class="grid-bg"></div>
    <section class="login-story">
      <div class="login-logo"><div class="brand-mark"><span></span><i></i></div><b>云迹 TRAVELSPARK</b></div>
      <div class="hero-copy">
        <div class="hero-tag"><Sparkles :size="15"/> AI 驱动的智慧旅游平台</div>
        <h1>让每一次出发<br/><em>都有迹可循</em></h1>
        <p>连接目的地、游客与服务，用数据洞察旅行灵感，用智能算法规划每一段美好旅程。</p>
      </div>
      <div class="feature-row">
        <div><MapPin/><b>200+</b><span>精选目的地</span></div>
        <div><BarChart3/><b>98.6%</b><span>推荐满意度</span></div>
        <div><ShieldCheck/><b>24h</b><span>实时运营监控</span></div>
      </div>
      <div class="orbit"><span class="pin p1"></span><span class="pin p2"></span><span class="pin p3"></span><i></i><i></i><i></i></div>
    </section>
    <section class="login-wrap">
      <form class="login-card" @submit.prevent="login">
        <small>WELCOME BACK</small>
        <h2>登录云迹系统</h2>
        <p>账号会通过 Node 后端进行验证</p>
        <label>账号<input v-model.trim="account" autocomplete="username" placeholder="请输入账号"/></label>
        <label>密码<div class="password"><input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码"/><span>演示密码 123456</span></div></label>
        <div class="login-options"><el-checkbox>记住我</el-checkbox><a>忘记密码？</a></div>
        <button class="primary-btn" :disabled="loading">{{loading?'正在连接云端后端…':'进入系统'}}<ArrowRight :size="18"/></button>
        <button type="button" class="register-link" @click="router.push('/register')"><UserPlus/>注册游客账号</button>
        <div class="demo-tip">管理端：<b>admin</b>　游客端：<b>traveler</b><br/>统一密码：<b>123456</b></div>
      </form>
      <p class="copyright">© 2026 云迹智慧文旅 · Vue3 前后端分离课程设计</p>
    </section>
  </div>
</template>
