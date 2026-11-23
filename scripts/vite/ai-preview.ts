import {readFileSync} from 'node:fs';
import {fetch as nodeFetch,ProxyAgent} from 'undici';
import type {Plugin} from 'vite';
import {handleChat} from '../../lib/ai-handler';
// The local Node transport follows the environment's network proxy. Production
// uses the Worker fetch handler; no preview bridge or secrets enter the client.
export function aiPreview():Plugin{return {name:'breach-ai-local-transport',apply:'serve',configureServer(server){
 let key=process.env.BREACH_API_KEY||'';
 if(!key){try{key=readFileSync('.dev.vars','utf8').match(/^BREACH_API_KEY=(.*)$/m)?.[1]?.trim()||'';}catch{}}
 const proxy=process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY;
 const dispatcher=proxy?new ProxyAgent(proxy):undefined;
 server.middlewares.use('/api/chat',async(req,res)=>{
 try{
 if(req.method==='GET'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({configured:!!key,model:'gpt-6.1-sol'}));return;}
 if(req.method!=='POST'){res.statusCode=405;res.end();return;}
 let body='';for await(const chunk of req){body+=chunk.toString();if(body.length>40000){res.statusCode=413;res.end();return;}}
 const headers=new Headers();for(const[k,v]of Object.entries(req.headers)){if(typeof v==='string')headers.set(k,v);}
 const request=new Request(`http://${req.headers.host}/api/chat`,{method:'POST',headers,body});
 const transport=((url:RequestInfo|URL,options?:RequestInit)=>nodeFetch(url as string,{...options,dispatcher} as Parameters<typeof nodeFetch>[1])) as unknown as typeof fetch;
 const result=await handleChat(request,key,transport);res.statusCode=result.status;res.setHeader('Content-Type','application/json');res.end(await result.text());
 }catch{res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Локальный API временно недоступен.'}));}
 });
 }};}
