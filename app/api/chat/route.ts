import {env} from 'cloudflare:workers';
import {handleChat} from '../../../lib/ai-handler';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({configured:!!(env as unknown as Record<string,string>).BREACH_API_KEY,model:'gpt-6.1-sol'});}
export async function POST(request:Request){return handleChat(request,(env as unknown as Record<string,string>).BREACH_API_KEY||'');}
