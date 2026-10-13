import http from 'node:http';
import worker from '../worker/index.js';
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req,res) => {
 try {
  const chunks=[]; let size=0;
  for await (const chunk of req) { size += chunk.length; if(size>650000) {res.writeHead(413);res.end('Request too large');return;} chunks.push(chunk); }
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await worker.fetch(request,process.env,{});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 } catch {res.writeHead(500);res.end('Local server error');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
