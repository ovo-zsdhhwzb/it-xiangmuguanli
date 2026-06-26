import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Destinations from '../views/Destinations.vue'
import Planner from '../views/Planner.vue'
import Orders from '../views/Orders.vue'
import Operations from '../views/Operations.vue'
import Analytics from '../views/Analytics.vue'
import Visitor from '../views/Visitor.vue'
import Register from '../views/Register.vue'
const routes=[
 {path:'/login',component:Login},
 {path:'/register',component:Register},
 {path:'/portal',component:Visitor},
 {path:'/',component:Layout,children:[
  {path:'',component:Dashboard,meta:{title:'智慧总览',eyebrow:'SMART OVERVIEW'}},
  {path:'destinations',component:Destinations,meta:{title:'目的地资源',eyebrow:'DESTINATIONS'}},
  {path:'planner',component:Planner,meta:{title:'AI 智能行程',eyebrow:'AI TRIP PLANNER'}},
  {path:'orders',component:Orders,meta:{title:'订单中心',eyebrow:'ORDER CENTER'}},
  {path:'operations',component:Operations,meta:{title:'运营管理',eyebrow:'OPERATIONS'}},
  {path:'analytics',component:Analytics,meta:{title:'数据洞察',eyebrow:'DATA INSIGHTS'}}
 ]}
]
const router=createRouter({history:createWebHashHistory(),routes})
router.beforeEach(to=>{if(!['/login','/register'].includes(to.path)&&!localStorage.getItem('travel-token')) return '/login';if(to.path==='/'&&localStorage.getItem('travel-role')==='visitor')return '/portal'})
export default router
