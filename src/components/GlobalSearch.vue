<script setup>
import {ref,computed,onMounted,onBeforeUnmount,nextTick} from 'vue'
import {useRouter} from 'vue-router'
import {Search,MapPin,TicketCheck,UserRound,PanelsTopLeft,ArrowRight,Command} from 'lucide-vue-next'
import {destinations as destinationSeed,orders as orderSeed} from '../data/mock'
const router=useRouter(),query=ref(''),open=ref(false),input=ref(),active=ref(0)
const modules=[{title:'智慧总览',sub:'运营数据驾驶舱',path:'/',icon:PanelsTopLeft,type:'功能'},{title:'AI 智能行程',sub:'生成个性化旅行路线',path:'/planner',icon:PanelsTopLeft,type:'功能'},{title:'数据洞察',sub:'查看经营分析报表',path:'/analytics',icon:PanelsTopLeft,type:'功能'}]
const getData=()=>{
 const destinations=JSON.parse(localStorage.getItem('travel-destinations')||JSON.stringify(destinationSeed)).map(x=>({title:x.name,sub:`${x.city} · ${x.category}`,path:'/destinations',icon:MapPin,type:'目的地'}))
 const orders=JSON.parse(localStorage.getItem('travel-orders')||JSON.stringify(orderSeed)).map(x=>({title:x.id,sub:`${x.user} · ${x.product}`,path:'/orders',icon:TicketCheck,type:'订单'}))
 const fallback=[{name:'林晓雨',phone:'138****6208'},{name:'陈星',phone:'186****3901'},{name:'周亦辰',phone:'177****1056'}]
 const users=JSON.parse(localStorage.getItem('travel-users')||JSON.stringify(fallback)).map(x=>({title:x.name,sub:x.phone,path:'/operations',icon:UserRound,type:'游客'}))
 return [...modules,...destinations,...orders,...users]
}
const results=computed(()=>{const k=query.value.trim().toLowerCase();if(!k)return modules;return getData().filter(x=>(x.title+x.sub+x.type).toLowerCase().includes(k)).slice(0,8)})
const choose=item=>{router.push({path:item.path,query:{q:query.value,target:item.title}});query.value='';open.value=false;active.value=0}
const keyboard=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open.value=true;nextTick(()=>input.value?.focus())}if(!open.value)return;if(e.key==='ArrowDown'){e.preventDefault();active.value=Math.min(active.value+1,results.value.length-1)}if(e.key==='ArrowUp'){e.preventDefault();active.value=Math.max(active.value-1,0)}if(e.key==='Enter'&&results.value[active.value])choose(results.value[active.value]);if(e.key==='Escape')open.value=false}
onMounted(()=>window.addEventListener('keydown',keyboard));onBeforeUnmount(()=>window.removeEventListener('keydown',keyboard))
</script>
<template><div class="global-search-wrap" @focusin="open=true"><label class="global-search"><Search :size="17"/><input ref="input" v-model="query" placeholder="搜索景点、订单、游客…" @input="active=0"/><kbd>⌘ K</kbd></label><transition name="drop"><div v-if="open" class="search-results"><div class="search-result-head"><span>{{query?`“${query}” 的搜索结果`:'快捷入口'}}</span><small>{{results.length}} 项</small></div><button v-for="(r,i) in results" :class="{active:active===i}" @mouseenter="active=i" @mousedown.prevent="choose(r)"><span><component :is="r.icon"/></span><div><b>{{r.title}}</b><small>{{r.sub}}</small></div><em>{{r.type}}</em><ArrowRight/></button><div v-if="!results.length" class="search-empty"><Search/><b>没有找到相关内容</b><small>试试景点名称、订单号或游客姓名</small></div><footer><span><kbd>↑↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></footer></div></transition><div v-if="open" class="search-mask" @click="open=false"></div></div></template>
