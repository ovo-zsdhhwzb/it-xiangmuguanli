import {allow,db,ok} from './_shared.js'

export default function handler(req,res){
  if(allow(req,res))return
  return ok(res,{status:'online',runtime:'vercel-serverless',time:new Date().toISOString(),collections:Object.keys(db)})
}
