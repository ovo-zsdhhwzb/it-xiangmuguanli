const weatherText={0:'晴',1:'晴间多云',2:'多云',3:'阴',45:'雾',48:'雾凇',51:'小毛毛雨',53:'毛毛雨',55:'强毛毛雨',61:'小雨',63:'中雨',65:'大雨',71:'小雪',73:'中雪',75:'大雪',80:'阵雨',81:'强阵雨',82:'暴雨',95:'雷雨',96:'雷雨伴冰雹',99:'强雷暴'}
const windDirection=degree=>['北','东北','东','东南','南','西南','西','西北'][Math.round(degree/45)%8]
const fallback=city=>({city,temperature:26,apparent:28,humidity:72,condition:'晴',wind:'东南风',windSpeed:8,time:'离线数据',live:false})
export async function getCityWeather(city='杭州'){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000)
 try{
  const geo=await fetch(`/api/weather/geo?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`,{signal:controller.signal}).then(r=>r.json())
  if(!geo.results?.length)throw new Error('未找到该城市')
  const place=geo.results[0]
  const url=`/api/weather/current?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
  const response=await fetch(url,{signal:controller.signal});clearTimeout(timer)
  if(!response.ok)throw new Error(`Weather API ${response.status}`)
  const {current}=await response.json()
  return {city:place.name,temperature:current.temperature_2m,apparent:current.apparent_temperature,humidity:current.relative_humidity_2m,condition:weatherText[current.weather_code]||'天气变化',wind:windDirection(current.wind_direction_10m)+'风',windSpeed:current.wind_speed_10m,time:current.time.slice(11),live:true}
 }catch(error){clearTimeout(timer);console.warn('实时天气获取失败，已使用兜底数据',error);return fallback(city)}
}
export const getHangzhouWeather=()=>getCityWeather(localStorage.getItem('weather-city')||'杭州')
