const SUPABASE_URL=import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY=import.meta.env.VITE_SUPABASE_ANON_KEY||import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const USE_SUPABASE=Boolean(SUPABASE_URL&&SUPABASE_KEY)

const demoUsers=[
  {id:1,account:'admin',password:'123456',name:'超级管理员',role:'admin',level:'系统管理员',phone:'13800000000',status:'正常',locked:true},
  {id:2,account:'traveler',password:'123456',name:'林晓雪',role:'visitor',level:'星耀会员',phone:'13900000000',points:8620,trips:12,favorites:8,status:'正常'}
]

const demoData={
  destinations:[
    {id:1,name:'西湖风景名胜区',city:'杭州',category:'自然风光',heat:98,score:4.9,price:0,status:'开放',tag:'人气必打卡',color:'#2dd4bf',desc:'一湖映双塔，山水与人文交织的江南名片。'},
    {id:2,name:'故宫博物院',city:'北京',category:'历史人文',heat:96,score:4.9,price:60,status:'限流',tag:'文化地标',color:'#fb7185',desc:'穿越六百年紫禁城，读懂中国古代建筑之美。'},
    {id:3,name:'玉龙雪山',city:'丽江',category:'户外探险',heat:93,score:4.8,price:100,status:'开放',tag:'季节限定',color:'#60a5fa',desc:'直抵雪线之上，感受高原雪山的纯净与辽阔。'},
    {id:4,name:'鼓浪屿',city:'厦门',category:'海岛度假',heat:91,score:4.8,price:35,status:'开放',tag:'文艺漫游',color:'#a78bfa',desc:'琴声、老别墅与海风，构成一座没有车马的小岛。'}
  ],
  orders:[
    {id:20260622001,orderNo:'YJ20260622001',user:'林晓雪',product:'杭州·西湖宋韵三日游',destination:'西湖风景名胜区',city:'杭州',amount:2399,status:'待确认',people:2,time:'06-22 12:00'},
    {id:20260622002,orderNo:'YJ20260622002',user:'陈一川',product:'北京·故宫深度讲解',destination:'故宫博物院',city:'北京',amount:560,status:'已完成',people:3,time:'06-18 09:30'}
  ],
  users:demoUsers.map(({password,...user})=>user),
  trips:[],
  profiles:[],
  apiLogs:[]
}

const tableMap={users:'users',destinations:'destinations',orders:'orders',trips:'trips',profiles:'profiles',apiLogs:'apiLogs'}
const clone=value=>JSON.parse(JSON.stringify(value))
const readLocal=name=>JSON.parse(localStorage.getItem(`travel-cloud-${name}`)||'null')||clone(demoData[name]||[])
const writeLocal=(name,data)=>localStorage.setItem(`travel-cloud-${name}`,JSON.stringify(data))
const toDestination=row=>({...row,desc:row.description??row.desc??''})
const fromDestination=item=>{const {desc,...rest}=item;return {...rest,description:item.description??desc??''}}
const toOrder=row=>({...row,orderNo:row.order_no??row.orderNo,user:row.user_name??row.user})
const fromOrder=item=>{const {orderNo,user,...rest}=item;return {...rest,order_no:item.order_no??orderNo,user_name:item.user_name??user}}
const normalizeIn=(name,item)=>name==='destinations'?fromDestination(item):name==='orders'?fromOrder(item):item
const normalizeOut=(name,item)=>name==='destinations'?toDestination(item):name==='orders'?toOrder(item):item
const publicUser=user=>{const {password,...safe}=user;return safe}

async function supabaseFetch(path,options={}){
  const response=await fetch(`${SUPABASE_URL}/rest/v1${path}`,{
    ...options,
    headers:{
      apikey:SUPABASE_KEY,
      Authorization:`Bearer ${SUPABASE_KEY}`,
      'Content-Type':'application/json',
      Prefer:'return=representation',
      ...(options.headers||{})
    }
  })
  if(!response.ok)throw new Error(await response.text())
  if(response.status===204)return null
  return response.json()
}

const cloud={
  async login(payload){
    const rows=await supabaseFetch(`/users?account=eq.${encodeURIComponent(payload.account)}&password=eq.${encodeURIComponent(payload.password)}&limit=1`)
    const user=rows?.[0]
    if(!user)throw new Error('账号或密码错误')
    return {token:`supabase-token-${Date.now()}`,user:publicUser(user)}
  },
  async register(payload){
    const user={id:Date.now(),account:payload.account,password:payload.password,name:payload.name||payload.account,phone:payload.phone||'',role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常',locked:false}
    const rows=await supabaseFetch('/users',{method:'POST',body:JSON.stringify(user)})
    return publicUser(rows[0])
  },
  async list(name,q=''){
    const table=tableMap[name]
    let rows=await supabaseFetch(`/${table}?select=*`)
    rows=(rows||[]).map(x=>normalizeOut(name,x))
    return q?rows.filter(x=>JSON.stringify(x).includes(q)):rows
  },
  async create(name,payload){
    const table=tableMap[name],body=normalizeIn(name,{id:payload.id||Date.now(),...payload})
    const rows=await supabaseFetch(`/${table}`,{method:'POST',body:JSON.stringify(body)})
    return normalizeOut(name,rows[0])
  },
  async update(name,id,payload){
    const table=tableMap[name],body=normalizeIn(name,payload)
    const rows=await supabaseFetch(`/${table}?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(body)})
    return normalizeOut(name,rows[0])
  },
  async remove(name,id){
    const table=tableMap[name]
    const rows=await supabaseFetch(`/${table}?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'})
    return rows?.[0]||{id}
  },
  async stats(){
    const [users,destinations,orders,trips]=await Promise.all([this.list('users'),this.list('destinations'),this.list('orders'),this.list('trips')])
    return {users:users.length,visitors:users.filter(x=>x.role==='visitor').length,destinations:destinations.length,orders:orders.length,trips:trips.length,revenue:orders.reduce((s,x)=>s+Number(x.amount||0),0),hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)}
  }
}

const fallback={
  login(payload){
    const localUsers=JSON.parse(localStorage.getItem('travel-cloud-users-with-password')||'null')||clone(demoUsers)
    const user=localUsers.find(x=>x.account===payload.account&&x.password===payload.password)
    if(!user)throw new Error('账号或密码错误')
    return {token:`fallback-token-${Date.now()}`,user:publicUser(user)}
  },
  register(payload){
    const localUsers=JSON.parse(localStorage.getItem('travel-cloud-users-with-password')||'null')||clone(demoUsers)
    if(localUsers.some(x=>x.account===payload.account))throw new Error('账号已存在')
    const user={id:Date.now(),account:payload.account,password:payload.password,name:payload.name||payload.account,phone:payload.phone||'',role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常'}
    localUsers.push(user)
    localStorage.setItem('travel-cloud-users-with-password',JSON.stringify(localUsers))
    writeLocal('users',localUsers.map(publicUser))
    return publicUser(user)
  },
  list(name,q=''){const data=readLocal(name);return q?data.filter(x=>JSON.stringify(x).includes(q)):data},
  create(name,payload){const data=readLocal(name),item={id:payload.id||Date.now(),...payload};data.unshift(item);writeLocal(name,data);return item},
  update(name,id,payload){const data=readLocal(name),i=data.findIndex(x=>String(x.id)===String(id));if(i<0)throw new Error('数据不存在');data[i]={...data[i],...payload};writeLocal(name,data);return data[i]},
  remove(name,id){const data=readLocal(name),i=data.findIndex(x=>String(x.id)===String(id));if(i<0)throw new Error('数据不存在');const removed=data.splice(i,1)[0];writeLocal(name,data);return removed},
  stats(){const users=readLocal('users'),destinations=readLocal('destinations'),orders=readLocal('orders'),trips=readLocal('trips');return {users:users.length,visitors:users.filter(x=>x.role==='visitor').length,destinations:destinations.length,orders:orders.length,trips:trips.length,revenue:orders.reduce((s,x)=>s+Number(x.amount||0),0),hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)}}
}

const safe=async(remote,local)=>{
  if(!USE_SUPABASE)return local()
  try{return await remote()}catch(error){
    console.warn('[Supabase fallback]',error.message)
    return local()
  }
}

export const api={
  base:USE_SUPABASE?SUPABASE_URL:'local-demo',
  login:payload=>safe(()=>cloud.login(payload),()=>fallback.login(payload)),
  register:payload=>safe(()=>cloud.register(payload),()=>fallback.register(payload)),
  stats:()=>safe(()=>cloud.stats(),()=>fallback.stats()),
  list:(name,q='')=>safe(()=>cloud.list(name,q),()=>fallback.list(name,q)),
  create:(name,payload)=>safe(()=>cloud.create(name,payload),()=>fallback.create(name,payload)),
  update:(name,id,payload)=>safe(()=>cloud.update(name,id,payload),()=>fallback.update(name,id,payload)),
  remove:(name,id)=>safe(()=>cloud.remove(name,id),()=>fallback.remove(name,id))
}
