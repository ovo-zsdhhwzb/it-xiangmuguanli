const API_BASE=import.meta.env.VITE_API_BASE||(import.meta.env.DEV?'/server-api':'/api')

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

const clone=value=>JSON.parse(JSON.stringify(value))
const readLocal=name=>JSON.parse(localStorage.getItem(`travel-cloud-${name}`)||'null')||clone(demoData[name]||[])
const writeLocal=(name,data)=>localStorage.setItem(`travel-cloud-${name}`,JSON.stringify(data))

const fallback={
  login(payload){
    const localUsers=JSON.parse(localStorage.getItem('travel-cloud-users-with-password')||'null')||clone(demoUsers)
    const user=localUsers.find(x=>x.account===payload.account&&x.password===payload.password)
    if(!user)throw new Error('账号或密码错误')
    const {password,...safe}=user
    return {token:`fallback-token-${Date.now()}`,user:safe}
  },
  register(payload){
    const localUsers=JSON.parse(localStorage.getItem('travel-cloud-users-with-password')||'null')||clone(demoUsers)
    if(localUsers.some(x=>x.account===payload.account))throw new Error('账号已存在')
    const user={id:Date.now(),account:payload.account,password:payload.password,name:payload.name||payload.account,phone:payload.phone||'',role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常'}
    localUsers.push(user)
    localStorage.setItem('travel-cloud-users-with-password',JSON.stringify(localUsers))
    writeLocal('users',localUsers.map(({password,...x})=>x))
    const {password,...safe}=user
    return safe
  },
  stats(){
    const users=readLocal('users'),destinations=readLocal('destinations'),orders=readLocal('orders'),trips=readLocal('trips')
    return {users:users.length,visitors:users.filter(x=>x.role==='visitor').length,destinations:destinations.length,orders:orders.length,trips:trips.length,revenue:orders.reduce((s,x)=>s+Number(x.amount||0),0),hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)}
  },
  list(name,q=''){
    const data=readLocal(name)
    return q?data.filter(x=>JSON.stringify(x).includes(q)):data
  },
  create(name,payload){
    const data=readLocal(name)
    const item={id:payload.id||Date.now(),...payload,createdAt:new Date().toLocaleString('zh-CN')}
    data.unshift(item);writeLocal(name,data);return item
  },
  update(name,id,payload){
    const data=readLocal(name)
    const index=data.findIndex(x=>String(x.id)===String(id))
    if(index<0)throw new Error('数据不存在')
    data[index]={...data[index],...payload,updatedAt:new Date().toLocaleString('zh-CN')}
    writeLocal(name,data);return data[index]
  },
  remove(name,id){
    const data=readLocal(name)
    const index=data.findIndex(x=>String(x.id)===String(id))
    if(index<0)throw new Error('数据不存在')
    const removed=data.splice(index,1)[0]
    writeLocal(name,data);return removed
  }
}

const request=async(path,options={})=>{
  const response=await fetch(`${API_BASE}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(options.headers||{})}
  })
  const contentType=response.headers.get('content-type')||''
  if(!contentType.includes('application/json'))throw new Error('云端 API 未启动')
  const data=await response.json()
  if(!response.ok||data.code)throw new Error(data.message||'请求失败')
  return data.data
}

const safe=async(remote,local)=>{
  try{return await remote()}catch(error){
    console.warn('[TravelSpark API fallback]',error.message)
    return local()
  }
}

export const api={
  base:API_BASE,
  login:payload=>safe(()=>request('/auth/login',{method:'POST',body:JSON.stringify(payload)}),()=>fallback.login(payload)),
  register:payload=>safe(()=>request('/auth/register',{method:'POST',body:JSON.stringify(payload)}),()=>fallback.register(payload)),
  stats:()=>safe(()=>request('/stats'),()=>fallback.stats()),
  list:(name,q='')=>safe(()=>request(`/${name}${q?`?q=${encodeURIComponent(q)}`:''}`),()=>fallback.list(name,q)),
  create:(name,payload)=>safe(()=>request(`/${name}`,{method:'POST',body:JSON.stringify(payload)}),()=>fallback.create(name,payload)),
  update:(name,id,payload)=>safe(()=>request(`/${name}/${id}`,{method:'PUT',body:JSON.stringify(payload)}),()=>fallback.update(name,id,payload)),
  remove:(name,id)=>safe(()=>request(`/${name}/${id}`,{method:'DELETE'}),()=>fallback.remove(name,id))
}
