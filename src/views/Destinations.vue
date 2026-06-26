<script setup>
import {ref,computed,watch,onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {Search,Plus,MapPin,Star,Flame,SlidersHorizontal,MoreHorizontal,X,Save} from 'lucide-vue-next'
import {ElMessage,ElMessageBox} from 'element-plus'
import {api} from '../services/api'

const route=useRoute()
const list=ref([])
const q=ref('')
const cat=ref('全部')
const drawer=ref(false)
const editing=ref(null)
const loading=ref(false)
const cats=['全部','自然风光','历史人文','户外探险','海岛度假','夜游体验','演示数据']
const filtered=computed(()=>list.value.filter(x=>(cat.value==='全部'||x.category===cat.value)&&(`${x.name}${x.city}${x.desc}`.includes(q.value))))

const load=async()=>{loading.value=true;try{list.value=await api.list('destinations')}catch(e){ElMessage.error(e.message||'目的地加载失败')}finally{loading.value=false}}
const open=item=>{editing.value=item?{...item}:{name:'',city:'',category:'自然风光',heat:80,score:4.5,price:0,status:'开放',tag:'新晋推荐',color:'#16b8a6',desc:''};drawer.value=true}
const save=async()=>{
  if(!editing.value.name||!editing.value.city)return ElMessage.warning('请填写目的地名称和城市')
  try{
    editing.value.id?await api.update('destinations',editing.value.id,editing.value):await api.create('destinations',editing.value)
    drawer.value=false
    await load()
    ElMessage.success('目的地信息已保存到后端')
  }catch(e){ElMessage.error(e.message||'保存失败')}
}
const remove=async item=>{
  await ElMessageBox.confirm(`确认下架「${item.name}」？`,'下架确认')
  try{await api.remove('destinations',item.id);await load();ElMessage.success('已从后端删除')}catch(e){ElMessage.error(e.message||'删除失败')}
}
watch(()=>route.query.q,v=>{if(v)q.value=String(v)},{immediate:true})
onMounted(load)
</script>

<template>
  <div>
    <div class="toolbar card">
      <div class="search-box"><Search :size="18"/><input v-model="q" placeholder="搜索目的地名称或城市"/></div>
      <div class="category-tabs"><button v-for="c in cats" :key="c" :class="{active:cat===c}" @click="cat=c">{{c}}</button></div>
      <button class="outline-btn" @click="load"><SlidersHorizontal :size="17"/>{{loading?'同步中':'刷新后端'}}</button>
      <button class="primary-btn compact" @click="open()"><Plus :size="18"/>新增目的地</button>
    </div>
    <div class="section-heading"><div><h2>目的地资源库</h2><p>当前后端共保存 {{list.length}} 个目的地 · 数据来自 Node API</p></div><div class="view-switch"><button class="active">▦</button><button>☰</button></div></div>
    <div class="destination-grid">
      <article v-for="(d,i) in filtered" :key="d.id" class="destination-card" :style="{'--accent':d.color||'#16b8a6','--delay':i*50+'ms'}">
        <div class="destination-visual"><div class="scene" :class="'scene-'+((Number(d.id)%6)+1)"><span class="sun"></span><i class="mount m1"></i><i class="mount m2"></i><b>{{d.city}}</b></div><span class="tag">{{d.tag}}</span><button @click="open(d)"><MoreHorizontal/></button><div class="heat"><Flame :size="14"/>热度 {{d.heat}}</div></div>
        <div class="destination-body"><div><span class="category">{{d.category}}</span><span :class="['open-state',d.status]">{{d.status}}</span></div><h3>{{d.name}}</h3><p>{{d.desc}}</p><div class="destination-meta"><span><MapPin :size="15"/>{{d.city}}</span><span><Star :size="15" fill="#fbbf24" color="#fbbf24"/>{{d.score}}</span><b>{{d.price?`¥${d.price} 起`:'免费开放'}}</b></div><div class="card-actions"><button @click="open(d)">编辑资料</button><button @click="remove(d)">下架</button></div></div>
      </article>
    </div>
    <el-empty v-if="!filtered.length" description="没有找到匹配的目的地"/>
    <el-drawer v-model="drawer" size="480px" :show-close="false">
      <template #header><div class="drawer-title"><div><small>DESTINATION EDITOR</small><h2>{{editing?.id?'编辑目的地':'新增目的地'}}</h2></div><button @click="drawer=false"><X/></button></div></template>
      <el-form v-if="editing" label-position="top">
        <div class="form-two"><el-form-item label="目的地名称"><el-input v-model="editing.name"/></el-form-item><el-form-item label="所在城市"><el-input v-model="editing.city"/></el-form-item></div>
        <div class="form-two"><el-form-item label="资源分类"><el-select v-model="editing.category"><el-option v-for="c in cats.slice(1)" :key="c" :label="c" :value="c"/></el-select></el-form-item><el-form-item label="开放状态"><el-select v-model="editing.status"><el-option label="开放" value="开放"/><el-option label="限流" value="限流"/><el-option label="关闭" value="关闭"/></el-select></el-form-item></div>
        <div class="form-two"><el-form-item label="门票价格"><el-input-number v-model="editing.price" :min="0"/></el-form-item><el-form-item label="推荐指数"><el-slider v-model="editing.heat"/></el-form-item></div>
        <el-form-item label="推荐标签"><el-input v-model="editing.tag"/></el-form-item>
        <el-form-item label="目的地简介"><el-input v-model="editing.desc" type="textarea" :rows="5"/></el-form-item>
        <button type="button" class="primary-btn" @click="save"><Save :size="18"/>保存到后端</button>
      </el-form>
    </el-drawer>
  </div>
</template>
