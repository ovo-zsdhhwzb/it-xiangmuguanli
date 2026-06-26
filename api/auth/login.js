import {allow,db,fail,ok,publicUser} from '../_shared.js'

export default function handler(req,res){
  if(allow(req,res))return
  if(req.method!=='POST')return fail(res,'方法不支持',405)
  const body=req.body||{}
  const user=db.users.find(x=>x.account===body.account&&x.password===body.password)
  if(!user)return fail(res,'账号或密码错误',401)
  return ok(res,{token:`vercel-token-${Date.now()}`,user:publicUser(user)})
}
