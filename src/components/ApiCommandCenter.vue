<script setup>
import {computed,onMounted,ref} from 'vue'
import {Activity,Cloud,Coins,DatabaseZap,RefreshCw,ShieldCheck,Wifi} from 'lucide-vue-next'

const cities=[
  {name:'杭州',lat:30.2741,lng:120.1551,tip:'西湖、灵隐寺、运河夜游'},
  {name:'北京',lat:39.9042,lng:116.4074,tip:'故宫、中轴线、胡同文化'},
  {name:'厦门',lat:24.4798,lng:118.0894,tip:'鼓浪屿、海岸线、城市漫游'},
  {name:'丽江',lat:26.8721,lng:100.2296,tip:'古城、雪山、纳西文化'},
  {name:'西安',lat:34.3416,lng:108.9398,tip:'大唐不夜城、城墙、秦唐文化'}
]
const currencyOptions=['CNY','JPY','EUR','USD','THB','AUD','GBP']
const city=ref('杭州')
const from=ref('CNY')
const to=ref('JPY')
const amount=ref(1000)
const fx=ref(null)
const air=ref(null)
const loading=ref(false)
const updatedAt=ref('--')
const apiLog=ref([
  {name:'ExchangeRate',status:'standby',text:'等待请求'},
  {name:'Open-Meteo Air',status:'standby',text:'等待请求'}
])

const currentCity=computed(()=>cities.find(x=>x.name===city.value)||cities[0])
const converted=computed(()=>{
  const rate=fx.value?.rates?.[to.value]
  return rate?Number(amount.value*rate).toFixed(2):'--'
})
const aqi=computed(()=>air.value?.european_aqi ?? '--')
const pm25=computed(()=>air.value?.pm2_5 ?? '--')
const airLevel=computed(()=>{
  const value=Number(aqi.value)
  if(!value)return '等待数据'
  if(value<=20)return '空气很棒'
  if(value<=40)return '适合户外'
  if(value<=60)return '轻度关注'
  return '建议减少户外'
})
const health=computed(()=>apiLog.value.filter(x=>x.status==='online').length)

const setLog=(name,status,text)=>{
  const i=apiLog.value.findIndex(x=>x.name===name)
  if(i>=0)apiLog.value[i]={name,status,text}
}
const load=async()=>{
  loading.value=true
  setLog('ExchangeRate','loading','正在获取实时汇率')
  setLog('Open-Meteo Air','loading','正在获取空气质量')
  const c=currentCity.value
  const [rateResult,airResult]=await Promise.allSettled([
    fetch(`/api/exchange/${from.value}`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}),
    fetch(`/api/air?latitude=${c.lat}&longitude=${c.lng}&current=european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
  ])
  if(rateResult.status==='fulfilled'&&rateResult.value?.rates){
    fx.value=rateResult.value
    setLog('ExchangeRate','online',`${from.value} 汇率表已同步`)
  }else{
    fx.value={rates:{CNY:1,JPY:21.9,EUR:.13,USD:.14,THB:5.1,AUD:.21,GBP:.11}}
    setLog('ExchangeRate','cache','接口波动，展示演示缓存')
  }
  if(airResult.status==='fulfilled'&&airResult.value?.current){
    air.value=airResult.value.current
    setLog('Open-Meteo Air','online',`${city.value} 空气质量已同步`)
  }else{
    air.value={european_aqi:32,pm2_5:12,pm10:24,carbon_monoxide:190,nitrogen_dioxide:18,ozone:66}
    setLog('Open-Meteo Air','cache','接口波动，展示演示缓存')
  }
  updatedAt.value=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
  loading.value=false
}
onMounted(load)
</script>

<template>
  <section class="api-command-center">
    <div class="api-radar">
      <div class="radar-ring r1"></div>
      <div class="radar-ring r2"></div>
      <div class="radar-ring r3"></div>
      <DatabaseZap/>
      <span v-for="n in 7" :key="n" :style="{transform:`rotate(${n*48}deg) translateX(${52+n%2*18}px)`}"></span>
    </div>
    <div class="api-panel">
      <header>
        <div>
          <span><Wifi/>MULTI API COMMAND CENTER</span>
          <h2>实时旅行数据指挥舱</h2>
          <p>把汇率、空气质量、目的地建议聚合到一个面板里，答辩时可以讲“多源 API + 并发请求 + 缓存兜底”。</p>
        </div>
        <button @click="load"><RefreshCw :class="{spin:loading}"/>刷新实时数据</button>
      </header>

      <div class="api-live-grid">
        <article class="fx-card">
          <div class="card-title"><Coins/><span>出境预算换算</span><em>LIVE FX</em></div>
          <div class="fx-row">
            <el-input-number v-model="amount" :min="1" :max="999999" controls-position="right"/>
            <el-select v-model="from" @change="load"><el-option v-for="x in currencyOptions" :key="x" :label="x" :value="x"/></el-select>
            <b>≈</b>
            <strong>{{converted}}</strong>
            <el-select v-model="to"><el-option v-for="x in currencyOptions" :key="x" :label="x" :value="x"/></el-select>
          </div>
          <p>适合讲：游客选择国家后，系统可自动把门票、酒店、餐饮预算换算成当地货币。</p>
        </article>

        <article class="air-card">
          <div class="card-title"><Cloud/><span>目的地空气质量</span><em>OPEN-METEO</em></div>
          <div class="air-main">
            <el-select v-model="city" @change="load"><el-option v-for="x in cities" :key="x.name" :label="x.name" :value="x.name"/></el-select>
            <div class="aqi-orb"><b>{{aqi}}</b><small>EAQI</small></div>
            <div><h3>{{airLevel}}</h3><p>{{currentCity.tip}}</p><small>PM2.5 {{pm25}} μg/m³ · PM10 {{air?.pm10 ?? '--'}} μg/m³</small></div>
          </div>
        </article>
      </div>

      <footer>
        <div class="api-health">
          <ShieldCheck/>
          <span><b>{{health}} / {{apiLog.length}}</b><small>实时接口在线</small></span>
          <em>最后更新 {{updatedAt}}</em>
        </div>
        <div class="api-log">
          <span v-for="item in apiLog" :key="item.name" :class="item.status">
            <Activity/>{{item.name}}：{{item.text}}
          </span>
        </div>
      </footer>
    </div>
  </section>
</template>
