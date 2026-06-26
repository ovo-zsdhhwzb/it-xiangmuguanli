<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, MapPinned, Sparkles, TicketCheck, PanelsTopLeft, ChartNoAxesCombined, Bell, ChevronDown, LogOut, Menu, X } from 'lucide-vue-next'
import GlobalSearch from '../components/GlobalSearch.vue'
const route=useRoute(), router=useRouter(), collapsed=ref(false), noticeOpen=ref(false)
const menus=[['/','智慧总览',LayoutDashboard],['/destinations','目的地资源',MapPinned],['/planner','AI 智能行程',Sparkles],['/orders','订单中心',TicketCheck],['/operations','运营管理',PanelsTopLeft],['/analytics','数据洞察',ChartNoAxesCombined]]
const userName=ref(localStorage.getItem('travel-user')||'超级管理员')
const initials=computed(()=>userName.value.slice(0,1)||'管')
const logout=()=>{localStorage.removeItem('travel-token');router.push('/login')}
</script>
<template>
<div class="shell">
 <aside :class="['sidebar',{collapsed}]">
  <div class="brand"><div class="brand-mark"><span></span><i></i></div><div class="brand-copy"><b>云迹</b><small>TRAVELSPARK</small></div></div>
  <nav><p class="nav-caption">工作台</p><router-link v-for="[path,label,icon] in menus" :key="path" :to="path"><component :is="icon" :size="19"/><span>{{label}}</span><em></em></router-link></nav>
  <div class="side-card"><span class="pulse-dot"></span><small>系统运行状态</small><b>一切正常</b><div><i style="width:86%"></i></div><small>服务可用率 99.98%</small></div>
  <button class="collapse" @click="collapsed=!collapsed"><Menu v-if="!collapsed" :size="18"/><X v-else :size="18"/></button>
 </aside>
 <main class="main">
  <header class="topbar">
   <div><small>{{route.meta.eyebrow}}</small><h1>{{route.meta.title}}</h1></div>
   <div class="top-actions">
    <GlobalSearch/>
    <button class="icon-btn" @click="noticeOpen=!noticeOpen"><Bell :size="19"/><i></i></button>
    <div class="user-menu"><span>{{initials}}</span><div><b>{{userName}}</b><small>运营中心</small></div><ChevronDown :size="15"/><button @click="logout" title="退出"><LogOut :size="16"/></button></div>
   </div>
   <transition name="drop"><div v-if="noticeOpen" class="notice-panel"><b>消息中心</b><p><span class="orange"></span>您有 8 笔订单待确认</p><p><span class="cyan"></span>AI 推荐模型今日已更新</p><p><span class="violet"></span>「西湖夜游」热度上涨 28%</p></div></transition>
  </header>
  <section class="page"><router-view v-slot="{Component}"><transition name="page" mode="out-in"><component :is="Component"/></transition></router-view></section>
 </main>
</div>
</template>
