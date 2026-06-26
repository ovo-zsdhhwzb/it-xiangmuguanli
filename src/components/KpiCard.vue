<script setup>
import {ref,onMounted} from 'vue'
import {ArrowUpRight} from 'lucide-vue-next'
const props=defineProps({label:String,value:String,change:String,icon:Object,color:String,sub:String})
const display=ref(props.value)
onMounted(()=>{if(props.label!=='累计服务游客')return;const target=Number(props.value.replaceAll(',','')),start=performance.now(),duration=1400;display.value='0';const tick=now=>{const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,4);display.value=Math.floor(target*e).toLocaleString();if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})
</script>
<template><div class="kpi card"><div class="kpi-head"><span :style="{background:color+'20',color}"><component :is="icon" :size="21"/></span><small>较昨日 <b><ArrowUpRight :size="12"/>{{change}}</b></small></div><p>{{label}}</p><h3 :class="{'count-pop':label==='累计服务游客'}">{{display}}</h3><div class="micro-bars"><i v-for="n in 12" :key="n" :style="{height:(16+((n*13)%28))+'px',background:n>8?color:''}"></i></div><small>{{sub}}</small></div></template>
