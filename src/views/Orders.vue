<script setup>
import {ref,computed,watch,onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {Search,Download,Plus,Eye,Check,RotateCcw,TicketCheck,Clock3,CircleDollarSign,CheckCircle2,Trash2,Pencil} from 'lucide-vue-next'
import {ElMessage,ElMessageBox} from 'element-plus'
import {api} from '../services/api'

const route=useRoute()
const orders=ref([])
const q=ref('')
const status=ref('全部')
const detail=ref(null)
const editor=ref(false)
const form=ref({})
const loading=ref(false)
const tabs=['全部','待确认','已支付','进行中','已完成','已退款']
const shown=computed(()=>orders.value.filter(x=>(status.value==='全部'||x.status===status.value)&&(`${x.orderNo||x.id}${x.user}${x.product||x.destination}${x.city||''}`.includes(q.value))))
const revenue=computed(()=>orders.value.reduce((sum,x)=>sum+Number(x.amount||0),0))

const normalize=o=>({...o,id:o.id||Date.now(),orderNo:o.orderNo||o.id,product:o.product||o.destination||'智慧旅行产品',time:o.time||o.date||new Date().toLocaleString('zh-CN')})
const load=async()=>{loading.value=true;try{orders.value=(await api.list('orders')).map(normalize)}catch(e){ElMessage.error(e.message||'订单加载失败')}finally{loading.value=false}}
const confirm=async o=>{await api.update('orders',o.id,{status:'已支付'});await load();ElMessage.success(`订单 ${o.orderNo||o.id} 已确认`)}
const refund=async o=>{await api.update('orders',o.id,{status:'已退款'});await load();ElMessage.success('退款流程已发起')}
const edit=o=>{form.value=o?{...o}:{orderNo:'YJ'+Date.now(),user:'',product:'',destination:'',city:'',amount:0,time:new Date().toLocaleString('zh-CN'),status:'待确认',people:1};editor.value=true}
const save=async()=>{
  if(!form.value.user||!(form.value.product||form.value.destination))return ElMessage.warning('请填写游客和产品')
  const payload={...form.value,destination:form.value.destination||form.value.product,product:form.value.product||form.value.destination}
  try{payload.id?await api.update('orders',payload.id,payload):await api.create('orders',payload);editor.value=false;await load();ElMessage.success('订单已保存到后端')}catch(e){ElMessage.error(e.message||'保存失败')}
}
const remove=async o=>{await ElMessageBox.confirm(`确认删除订单 ${o.orderNo||o.id}？`,'删除订单');await api.remove('orders',o.id);await load();ElMessage.success('订单已从后端删除')}
watch(()=>route.query.q,v=>{if(v)q.value=String(v)},{immediate:true})
onMounted(load)
</script>

<template>
  <div>
    <div class="order-kpis">
      <div class="card"><span><TicketCheck/></span><p>后端订单</p><h3>{{orders.length}}</h3><small>实时读取 Node API</small></div>
      <div class="card"><span><CircleDollarSign/></span><p>累计成交</p><h3>¥ {{revenue.toLocaleString()}}</h3><small>由后端订单统计</small></div>
      <div class="card"><span><Clock3/></span><p>待处理</p><h3>{{orders.filter(x=>x.status==='待确认').length}}</h3><small>点击确认可写回后端</small></div>
      <div class="card"><span><CheckCircle2/></span><p>核销率</p><h3>92.6%</h3><small>演示运营指标</small></div>
    </div>
    <div class="card table-card">
      <div class="table-toolbar">
        <div class="status-tabs"><button v-for="t in tabs" :key="t" :class="{active:status===t}" @click="status=t">{{t}}<i v-if="t==='待确认'">{{orders.filter(x=>x.status===t).length}}</i></button></div>
        <div><label class="search-box"><Search/><input v-model="q" placeholder="订单号 / 游客 / 产品"/></label><button class="outline-btn" @click="load"><Download/>{{loading?'同步中':'刷新'}}</button><button class="primary-btn compact" @click="edit()"><Plus/>新增订单</button></div>
      </div>
      <table class="data-table">
        <thead><tr><th>订单编号</th><th>游客</th><th>预订产品</th><th>下单时间</th><th>实付金额</th><th>订单状态</th><th>操作</th></tr></thead>
        <tbody><tr v-for="o in shown" :key="o.id"><td><b>{{o.orderNo||o.id}}</b></td><td><div class="avatar-name"><span>{{o.user?.[0]}}</span>{{o.user}}</div></td><td>{{o.product||o.destination}}</td><td>{{o.time}}</td><td><b>¥ {{Number(o.amount).toLocaleString()}}</b></td><td><span :class="['status',o.status]">{{o.status}}</span></td><td><button class="row-btn" @click="detail=o" title="查看"><Eye/></button><button class="row-btn" @click="edit(o)" title="编辑"><Pencil/></button><button v-if="o.status==='待确认'" class="row-btn approve" @click="confirm(o)" title="确认"><Check/></button><button v-if="o.status==='已支付'" class="row-btn" @click="refund(o)" title="退款"><RotateCcw/></button><button class="row-btn danger" @click="remove(o)" title="删除"><Trash2/></button></td></tr></tbody>
      </table>
      <div class="pagination"><span>共 {{shown.length}} 条记录</span><el-pagination layout="prev, pager, next" :total="shown.length" :page-size="6"/></div>
    </div>
    <el-drawer v-model="detail" title="订单详情" size="440px"><div v-if="detail" class="order-detail"><span :class="['status',detail.status]">{{detail.status}}</span><h2>{{detail.product||detail.destination}}</h2><p>{{detail.orderNo||detail.id}}</p><div><span>游客姓名<b>{{detail.user}}</b></span><span>下单时间<b>{{detail.time}}</b></span><span>订单金额<b>¥ {{detail.amount}}</b></span><span>支付方式<b>微信支付</b></span></div><div class="qr-demo">▦<small>核销凭证</small></div></div></el-drawer>
    <el-dialog v-model="editor" :title="form.id?'编辑订单':'新增订单'" width="520px">
      <el-form label-position="top"><div class="form-two"><el-form-item label="游客姓名"><el-input v-model="form.user"/></el-form-item><el-form-item label="订单状态"><el-select v-model="form.status"><el-option v-for="t in tabs.slice(1)" :key="t" :label="t" :value="t"/></el-select></el-form-item></div><el-form-item label="旅行产品"><el-input v-model="form.product"/></el-form-item><div class="form-two"><el-form-item label="实付金额"><el-input-number v-model="form.amount" :min="0"/></el-form-item><el-form-item label="下单时间"><el-input v-model="form.time"/></el-form-item></div></el-form>
      <template #footer><button class="outline-btn" @click="editor=false">取消</button><button class="primary-btn compact" @click="save">保存到后端</button></template>
    </el-dialog>
  </div>
</template>
