import {allow,db,fail,ok,publicUser} from '../_shared.js'

export default function handler(req,res){
  if(allow(req,res))return
  if(req.method!=='POST')return fail(res,'方法不支持',405)
  const body=req.body||{}
  if(!body.account||!body.password)return fail(res,'账号和密码不能为空')
  if(db.users.some(x=>x.account===body.account))return fail(res,'账号已存在')
  const user={id:Date.now(),account:body.account,password:body.password,name:body.name||body.account,phone:body.phone||'',role:'visitor',level:'普通游客',points:0,trips:0,favorites:0,status:'正常',createdAt:new Date().toLocaleString('zh-CN')}
  db.users.push(user)
  return ok(res,publicUser(user),201)
}
