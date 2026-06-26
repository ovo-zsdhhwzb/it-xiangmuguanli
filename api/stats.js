import {allow,db,ok} from './_shared.js'

export default function handler(req,res){
  if(allow(req,res))return
  const users=db.users,destinations=db.destinations,orders=db.orders,trips=db.trips
  return ok(res,{users:users.length,visitors:users.filter(x=>x.role==='visitor').length,destinations:destinations.length,orders:orders.length,trips:trips.length,revenue:orders.reduce((sum,x)=>sum+Number(x.amount||0),0),hotCity:[...new Set(destinations.map(x=>x.city))].slice(0,6)})
}
