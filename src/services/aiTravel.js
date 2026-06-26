const spots={杭州:['西湖环线漫游','灵隐飞来峰','龙井村采茶','京杭大运河','良渚博物院','西溪湿地','湘湖慢游'],西安:['陕西历史博物馆','大雁塔','大唐不夜城','秦始皇兵马俑','华清宫','西安城墙','回民街'],厦门:['鼓浪屿漫游','环岛路骑行','沙坡尾艺术区','南普陀寺','厦门植物园','集美学村','八市寻味'],丽江:['丽江古城','玉龙雪山','蓝月谷','束河古镇','白沙古镇','拉市海','虎跳峡'],北京:['故宫博物院','天安门广场','颐和园','八达岭长城','天坛公园','什刹海','国家博物馆']}
export function localPlan(city,days){const pool=spots[city]||spots.杭州;return Array.from({length:days},(_,i)=>({day:i+1,title:`${pool[i%pool.length]} · 城市深度体验`,items:[{time:'09:00',name:pool[i%pool.length],detail:'深度游览与专业讲解',type:'sight'},{time:'12:00',name:'当地特色午餐',detail:'精选高评分本地风味',type:'food'},{time:'14:30',name:pool[(i+1)%pool.length],detail:'轻松漫游与自由拍照',type:'photo'},{time:'19:00',name:i%2?'城市夜景漫步':'特色夜游体验',detail:'感受城市入夜后的烟火气',type:'night'}]}))}
export async function generateAITravel({city,days,people,budget,prefs}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000)
 const prompt=`为${people}人制定中国${city}${days}日旅游行程，预算偏好${budget}，兴趣${prefs.join('、')}。必须恰好返回${days}天，每天4个项目。只返回JSON，结构：{"title":"行程名","summary":"一句话摘要","estimatedCost":数字,"days":[{"day":1,"title":"当日主题","items":[{"time":"09:00","name":"地点或活动","detail":"简短说明","type":"sight|food|photo|night|transport"}]}]}。不要Markdown。`
 try{
  const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({model:'openai',messages:[{role:'system',content:'你是专业中国旅行规划师，严格输出合法JSON。'},{role:'user',content:prompt}],temperature:.5,max_tokens:2600})})
  clearTimeout(timer);if(!response.ok)throw new Error(`AI API ${response.status}`)
  const data=await response.json();let text=data.choices?.[0]?.message?.content||'';text=text.replace(/^```json\s*|\s*```$/g,'').trim();const parsed=JSON.parse(text)
  if(!Array.isArray(parsed.days)||parsed.days.length!==days)throw new Error('AI 返回天数不匹配')
  return {...parsed,source:'Pollinations AI'}
 }catch(error){clearTimeout(timer);console.warn('免费 AI 暂不可用，使用本地行程引擎',error);return {title:`${city}${days}日智能漫游`,summary:'依据兴趣、距离与游玩节奏生成',estimatedCost:days*680*people,days:localPlan(city,days),source:'本地智能引擎'}}
}
