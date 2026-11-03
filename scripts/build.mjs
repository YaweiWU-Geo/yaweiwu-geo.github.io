import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(value) {
  const parsed = new URL(value);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Links must use HTTPS or HTTP: '+value);
  return escape(value);
}
const authors = value => escape(value).replace(/^Wu, Y\./, '<strong>Wu, Y.</strong>');
const external = (href, label, cls='') => `<a ${cls ? `class="${cls}" ` : ''}href="${url(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;

export function render(content, templates) {
  const {profile: p, publications, experience, about} = content;
  for (const field of ['name','chineseName','role','email','location','website','heroDescription','updated']) {
    if (typeof p?.[field] !== 'string' || !p[field].trim()) throw new Error('Missing profile.'+field);
  }
  url(p.website);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) throw new Error('Invalid email');
  for (const list of [publications, experience, about]) if (!Array.isArray(list)) throw new Error('Content lists must be arrays');
  for (const paper of publications) {
    for (const key of ['title','journal','volume','authors','url']) if (!paper[key]) throw new Error('Publication missing '+key);
    if (!Number.isInteger(paper.year)) throw new Error('Publication year must be a number');
  }
  for (const item of experience) for (const key of ['date','cvDate','title','institution','description']) if (!item[key]) throw new Error('Experience missing '+key);
  const values = {
    NAME:escape(p.name), CHINESE_NAME:escape(p.chineseName), ROLE:escape(p.role), EMAIL:escape(p.email), LOCATION:escape(p.location), LOCATION_UPPER:escape(p.location.toUpperCase()),
    WEBSITE:url(p.website), WEBSITE_LABEL:escape(p.website.replace(/^https?:\/\//,'')), HERO_DESCRIPTION:escape(p.heroDescription), UPDATED:escape(p.updated), PUBLICATION_COUNT:String(publications.length),
    ABOUT:about.map((text,i)=>`<p${i===0?' class="large-copy"':''}>${escape(text)}</p>`).join(''),
    PUBLICATIONS:publications.map(x=>`<article class="publication${x.featured?' featured':''}"><div class="pub-year">${x.year}${x.featured?'<span class="featured-label">FEATURED</span>':''}</div><div class="pub-body"><p class="journal">${escape(x.journal)} <span>${escape(x.volume)}</span></p><h3>${external(x.url,escape(x.title))}</h3><p class="authors">${authors(x.authors)}</p>${x.summary?`<p class="pub-summary">${escape(x.summary)}</p>`:''}<div class="pub-links">${external(x.url,'Read paper <span aria-hidden="true">↗</span>')}${x.openAccess?'<span class="open-access">OPEN ACCESS</span>':''}${x.note?`<span class="online-note">${escape(x.note)}</span>`:''}</div></div></article>`).join('\n'),
    EXPERIENCE:experience.map(x=>`<article class="timeline-entry"><span class="timeline-dot${x.upcoming?' upcoming':''}"></span><div class="timeline-date">${escape(x.date)}${x.status?` <span class="status-pill">${escape(x.status)}</span>`:''}</div><h3>${escape(x.title)}</h3><p class="institution">${escape(x.institution)}</p><p>${escape(x.description)}</p>${x.detail?`<p class="timeline-detail">${escape(x.detail)}</p>`:''}${x.link?external(x.link,escape(x.linkLabel),'inline-link'):''}</article>`).join('\n'),
    CV_PUBLICATIONS:[...publications].sort((a,b)=>b.year-a.year).map(x=>`<li>${authors(x.authors)} (${x.year}). ${escape(x.title)}. <em>${escape(x.journal)}</em>, ${escape(x.volume)}.${x.note?` <span class="detail">${escape(x.note)}.</span>`:''}<a class="doi" href="${url(x.url)}">${escape(x.url.replace('https://doi.org/','doi:'))}</a></li>`).join('\n'),
    CV_EXPERIENCE:experience.map(x=>`<article><div class="entry-head"><h3>${escape(x.title)}</h3><span class="date">${escape(x.cvDate)}</span></div><p>${escape(x.institution)}</p><p class="detail">${escape(x.description)}</p>${x.detail?`<p class="detail">${escape(x.detail)}</p>`:''}</article>`).join('\n')
  };
  return Object.fromEntries(Object.entries(templates).map(([name,html])=>[name,html.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{
    if (!(key in values)) throw new Error('Unknown template field: '+key);
    return values[key];
  })]));
}

export async function build() {
  const content=JSON.parse(await fs.readFile(path.join(root,'content.json'),'utf8'));
  const templates=Object.fromEntries(await Promise.all(['index.html','cv.html'].map(async file=>[file,await fs.readFile(path.join(root,'templates',file),'utf8')])));
  const pages=render(content,templates);
  const output=path.join(root,'_site');
  await fs.mkdir(output,{recursive:true});
  await fs.cp(path.join(root,'static'),output,{recursive:true});
  for (const [file,html] of Object.entries(pages)) await fs.writeFile(path.join(output,file),html);
  await fs.writeFile(path.join(output,'.nojekyll'),'');
  await fs.writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${content.profile.website.replace(/\/$/,'')}/sitemap.xml\n`);
  await fs.writeFile(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(content.profile.website)}/</loc></url><url><loc>${escape(content.profile.website)}/cv.html</loc></url></urlset>`);
  console.log('Built _site: homepage, CV, assets and search-engine metadata.');
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await build();
