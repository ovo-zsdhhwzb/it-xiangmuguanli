<script setup>
import {ref,onMounted} from 'vue'
import {PawPrint,RefreshCw,Heart,Share2,Sparkles} from 'lucide-vue-next'
import {ElMessage} from 'element-plus'
const cat=ref(null),loading=ref(false),imageReady=ref(false),liked=ref(false)
const moods=['适合说走就走','今天想看山海','负责旅途卖萌','擅长治愈疲惫','正在等你出发']
const dogFallback=[
 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
 'https://images.dog.ceo/breeds/corgi-cardigan/n02113186_1030.jpg'
]
const loadCat=async()=>{loading.value=true;imageReady.value=false;try{const res=await fetch(`/api/dog?t=${Date.now()}`);if(!res.ok)throw new Error('Dog API '+res.status);const data=await res.json();const url=data.message;const breed=(url.match(/breeds\/([^/]+)/)?.[1]||'random-dog').replaceAll('-',' ');cat.value={id:Date.now(),url,tags:[breed,'dog','travel'],mood:moods[Math.floor(Math.random()*moods.length)]}}catch(e){cat.value={id:Date.now(),url:dogFallback[Math.floor(Math.random()*dogFallback.length)],tags:['dog','cute','travel'],mood:'正在等你出发'};ElMessage.warning('狗狗接口有点忙，已启用备用狗狗')}finally{loading.value=false}}
const toggle=()=>{liked.value=!liked.value;ElMessage.success(liked.value?'已收藏今日旅行搭子':'已取消收藏')}
const share=async()=>{const text=`我的今日旅行搭子：一只${cat.value?.mood||'可爱'}的狗狗，来自云迹旅行。`;try{await navigator.clipboard.writeText(text);ElMessage.success('分享文案已复制')}catch{ElMessage.info(text)}}
onMounted(loadCat)
</script>
<template><section class="cat-companion"><div class="cat-copy"><span><PawPrint/>DOG CEO LIVE API</span><h2>今日旅行搭子</h2><p>每次刷新都会从云端随机接一只狗狗，陪你计划下一段旅程。</p><div v-if="cat" class="cat-tags"><i v-for="t in (cat.tags||[]).slice(0,3)"># {{t}}</i><b><Sparkles/>{{cat.mood}}</b></div><div class="cat-buttons"><button @click="loadCat" :disabled="loading"><RefreshCw :class="{spin:loading}"/>{{loading?'正在召唤…':'换一只狗狗'}}</button><button @click="toggle" :class="{liked}"><Heart :fill="liked?'currentColor':'none'"/>{{liked?'已收藏':'收藏'}}</button><button @click="share"><Share2/>分享</button></div><small><i></i>API 实时连接 · 无需密钥</small></div><div class="cat-photo" :class="{loading:loading||!imageReady}"><div class="cat-skeleton"><PawPrint/></div><img v-if="cat" :src="cat.url" alt="随机旅行狗狗" @load="imageReady=true" @error="loadCat"/><span>TRAVEL BUDDY · {{cat?.id?.toString().slice(-6)}}</span><em>随机狗狗</em></div></section></template>
