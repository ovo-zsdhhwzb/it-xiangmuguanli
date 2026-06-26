<script setup>
import {ref,computed} from 'vue'
import {useRouter} from 'vue-router'
import {UserPlus,ArrowLeft,CheckCircle2,ShieldCheck} from 'lucide-vue-next'
import {ElMessage} from 'element-plus'
import {api} from '../services/api'

const router=useRouter()
const loading=ref(false)
const agree=ref(true)
const form=ref({account:'',name:'',phone:'',password:'',confirm:''})
const strength=computed(()=>Math.min(3,[form.value.password.length>=6,/[A-Za-z]/.test(form.value.password),/\d/.test(form.value.password)].filter(Boolean).length))

const register=async()=>{
  const f=form.value
  if(!f.account||!f.name||!f.phone||!f.password)return ElMessage.warning('请完整填写注册信息')
  if(!/^[a-zA-Z][a-zA-Z0-9_]{3,15}$/.test(f.account))return ElMessage.warning('账号需以字母开头，长度 4-16 位')
  if(!/^1\d{10}$/.test(f.phone))return ElMessage.warning('请输入正确的手机号')
  if(f.password.length<6)return ElMessage.warning('密码至少 6 位')
  if(f.password!==f.confirm)return ElMessage.error('两次密码输入不一致')
  if(!agree.value)return ElMessage.warning('请同意服务协议')
  loading.value=true
  try{
    await api.register({account:f.account,password:f.password,name:f.name,phone:f.phone})
    ElMessage.success('注册成功，账号已写入云端后端')
    router.push('/login')
  }catch(e){
    ElMessage.error(e.message||'注册失败')
  }finally{
    loading.value=false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-visual">
      <div class="login-logo"><div class="brand-mark"><span></span><i></i></div><b>云迹 TRAVELSPARK</b></div>
      <div><span>JOIN THE JOURNEY</span><h1>创建你的<br/>旅行身份</h1><p>注册信息会保存到 Node 后端，部署后即可成为真正的网站用户数据。</p></div>
      <ul><li><CheckCircle2/>AI 个性化行程推荐</li><li><CheckCircle2/>云端保存旅行数据</li><li><ShieldCheck/>账号数据安全保护</li></ul>
    </div>
    <main class="register-main">
      <button class="back-login" @click="router.push('/login')"><ArrowLeft/>返回登录</button>
      <form class="register-card" @submit.prevent="register">
        <small>CREATE ACCOUNT</small>
        <h2>注册游客账号</h2>
        <p>完成注册后将写入后端 users.json</p>
        <div class="form-two"><label>登录账号<input v-model.trim="form.account" placeholder="如 linxiaoyu"/></label><label>真实姓名<input v-model.trim="form.name" placeholder="请输入姓名"/></label></div>
        <label>手机号码<input v-model.trim="form.phone" maxlength="11" placeholder="用于订单通知与找回密码"/></label>
        <label>设置密码<input v-model="form.password" type="password" placeholder="至少 6 位，建议包含字母和数字"/></label>
        <div class="password-strength"><i v-for="n in 3" :key="n" :class="{active:strength>=n}"></i><span>{{['密码强度','弱','中等','安全'][strength]}}</span></div>
        <label>确认密码<input v-model="form.confirm" type="password" placeholder="请再次输入密码"/></label>
        <el-checkbox v-model="agree">我已阅读并同意《用户服务协议》和《隐私政策》</el-checkbox>
        <button class="primary-btn" :disabled="loading"><UserPlus/>{{loading?'正在写入云端…':'完成注册'}}</button>
      </form>
    </main>
  </div>
</template>
