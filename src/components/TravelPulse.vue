<script setup>
import {ref,onMounted,onBeforeUnmount} from 'vue'
import {Radio,Maximize2,Activity,Navigation,Users,Wifi} from 'lucide-vue-next'
const canvas=ref(),wrap=ref(),online=ref(12864),flow=ref(368),fps=ref(60),fullscreen=ref(false)
let ctx,raf,observer,last=0,frames=0,fpsTimer,statTimer,mouse={x:0,y:0}
const cities=[
 {name:'北京',x:.63,y:.25,v:96,c:'#71a7ff'},{name:'西安',x:.48,y:.48,v:91,c:'#a78bfa'},
 {name:'上海',x:.72,y:.52,v:94,c:'#38d6bd'},{name:'杭州',x:.68,y:.60,v:98,c:'#38d6bd'},
 {name:'成都',x:.38,y:.62,v:88,c:'#f7b955'},{name:'丽江',x:.34,y:.75,v:84,c:'#fb7185'},
 {name:'厦门',x:.64,y:.79,v:87,c:'#55b7f3'},{name:'广州',x:.54,y:.85,v:90,c:'#35d399'}
]
const routes=[[0,2],[1,3],[4,3],[5,7],[6,2],[7,3],[0,1],[4,6],[2,7],[1,6]]
const particles=Array.from({length:34},(_,i)=>({route:i%routes.length,t:Math.random(),speed:.0015+Math.random()*.0025,size:1.2+Math.random()*1.8}))
const size=()=>{const r=wrap.value.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.value.width=r.width*d;canvas.value.height=r.height*d;canvas.value.style.width=r.width+'px';canvas.value.style.height=r.height+'px';ctx=canvas.value.getContext('2d');ctx.setTransform(d,0,0,d,0,0)}
const curve=(a,b,t,w,h)=>{const x1=a.x*w,y1=a.y*h,x2=b.x*w,y2=b.y*h,cx=(x1+x2)/2,cy=Math.min(y1,y2)-Math.abs(x2-x1)*.18-25;const u=1-t;return{x:u*u*x1+2*u*t*cx+t*t*x2,y:u*u*y1+2*u*t*cy+t*t*y2,cx,cy,x1,y1,x2,y2}}
const draw=now=>{const w=wrap.value.clientWidth,h=wrap.value.clientHeight;ctx.clearRect(0,0,w,h);const shiftX=(mouse.x-.5)*8,shiftY=(mouse.y-.5)*6
 const bg=ctx.createRadialGradient(w*.57,h*.55,20,w*.57,h*.55,w*.7);bg.addColorStop(0,'#153f4e');bg.addColorStop(.48,'#0c293b');bg.addColorStop(1,'#071a2d');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h)
 ctx.save();ctx.translate(shiftX,shiftY);ctx.strokeStyle='rgba(93,183,195,.08)';ctx.lineWidth=1;for(let x=0;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 ctx.fillStyle='rgba(47,139,135,.08)';ctx.beginPath();ctx.moveTo(w*.27,h*.3);ctx.bezierCurveTo(w*.38,h*.13,w*.62,h*.12,w*.76,h*.3);ctx.bezierCurveTo(w*.87,h*.46,w*.72,h*.62,w*.7,h*.79);ctx.bezierCurveTo(w*.57,h*.98,w*.43,h*.86,w*.3,h*.76);ctx.bezierCurveTo(w*.17,h*.62,w*.22,h*.45,w*.27,h*.3);ctx.fill();ctx.strokeStyle='rgba(84,215,194,.18)';ctx.stroke()
 routes.forEach(([ai,bi])=>{const a=cities[ai],b=cities[bi],p=curve(a,b,.5,w,h);ctx.beginPath();ctx.moveTo(p.x1,p.y1);ctx.quadraticCurveTo(p.cx,p.cy,p.x2,p.y2);ctx.strokeStyle='rgba(74,203,193,.16)';ctx.lineWidth=1;ctx.stroke()})
 particles.forEach(p=>{p.t+=p.speed;if(p.t>1)p.t=0;const [ai,bi]=routes[p.route],pos=curve(cities[ai],cities[bi],p.t,w,h);const g=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,8);g.addColorStop(0,'rgba(89,245,218,1)');g.addColorStop(.25,'rgba(89,245,218,.55)');g.addColorStop(1,'rgba(89,245,218,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(pos.x,pos.y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b9fff2';ctx.beginPath();ctx.arc(pos.x,pos.y,p.size,0,Math.PI*2);ctx.fill()})
 cities.forEach((c,i)=>{const x=c.x*w,y=c.y*h,pulse=8+Math.sin(now*.003+i)*3;ctx.strokeStyle=c.c+'55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle=c.c;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();ctx.shadowColor=c.c;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#d8f7f2';ctx.font='10px Inter, sans-serif';ctx.fillText(c.name,x+9,y-5);ctx.fillStyle='rgba(173,215,214,.55)';ctx.font='8px Inter, sans-serif';ctx.fillText(c.v+'%',x+9,y+7)})
 ctx.restore();frames++;if(now-last>1000){fps.value=frames;frames=0;last=now}raf=requestAnimationFrame(draw)}
const move=e=>{const r=wrap.value.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width;mouse.y=(e.clientY-r.top)/r.height}
const toggleFull=async()=>{if(!document.fullscreenElement){await wrap.value.requestFullscreen();fullscreen.value=true}else{await document.exitFullscreen();fullscreen.value=false};setTimeout(size,100)}
onMounted(()=>{size();observer=new ResizeObserver(size);observer.observe(wrap.value);raf=requestAnimationFrame(draw);statTimer=setInterval(()=>{online.value+=Math.floor(Math.random()*19-5);flow.value+=Math.floor(Math.random()*7-3)},1200)})
onBeforeUnmount(()=>{cancelAnimationFrame(raf);observer?.disconnect();clearInterval(statTimer);clearInterval(fpsTimer)})
</script>
<template><section ref="wrap" class="travel-pulse" @mousemove="move"><canvas ref="canvas"></canvas><div class="pulse-head"><div><span><Radio/>DIGITAL TWIN · LIVE</span><h3>全国游客流向数字孪生</h3><p>城市热度、游客迁徙与目的地承载能力实时态势</p></div><button @click="toggleFull"><Maximize2/>{{fullscreen?'退出全屏':'全屏态势'}}</button></div><div class="pulse-stats"><div><Users/><span><small>实时在线游客</small><b>{{online.toLocaleString()}}</b></span></div><div><Navigation/><span><small>当前行程流</small><b>{{flow}}</b></span></div><div><Activity/><span><small>热点城市</small><b>8</b></span></div></div><div class="pulse-system"><span><i></i>数据链路正常</span><span><Wifi/>API 42ms</span><span>CANVAS {{fps}} FPS</span></div><div class="pulse-radar"><i></i><i></i><i></i></div></section></template>
