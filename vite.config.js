import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ base:'./', plugins:[vue()], build:{target:'es2015',cssTarget:'chrome61'}, server:{ host:'0.0.0.0', port:5173, proxy:{
  '/server-api':{target:'http://127.0.0.1:3001',changeOrigin:true,rewrite:path=>path.replace(/^\/server-api/,'/api')},
  '/api/ai':{target:'https://text.pollinations.ai',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/ai/,'/openai')},
  '/api/weather/geo':{target:'https://geocoding-api.open-meteo.com',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/weather\/geo/,'/v1/search')},
  '/api/weather/current':{target:'https://api.open-meteo.com',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/weather\/current/,'/v1/forecast')}
  ,'/api/cat':{target:'https://cataas.com',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/cat/,'/cat')}
  ,'/api/dog':{target:'https://dog.ceo',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/dog/,'/api/breeds/image/random')}
  ,'/api/countriesnow':{target:'https://countriesnow.space',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/countriesnow/,'/api/v0.1/countries')}
  ,'/api/wiki':{target:'https://zh.wikipedia.org',changeOrigin:true,headers:{'User-Agent':'TravelSparkCourseProject/1.0'},rewrite:path=>path.replace(/^\/api\/wiki/,'/w/api.php')}
  ,'/api/sun':{target:'https://api.sunrise-sunset.org',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/sun/,'/json')}
  ,'/api/exchange':{target:'https://open.er-api.com',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/exchange/,'/v6/latest')}
  ,'/api/air':{target:'https://air-quality-api.open-meteo.com',changeOrigin:true,rewrite:path=>path.replace(/^\/api\/air/,'/v1/air-quality')}
} } })
