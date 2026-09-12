import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { emailSamples } from '../tests/fixtures/emailSamples.mjs';
import { emailDraftSamples } from '../tests/fixtures/emailDraftSamples.mjs';
import { prepareEmailPreview, emailHtmlToText } from '../utils/shared/emailContent.js';

const out = path.resolve('output/email-preview');
await fs.mkdir(out, { recursive: true });
const samples = { ...emailDraftSamples(), ...await emailSamples() };
const stressData = { name: 'Sample O\'Connor & Team <QA>', email: 'sample+qa@example.com', roadmapTitle: 'Distributed Systems and Cloud Infrastructure '.repeat(3), progressCount: 40, totalTopics: 40 };
const stress = { ...emailDraftSamples(stressData), ...await emailSamples(stressData) };
const variants = {};
const stream = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' });
for (const [id, mail] of Object.entries(samples)) {
  variants[id] = Object.fromEntries(['light', 'dark', 'styles stripped', 'images blocked', 'long content'].map(mode => [mode, prepareEmailPreview(mode === 'long content' ? stress[id].html : mail.html, { theme: mode === 'dark' ? 'dark' : 'light', stripStyles: mode === 'styles stripped', blockImages: mode === 'images blocked' })]));
  await fs.writeFile(path.join(out, `${id}.html`), mail.html);
  const eml = await stream.sendMail({ from: 'SkillBun <noreply@skillbun.tech>', to: 'sample@example.com', replyTo: 'harsh@skillbun.tech', subject: `[SAMPLE ONLY] ${mail.subject}`, html: mail.html, text: mail.text || emailHtmlToText(mail.html) });
  await fs.writeFile(path.join(out, `${id}.eml`), eml.message);
}
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SkillBun email verification</title><style>body{font:15px Arial;margin:24px;color:#161616;background:#f5f5f2}select,button{padding:8px;margin:6px}main{display:flex;flex-wrap:wrap;gap:22px}article{max-width:100%}iframe{border:1px solid #aaa;height:820px;background:white}h2{font-size:14px}td,th{text-align:left;padding:7px;border-bottom:1px solid #ccc}table{border-collapse:collapse}#results{overflow:auto;margin-bottom:20px}a{color:#075c30}</style></head><body><h1>SkillBun email verification</h1><p>Synthetic samples. Preview modes test browser fallbacks; they do not emulate Gmail, Outlook or Zoho.</p><label>Template <select id="template">${Object.keys(samples).map(id => `<option>${id}</option>`).join('')}</select></label><label>Width <select id="width"><option>320</option><option selected>375</option><option>600</option><option>860</option></select></label><button id="all">Check all templates and modes</button><p id="status"></p><div id="results"></div><main></main><script>
const variants=${JSON.stringify(variants).replaceAll('<', '\u003c')};
const t=document.querySelector('#template'),w=document.querySelector('#width'),gallery=document.querySelector('main'),results=document.querySelector('#results'),status=document.querySelector('#status');let run=0;
async function show(all=false){const version=++run;gallery.innerHTML='';results.innerHTML='';status.textContent='Rendering…';const rows=[];for(const id of all?Object.keys(variants):[t.value])for(const [mode,html]of Object.entries(variants[id])){if(version!==run)return;const article=document.createElement('article'),h=document.createElement('h2'),frame=document.createElement('iframe');h.textContent=id+' — '+mode;frame.title=h.textContent;frame.width=w.value;frame.setAttribute('sandbox','allow-same-origin');article.append(h,frame);gallery.append(article);await new Promise(resolve=>{frame.onload=resolve;frame.srcdoc=html});if(version!==run)return;const d=frame.contentDocument,view=frame.contentWindow,p=d.querySelector('.sb-lede');rows.push([id,mode,w.value,d.documentElement.clientWidth,d.documentElement.scrollWidth,p?view.getComputedStyle(p).fontFamily:'',view.getComputedStyle(d.body).backgroundColor]);}results.innerHTML='<table><tr><th>Template</th><th>Mode</th><th>Requested width</th><th>Available width</th><th>Content width</th><th>Intro font</th><th>Background</th></tr>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+String(x).replaceAll('&','&amp;').replaceAll('<','&lt;')+'</td>').join('')+'</tr>').join('')+'</table>';status.textContent='Complete: '+rows.length+' renders. Horizontal overflow: '+rows.filter(r=>Number(r[4])>Number(r[3])+1).length;}
t.onchange=w.onchange=()=>show();document.querySelector('#all').onclick=()=>show(true);show();
</script></body></html>`;
await fs.writeFile(path.join(out, 'index.html'), html);
if (process.argv.includes('--export-only')) { console.log(`Exported ${Object.keys(samples).length} HTML and EML samples to ${out}`); }
else http.createServer((req, res) => { if (req.url === '/' || req.url === '/index.html') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); } else { res.writeHead(404); res.end('Not found'); } }).listen(3088, '127.0.0.1', () => console.log('Synthetic email preview: http://127.0.0.1:3088'));
