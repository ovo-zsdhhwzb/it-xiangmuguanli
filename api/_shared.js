export const seedUsers=[
  {id:1,account:'admin',password:'123456',name:'超级管理员',role:'admin',level:'系统管理员',phone:'13800000000',status:'正常',locked:true,createdAt:'2026-06-01 09:00:00'},
  {id:2,account:'traveler',password:'123456',name:'林晓雪',role:'visitor',level:'星耀会员',phone:'13900000000',points:8620,trips:12,favorites:8,status:'正常',createdAt:'2026-06-02 10:20:00'}
]

export const seed={
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
export const db=globalThis.__travelSparkDb||(globalThis.__travelSparkDb=clone(seed))

export const publicUser=user=>{
  const {password,...safe}=user
  return safe
}

export const ok=(res,data,status=200)=>res.status(status).json({code:0,message:'ok',data})
export const fail=(res,message='请求失败',status=400)=>res.status(status).json({code:status,message})

export const allow=(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
  if(req.method==='OPTIONS'){
    res.status(204).end()
    return true
  }
  return false
}

export const crud=(name,req,res)=>{
  if(allow(req,res))return
  const list=db[name]
  if(!list)return fail(res,'集合不存在',404)
  if(req.method==='GET'){
    const q=String(req.query.q||'')
    const data=name==='users'?list.map(publicUser):list
    return ok(res,q?data.filter(x=>JSON.stringify(x).includes(q)):data)
  }
  if(req.method==='POST'){
    const item={id:req.body?.id||Date.now(),...(req.body||{}),createdAt:new Date().toLocaleString('zh-CN')}
    list.unshift(item)
    return ok(res,name==='users'?publicUser(item):item,201)
  }
  return fail(res,'方法不支持',405)
}

export const crudById=(name,req,res)=>{
  if(allow(req,res))return
  const list=db[name]
  if(!list)return fail(res,'集合不存在',404)
  const id=req.query.id
  const index=list.findIndex(x=>String(x.id)===String(id))
  if(req.method==='GET'){
    const item=index>=0?list[index]:null
    return ok(res,name==='users'&&item?publicUser(item):item)
  }
  if(index<0)return fail(res,'数据不存在',404)
  if(name==='users'&&list[index].locked)return fail(res,'超级管理员账号受保护，不能修改或删除',403)
  if(req.method==='PUT'){
    list[index]={...list[index],...(req.body||{}),updatedAt:new Date().toLocaleString('zh-CN')}
    return ok(res,name==='users'?publicUser(list[index]):list[index])
  }
  if(req.method==='DELETE'){
    const [removed]=list.splice(index,1)
    return ok(res,name==='users'?publicUser(removed):removed)
  }
  return fail(res,'方法不支持',405)
}
