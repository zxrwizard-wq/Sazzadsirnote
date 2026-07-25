<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Archive</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="admin-link" href="admin.html">admin →</a>
<div class="wrap">
  <div class="brand">
    <div class="dot"></div>
    <h1>ARCHIVE</h1>
  </div>
  <div class="tagline">Browse by category.</div>

  <div class="breadcrumbs" id="breadcrumbs"></div>
  <div id="content"></div>
</div>

<div class="toast" id="toast"></div>

<script type="module">
import { db, collection, query, orderBy, onSnapshot } from "./firebase-init.js";

const contentEl = document.getElementById('content');
const crumbsEl = document.getElementById('breadcrumbs');

// state: null = category grid, {cat} = topics grid, {cat, topic} = items list
let state = { view: 'categories' };

let categories = [];
let topics = [];
let items = [];

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

// live listeners
onSnapshot(query(collection(db,'categories'), orderBy('createdAt','asc')), snap => {
  categories = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  render();
});
onSnapshot(query(collection(db,'topics'), orderBy('createdAt','asc')), snap => {
  topics = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  render();
});
onSnapshot(query(collection(db,'items'), orderBy('createdAt','asc')), snap => {
  items = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  render();
});

function goCategories(){ state = { view:'categories' }; render(); }
function goTopics(cat){ state = { view:'topics', cat }; render(); }
function goItems(cat, topic){ state = { view:'items', cat, topic }; render(); }

function renderCrumbs(){
  crumbsEl.innerHTML = '';
  const home = document.createElement('span');
  home.className = 'crumb' + (state.view==='categories' ? ' current' : '');
  home.textContent = 'Categories';
  home.onclick = goCategories;
  crumbsEl.appendChild(home);

  if(state.view === 'topics' || state.view === 'items'){
    const sep = document.createElement('span'); sep.className='sep'; sep.textContent='/';
    crumbsEl.appendChild(sep);
    const catCrumb = document.createElement('span');
    catCrumb.className = 'crumb' + (state.view==='topics' ? ' current' : '');
    catCrumb.textContent = state.cat.name;
    catCrumb.onclick = () => goTopics(state.cat);
    crumbsEl.appendChild(catCrumb);
  }
  if(state.view === 'items'){
    const sep2 = document.createElement('span'); sep2.className='sep'; sep2.textContent='/';
    crumbsEl.appendChild(sep2);
    const topicCrumb = document.createElement('span');
    topicCrumb.className = 'crumb current';
    topicCrumb.textContent = state.topic.name;
    crumbsEl.appendChild(topicCrumb);
  }
}

function render(){
  renderCrumbs();
  if(state.view === 'categories') return renderCategories();
  if(state.view === 'topics') return renderTopics();
  if(state.view === 'items') return renderItems();
}

function renderCategories(){
  if(categories.length === 0){
    contentEl.innerHTML = `<div class="empty">No categories yet. Add some from the admin panel.</div>`;
    return;
  }
  contentEl.innerHTML = `<div class="grid" id="catGrid"></div>`;
  const grid = document.getElementById('catGrid');
  categories.forEach(cat => {
    const topicCount = topics.filter(t => t.categoryId === cat.id).length;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="icon">${cat.icon || '📁'}</span>
      <div class="name">${escapeHtml(cat.name)}</div>
      <div class="meta">${topicCount} topic${topicCount===1?'':'s'}</div>
    `;
    card.onclick = () => goTopics(cat);
    grid.appendChild(card);
  });
}

function renderTopics(){
  const catTopics = topics.filter(t => t.categoryId === state.cat.id);
  if(catTopics.length === 0){
    contentEl.innerHTML = `<div class="empty">No topics in ${escapeHtml(state.cat.name)} yet.</div>`;
    return;
  }
  contentEl.innerHTML = `<div class="grid" id="topicGrid"></div>`;
  const grid = document.getElementById('topicGrid');
  catTopics.forEach(topic => {
    const itemCount = items.filter(i => i.topicId === topic.id).length;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="icon">🗂️</span>
      <div class="name">${escapeHtml(topic.name)}</div>
      <div class="meta">${itemCount} item${itemCount===1?'':'s'}</div>
    `;
    card.onclick = () => goItems(state.cat, topic);
    grid.appendChild(card);
  });
}

function renderItems(){
  const topicItems = items.filter(i => i.topicId === state.topic.id);
  if(topicItems.length === 0){
    contentEl.innerHTML = `<div class="empty">No items in ${escapeHtml(state.topic.name)} yet.</div>`;
    return;
  }
  contentEl.innerHTML = `<div class="items" id="itemsList"></div>`;
  const list = document.getElementById('itemsList');
  topicItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item';
    let bodyHtml = '';
    if(item.type === 'text'){
      bodyHtml = `<div class="body">${escapeHtml(item.body || '')}</div>`;
    } else if(item.type === 'file'){
      bodyHtml = `<div class="body"><a class="btn small" href="${item.url}" target="_blank" rel="noopener">⬇ Download ${escapeHtml(item.fileName||'file')}</a></div>`;
    } else if(item.type === 'link'){
      const yt = getYouTubeId(item.url);
      if(yt){
        bodyHtml = `<div class="body"><iframe width="100%" height="320" style="border:0;border-radius:10px;" src="https://www.youtube.com/embed/${yt}" allowfullscreen></iframe></div>`;
      } else {
        bodyHtml = `<div class="body"><a class="btn small" href="${item.url}" target="_blank" rel="noopener">↗ Open link</a></div>`;
      }
    }
    row.innerHTML = `
      <div class="top">
        <div>
          <div class="title">${escapeHtml(item.title)}</div>
          ${item.description ? `<div class="desc">${escapeHtml(item.description)}</div>` : ''}
        </div>
        <span class="type-badge ${item.type}">${item.type}</span>
      </div>
      ${bodyHtml}
    `;
    row.querySelector('.top').onclick = () => row.classList.toggle('open');
    list.appendChild(row);
  });
}

function getYouTubeId(url){
  if(!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

render();
</script>
</body>
</html>
