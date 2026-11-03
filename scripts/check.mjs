import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {render} from './build.mjs';
const root=new URL('../',import.meta.url);
const content=JSON.parse(await fs.readFile(new URL('content.json',root),'utf8'));
const templates=Object.fromEntries(await Promise.all(['index.html','cv.html'].map(async name=>[name,await fs.readFile(new URL('templates/'+name,root),'utf8')])));
const pages=render(content,templates);
for(const html of Object.values(pages)) {
  assert(!/\{\{[A-Z_]+\}\}/.test(html),'Unresolved template field');
  assert(!html.includes('chatgpt.site'),'Old hosting URL');
  assert(!html.includes('data-cite'),'Cite button returned');
  assert(html.includes('EBSD &amp; MTEX'),'Missing expertise');
}
const changed=structuredClone(content);
changed.profile.email='test@example.org';
changed.publications.push({...changed.publications[0],title:'New paper <test> & example',url:'https://example.org/paper',featured:false});
changed.experience.unshift({...changed.experience[0],title:'New research position'});
const updated=render(changed,templates);
for(const html of Object.values(updated)) {
  assert(html.includes('test@example.org'),'Email not synchronized');
  assert(!html.includes(content.profile.email),'Old email remains');
  assert(html.includes('New paper &lt;test&gt; &amp; example'),'Publication not synchronized or escaped');
  assert(html.includes('New research position'),'Experience not synchronized');
}
changed.publications[0].url='javascript:alert(1)';
assert.throws(()=>render(changed,templates),/Links must use/);
console.log('Checks passed: homepage/CV synchronization, escaped content and safe links.');
