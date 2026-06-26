<script setup>
import {ref,computed,onMounted,onBeforeUnmount} from 'vue'
import {useRoute} from 'vue-router'
import {Mic2,X,Play,Pause,Square,Volume2,Sparkles,Headphones,ChevronRight} from 'lucide-vue-next'
import {ElMessage} from 'element-plus'
const route=useRoute(),open=ref(false),speaking=ref(false),paused=ref(false),progress=ref(0),voiceIndex=ref(0),voices=ref([]),current=ref(0)
const sessionAccount=computed(()=>localStorage.getItem('travel-account')||'traveler'),user=()=>localStorage.getItem('travel-user')||'旅行者'
const scripts=computed(()=>{route.fullPath;const plan=JSON.parse(localStorage.getItem(`travel-plan-${sessionAccount.value}`)||'null');return[
 {tag:'欢迎',title:'云迹旅行晨间简报',text:`你好，${user()}。欢迎来到云迹智慧旅行。今天的天气与目的地热度已经更新，建议从旅行灵感中选择一个心动目的地，让我为你规划完整旅程。`},
 {tag:'行程',title:plan?plan.title:'AI 行程规划指南',text:plan?`你的行程${plan.title}已经准备完成。全程预计${plan.total}，交通距离${plan.distance}，包含${plan.steps.length}个环节。第一站是${plan.steps[0]?.title}，${plan.steps[0]?.detail}`:'选择目的地和游玩天数后，系统会综合兴趣、预算、天气和游览节奏，立即生成每日路线。'},
 {tag:'安全',title:'智慧旅行安全提示',text:'出发前请确认身份证件、电子门票和天气变化。景区游览时请遵循预约时段，保持手机电量充足，并留意云迹推送的实时客流提醒。'}]})
const item=computed(()=>scripts.value[current.value])
let utterance,timer
const loadVoices=()=>{voices.value=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().includes('zh'));if(!voices.value.length)voices.value=speechSynthesis.getVoices()}
const speak=()=>{if(!('speechSynthesis'in window))return ElMessage.error('当前浏览器不支持语音合成');speechSynthesis.cancel();utterance=new SpeechSynthesisUtterance(item.value.text);utterance.lang='zh-CN';utterance.rate=.92;utterance.pitch=1.03;if(voices.value[voiceIndex.value])utterance.voice=voices.value[voiceIndex.value];progress.value=0;utterance.onstart=()=>{speaking.value=true;paused.value=false;timer=setInterval(()=>progress.value=Math.min(96,progress.value+1.2),180)};utterance.onend=()=>{speaking.value=false;paused.value=false;progress.value=100;clearInterval(timer)};utterance.onerror=()=>{speaking.value=false;clearInterval(timer)};speechSynthesis.speak(utterance)}
const pause=()=>{if(paused.value){speechSynthesis.resume();paused.value=false}else{speechSynthesis.pause();paused.value=true}}
const stop=()=>{speechSynthesis.cancel();speaking.value=false;paused.value=false;progress.value=0;clearInterval(timer)}
const choose=i=>{current.value=i;if(speaking.value)speak()}
onMounted(()=>{loadVoices();speechSynthesis.onvoiceschanged=loadVoices});onBeforeUnmount(stop)
</script>
<template><div v-if="route.path==='/portal'" class="voice-guide"><transition name="voice-panel"><section v-if="open" class="voice-panel"><header><div><span><Sparkles/>AI VOICE GUIDE</span><h3>云迹语音导游</h3></div><button @click="open=false;stop()"><X/></button></header><div class="voice-visual" :class="{speaking}"><div class="voice-orbit"><i v-for="n in 3"></i><span><Headphones/></span></div><div class="sound-bars"><i v-for="n in 22" :style="{'--n':n}"></i></div><small>{{speaking?(paused?'语音已暂停':'正在实时合成中文导游词'):'准备为你讲解'}}</small></div><div class="voice-caption"><span>{{item.tag}}</span><h4>{{item.title}}</h4><p>{{item.text}}</p><div><i :style="{width:progress+'%'}"></i></div></div><div class="voice-controls"><button v-if="!speaking" class="voice-play" @click="speak"><Play/>开始讲解</button><button v-else class="voice-play" @click="pause"><Play v-if="paused"/><Pause v-else/>{{paused?'继续':'暂停'}}</button><button @click="stop"><Square/>停止</button><el-select v-model="voiceIndex" size="small"><el-option v-for="(v,i) in voices" :label="v.name" :value="i"/></el-select></div><footer><button v-for="(s,i) in scripts" :class="{active:current===i}" @click="choose(i)"><span>{{s.tag}}</span><b>{{s.title}}</b><ChevronRight/></button></footer></section></transition><button class="voice-fab" :class="{active:open,speaking}" @click="open=!open"><div><i v-for="n in 5"></i></div><Mic2/><span>AI 导游</span></button></div></template>
