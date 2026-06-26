const seedUsers=[
  {id:1,account:'admin',password:'123456',name:'超级管理员',role:'admin',level:'系统管理员',phone:'13800000000',status:'正常',locked:true,createdAt:'2026-06-01 09:00:00'},
  {id:2,account:'traveler',password:'123456',name:'林晓雪',role:'visitor',level:'星耀会员',phone:'13900000000',points:8620,trips:12,favorites:8,status:'正常',createdAt:'2026-06-02 10:20:00'}
]

const seed={
  users:seedUsers,
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
  trips:[],
  profiles:[],
  apiLogs:[]
}

const clone=value=>JSON.parse(JSON.stringify(value))
const db=globalThis.__travelSparkDb||(globalThis.__travelSparkDb=clone(seed))
const publicUser=user=>{
  const {password,...safe}=user
  return safe
}
const ok=(res,data,status=200)=>res.status(status).json({code:0,message:'ok',data})
const fail=(res,message='请求失败',status=400)=>res.status(status).json({code:status,message})
const partsFrom=req=>{
  const path=req.query.path
  return Array.isArray(path)?path:[path].filter(Boolean)
}

export default function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
  if(req.method==='OPTIONS')return res.status(204).end()

  const parts=partsFrom(req)
  const [first,second]=parts

  if(first==='health')return ok(res,{status:'online',runtime:'vercel-serverless',time:new Date().toISOString(),collections:Object.keys(db)})

  if(first==='auth'&&second==='login'&&req.method==='POST'){
    const body=req.body||{}
    const user=db.users.find(x=>x.account===body.account&&x.password===body.password)
    if(!user)return fail(res,'账号或密码错误',401)
    return ok(res,{token:`vercel-token-${Date.now()}`,user:publicUser(user)})
  }

  if(first==='auth'&&second==='register'&&req.method==='POST'){
    const body=req.body||{}
    if(!body.account||!body.password)return fail(res,'账号和密码不能为空')
    if(db.users.some(x=>x.account===body.account))return fail(res,'账号已存在')
    const user={id:Date.now(),account:body.account,password:body.password,name:body.name||body.account,phone:body.phone||'',role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常',createdAt:new Date().toLocaleString('zh-CN')}
    db.users.push(user)
    return ok(res,publicUser(user),201)
  }

  if(first==='stats'&&req.method==='GET'){
    const users=db.users.map(publicUser),destinations=db.destinations,orders=db.orders,trips=db.trips
    return ok(res,{users:users.length,visitors:users.filter(x=>x.role==='visitor').length,destinations:destinations.length,orders:orders.length,trips:trips.length,revenue:orders.reduce((sum,x)=>sum+Number(x.amount||0),0),hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)})
  }

  const collections=['users','destinations','orders','trips','profiles','apiLogs']
  if(collections.includes(first)){
    const id=second
    const list=db[first]
    if(req.method==='GET'){
      const q=String(req.query.q||'')
      const data=first==='users'?list.map(publicUser):list
      if(id)return ok(res,data.find(x=>String(x.id)===String(id))||null)
      return ok(res,q?data.filter(x=>JSON.stringify(x).includes(q)):data)
    }
    if(req.method==='POST'){
      const item={id:req.body?.id||Date.now(),...(req.body||{}),createdAt:new Date().toLocaleString('zh-CN')}
      list.unshift(item)
      return ok(res,first==='users'?publicUser(item):item,201)
    }
    if(req.method==='PUT'&&id){
      const index=list.findIndex(x=>String(x.id)===String(id))
      if(index<0)return fail(res,'数据不存在',404)
      if(first==='users'&&list[index].locked)return fail(res,'超级管理员账号受保护，不能修改',403)
      list[index]={...list[index],...(req.body||{}),updatedAt:new Date().toLocaleString('zh-CN')}
      return ok(res,first==='users'?publicUser(list[index]):list[index])
    }
    if(req.method==='DELETE'&&id){
      const index=list.findIndex(x=>String(x.id)===String(id))
      if(index<0)return fail(res,'数据不存在',404)
      if(first==='users'&&list[index].locked)return fail(res,'超级管理员账号受保护，不能删除',403)
      const [removed]=list.splice(index,1)
      return ok(res,first==='users'?publicUser(removed):removed)
    }
  }

  return fail(res,'接口不存在',404)
}
