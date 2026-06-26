import http from 'node:http'
import {existsSync,mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs'
import {join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname=dirname(fileURLToPath(import.meta.url))
const DATA_DIR=join(__dirname,'data')
const WEB_DIR=join(__dirname,'..','dist')
const PORT=process.env.PORT||3001

const seed={
  users:[
    {id:1,account:'admin',password:'123456',name:'超级管理员',role:'admin',level:'系统管理员',phone:'13800000000',status:'正常',locked:true,createdAt:'2026-06-01 09:00:00'},
    {id:2,account:'traveler',password:'123456',name:'林晓雪',role:'visitor',level:'星耀会员',phone:'13900000000',points:8620,trips:12,favorites:8,status:'正常',createdAt:'2026-06-02 10:20:00'}
  ],
  destinations:[
    {id:1,name:'西湖风景名胜区',city:'杭州',category:'自然风光',heat:98,score:4.9,price:0,status:'开放',tag:'人气必打卡',color:'#2dd4bf',desc:'一湖映双塔，山水与人文交织的江南名片。'},
    {id:2,name:'故宫博物院',city:'北京',category:'历史人文',heat:96,score:4.9,price:60,status:'限流',tag:'文化地标',color:'#fb7185',desc:'穿越六百年紫禁城，读懂中国古代建筑之美。'},
    {id:3,name:'玉龙雪山',city:'丽江',category:'户外探险',heat:93,score:4.8,price:100,status:'开放',tag:'季节限定',color:'#60a5fa',desc:'直抵雪线之上，感受高原雪山的纯净与辽阔。'},
    {id:4,name:'鼓浪屿',city:'厦门',category:'海岛度假',heat:91,score:4.8,price:35,status:'开放',tag:'文艺漫游',color:'#a78bfa',desc:'琴声、老别墅与海风，构成一座没有车马的小岛。'}
  ],
  orders:[
    {id:20260622001,orderNo:'YJ20260622001',user:'林晓雪',destination:'西湖风景名胜区',city:'杭州',amount:2399,status:'待出行',people:2,date:'2026-07-12'},
    {id:20260622002,orderNo:'YJ20260622002',user:'陈一川',destination:'故宫博物院',city:'北京',amount:560,status:'已完成',people:3,date:'2026-06-18'}
  ],
  trips:[],
  profiles:[],
  apiLogs:[],
  settings:{siteName:'云迹 · 智慧旅游推荐系统',visitorServed:128936,updatedAt:new Date().toISOString()}
}

const ok=(res,data={},status=200)=>send(res,status,{code:0,message:'ok',data})
const fail=(res,message='请求失败',status=400)=>send(res,status,{code:status,message})
const send=(res,status,body)=>{
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type,Authorization'
  })
  res.end(JSON.stringify(body))
}
const parseBody=req=>new Promise(resolve=>{
  let raw=''
  req.on('data',chunk=>raw+=chunk)
  req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch{resolve({})}})
})
const file=name=>join(DATA_DIR,`${name}.json`)
const ensure=()=>{
  if(!existsSync(DATA_DIR))mkdirSync(DATA_DIR,{recursive:true})
  Object.entries(seed).forEach(([name,value])=>{
    if(!existsSync(file(name)))writeFileSync(file(name),JSON.stringify(value,null,2),'utf-8')
  })
}
const read=name=>JSON.parse(readFileSync(file(name),'utf-8'))
const write=(name,data)=>writeFileSync(file(name),JSON.stringify(data,null,2),'utf-8')
const listNames=['users','destinations','orders','trips','profiles','apiLogs']
const routeParts=url=>new URL(url,`http://localhost:${PORT}`).pathname.split('/').filter(Boolean)
const mime={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.ico':'image/x-icon'
}
const extname=path=>path.includes('.')?path.slice(path.lastIndexOf('.')):''
const serveStatic=(res,pathname)=>{
  if(!existsSync(WEB_DIR))return false
  const clean=decodeURIComponent(pathname).replace(/^\/+/,'')
  let target=join(WEB_DIR,clean||'index.html')
  if(!target.startsWith(WEB_DIR))return false
  if(!existsSync(target)||statSync(target).isDirectory())target=join(WEB_DIR,'index.html')
  if(!existsSync(target))return false
  res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream'})
  res.end(readFileSync(target))
  return true
}

ensure()

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS')return send(res,204,{})
  const url=new URL(req.url,`http://localhost:${PORT}`)
  const parts=routeParts(req.url)

  if(!url.pathname.startsWith('/api'))return serveStatic(res,url.pathname)||fail(res,'前端资源不存在',404)
  if(url.pathname==='/api')return ok(res,{name:'TravelSpark API',version:'1.0.0',docs:'/api/health'})
  if(url.pathname==='/api/health')return ok(res,{status:'online',time:new Date().toISOString(),storage:'json-file',collections:listNames})

  if(url.pathname==='/api/auth/login'&&req.method==='POST'){
    const body=await parseBody(req)
    const user=read('users').find(x=>x.account===body.account&&x.password===body.password)
    if(!user)return fail(res,'账号或密码错误',401)
    const {password,...safe}=user
    return ok(res,{token:`server-token-${Date.now()}`,user:safe})
  }

  if(url.pathname==='/api/auth/register'&&req.method==='POST'){
    const body=await parseBody(req)
    const users=read('users')
    if(!body.account||!body.password)return fail(res,'账号和密码不能为空')
    if(users.some(x=>x.account===body.account))return fail(res,'账号已存在')
    const user={id:Date.now(),account:body.account,password:body.password,name:body.name||body.account,role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常',createdAt:new Date().toLocaleString('zh-CN')}
    users.push(user);write('users',users)
    const {password,...safe}=user
    return ok(res,safe)
  }

  if(url.pathname==='/api/stats'&&req.method==='GET'){
    const users=read('users'),destinations=read('destinations'),orders=read('orders'),trips=read('trips')
    return ok(res,{
      users:users.length,
      visitors:users.filter(x=>x.role==='visitor').length,
      destinations:destinations.length,
      orders:orders.length,
      trips:trips.length,
      revenue:orders.reduce((sum,x)=>sum+Number(x.amount||0),0),
      hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)
    })
  }

  if(parts[0]==='api'&&listNames.includes(parts[1])){
    const name=parts[1],id=parts[2]
    const data=read(name)
    if(req.method==='GET'){
      const q=(url.searchParams.get('q')||'').toLowerCase()
      const result=id?data.find(x=>String(x.id)===id):q?data.filter(x=>JSON.stringify(x).toLowerCase().includes(q)):data
      return ok(res,result||null)
    }
    if(req.method==='POST'){
      const body=await parseBody(req)
      const item={id:body.id||Date.now(),...body,createdAt:body.createdAt||new Date().toLocaleString('zh-CN')}
      data.unshift(item);write(name,data)
      return ok(res,item,201)
    }
    if(req.method==='PUT'&&id){
      const body=await parseBody(req)
      const index=data.findIndex(x=>String(x.id)===id)
      if(index<0)return fail(res,'数据不存在',404)
      if(name==='users'&&data[index].locked)return fail(res,'超级管理员账号受保护，不能修改',403)
      data[index]={...data[index],...body,updatedAt:new Date().toLocaleString('zh-CN')}
      write(name,data)
      return ok(res,data[index])
    }
    if(req.method==='DELETE'&&id){
      const index=data.findIndex(x=>String(x.id)===id)
      if(index<0)return fail(res,'数据不存在',404)
      if(name==='users'&&data[index].locked)return fail(res,'超级管理员账号受保护，不能删除',403)
      const removed=data.splice(index,1)[0]
      write(name,data)
      return ok(res,removed)
    }
  }

  fail(res,'接口不存在',404)
})

server.listen(PORT,()=>console.log(`TravelSpark API running at http://localhost:${PORT}`))
