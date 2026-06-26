const API_BASE=import.meta.env.VITE_API_BASE||(import.meta.env.DEV?'/server-api':'/api')

const request=async(path,options={})=>{
  const response=await fetch(`${API_BASE}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(options.headers||{})}
  })
  const data=await response.json().catch(()=>({code:response.status,message:'接口返回格式错误'}))
  if(!response.ok||data.code)throw new Error(data.message||'请求失败')
  return data.data
}

export const api={
  base:API_BASE,
  login:payload=>request('/auth/login',{method:'POST',body:JSON.stringify(payload)}),
  register:payload=>request('/auth/register',{method:'POST',body:JSON.stringify(payload)}),
  stats:()=>request('/stats'),
  list:(name,q='')=>request(`/${name}${q?`?q=${encodeURIComponent(q)}`:''}`),
  create:(name,payload)=>request(`/${name}`,{method:'POST',body:JSON.stringify(payload)}),
  update:(name,id,payload)=>request(`/${name}/${id}`,{method:'PUT',body:JSON.stringify(payload)}),
  remove:(name,id)=>request(`/${name}/${id}`,{method:'DELETE'})
}
