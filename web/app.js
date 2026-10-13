(() => {
  'use strict';
  const $ = id => document.getElementById(id), core = window.GuideCore;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { toast('浏览器存储空间不足，本次内容仅在当前页面保留。'); return false; } };
  let custom = read('quan.destinations.v1', []).map(item => { try { return core.validateDestination(item); } catch { return null; } }).filter(Boolean);
  let destinations = [window.DAMING_DATA, ...custom], current = destinations[0], busy = false, speechEnabled = false, configured = false, activeRoute = null;
  let requestController = null;
  const histories = read('quan.histories.v1', {});
  const history = () => Array.isArray(histories[current.id]) ? histories[current.id] : (histories[current.id] = []);
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('visible'), 4000); }
  function setCharacter(state) { document.body.dataset.guideState = state; }
  function showView(view) {
    if (view === 'knowledge') { openKnowledge(); return; }
    ['explore', 'route', 'community'].forEach(name => { const node = $('view-' + name); if (node) node.hidden = name !== view; const button = $('nav-' + name); if (button) { button.classList.toggle('active', name === view); button.setAttribute('aria-current', name === view ? 'page' : 'false'); } });
    if (view === 'route' && !activeRoute) generateRoute();
  }
  function sourceHTML(sources) {
    if (!sources?.length) return '';
    return '<details class="answer-sources"><summary>查看 ' + sources.length + ' 条知识来源</summary>' + sources.map((s, i) => '<div class="source-entry"><strong>[' + (i + 1) + '] ' + escape(s.title) + '</strong>' + (/^https?:\/\//i.test(s.sourceUrl || '') ? '<a href="' + escape(s.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + escape(s.sourceTitle || '查看来源') + ' ↗</a>' : '<span>' + escape(s.sourceTitle || '用户导入资料') + '</span>') + '<small>资料整理' + (s.checkedAt ? ' · 核查于 ' + escape(s.checkedAt) : ' · 请自行核实导入材料') + '</small></div>').join('') + '<small>含本项目整理的讲解建议，非官方原文。</small></details>';
  }
  function appendMessage(message, shouldScroll = true) {
    const node = document.createElement('article'); node.className = 'message ' + (message.role === 'user' ? 'user-message' : 'assistant-message');
    if (message.role === 'user') node.innerHTML = '<div class="message-bubble">' + escape(message.content) + '</div>';
    else node.innerHTML = '<div class="message-author"><span class="mini-avatar">泉</span><span>泉灵</span><small>' + (message.mode === 'ai' ? 'AI 生成 · 基于资料' : '知识库资料回答') + '</small></div><div class="message-bubble">' + escape(message.content).replace(/\n/g, '<br>') + '</div>' + sourceHTML(message.sources) + '<button class="read-answer" type="button" aria-label="朗读这条回答">播放讲解 <span aria-hidden="true">▷</span></button>';
    node.querySelector('.read-answer')?.addEventListener('click', () => speak(message.content));
    $('chat-messages').appendChild(node); if (shouldScroll) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return node;
  }
  const initialChat = $('chat-messages').innerHTML;
  function renderHistory() {
    const messages = history();
    $('chat-messages').innerHTML = current.id === 'daming' && !messages.length ? initialChat : '';
    if (current.id !== 'daming' && !messages.length) appendMessage({ role: 'assistant', content: `你好，我是泉灵！${current.name}的 ${current.documents.length} 条资料已经准备好。你想先了解什么？`, mode: 'knowledge' }, false);
    messages.forEach(m => appendMessage(m, false));
    $('chat-messages').scrollTop = messages.length ? $('chat-messages').scrollHeight : 0;
  }
  async function ask(question) {
    const text = String(question || '').trim(); if (!text || busy) return;
    if (text.length > 1500) { toast('问题请控制在 1500 字以内。'); return; }
    const previous = history().slice(-8).map(m => ({role:m.role,content:m.content}));
    const user = { role: 'user', content: text }; history().push(user); appendMessage(user); $('chat-input').value = '';
    const pending = document.createElement('div'); pending.className = 'thinking-message'; pending.setAttribute('role','status'); pending.textContent = configured ? '泉灵正在查阅资料并组织回答…' : '泉灵正在查阅景区资料…'; $('chat-messages').append(pending); pending.scrollIntoView({block:'nearest'});
    busy = true; $('send-button').disabled = true; $('destination-select').disabled = true; setCharacter('thinking');
    let result;
    try {
      if (/路线|行程|怎么逛|怎么玩|安排|规划/.test(text) && !/亮灯|持续|开放|营业/.test(text) && current.stops?.length) {
        const compact = text.replace(/\s/g, '');
        const numericTime = compact.match(/(\d+(?:\.\d+)?)(分钟|个?小时)/);
        const requestedTime = numericTime ? Number(numericTime[1]) * (numericTime[2] === '分钟' ? 1 : 60) : /一个半|半小时/.test(compact) ? 90 : /三个?小时|半天/.test(compact) ? 180 : /两个?小时|二个?小时/.test(compact) ? 120 : /一个?小时/.test(compact) ? 60 : null;
        if ([60,120,180].includes(requestedTime)) $('route-duration').value = String(requestedTime);
        else if (requestedTime !== null) {
          showView('route');
          result = {text:'当前路线支持 60、120、180 分钟三个档位。你可以在路线页选一个合适的时长，再按兴趣和节奏调整；我不会把你给的时间悄悄改成另一个值。',mode:'knowledge',sources:[]};
        }
        if (!result) {
        if (/拍照|摄影|出片/.test(text)) $('route-interest').value = 'photo';
        if (/孩子|亲子/.test(text)) $('route-interest').value = 'family';
        if (/慢|老人|长辈|累|轻松/.test(text)) $('route-pace').value = 'relaxed';
        showView('route'); generateRoute();
        result = { text: `给你安排了「${activeRoute.title}」：\n\n` + activeRoute.stops.map((s, i) => `${i + 1}. ${s.name} · 停留约 ${s.stay} 分钟`).join('\n') + `\n\n另留 ${activeRoute.rest} 分钟机动。你可以在路线页调整时间、兴趣和步行节奏。这是根据站点规则生成的路线草案，时间未经实地测量，不含登楼、登岛与排队。`, mode: 'knowledge', sources: [] };
        }
      } else if (location.protocol === 'file:') result = core.answer(text, current, previous);
      else {
        requestController = new AbortController(); const timer = setTimeout(() => requestController?.abort(), 50000);
        try {
          const response = await fetch('/api/chat', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:text,destination:current,history:previous}),signal:requestController.signal});
          const data = await response.json(); if (!response.ok || !data.text) throw Error(data.error || '导游服务暂时不可用。'); result = data;
        } finally {clearTimeout(timer);requestController = null;}
      }
    } catch (error) {
      result = core.answer(text, current, previous);
      result.text = '连接提示：' + (error.name === 'AbortError' ? '请求已超时。' : error.message) + ' 已改用本地知识库回答。\n\n' + result.text;
    } finally {pending.remove();busy=false;$('send-button').disabled=false;$('destination-select').disabled=false;setCharacter('idle');}
    const message = {role:'assistant',content:result.text,sources:result.sources,mode:result.mode}; history().push(message);
    if (history().length > 40) histories[current.id] = history().slice(-40);
    save('quan.histories.v1',histories); appendMessage(message); if(speechEnabled) speak(result.text);
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) {toast('此浏览器暂不支持朗读，可以直接阅读讲解。');return;}
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text.replace(/\[\d+\]/g,'')); utterance.lang='zh-CN';utterance.rate=0.96;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('zh')); if(voice) utterance.voice=voice;
    utterance.onstart=()=>setCharacter('speaking'); utterance.onend=()=>setCharacter('idle'); utterance.onerror=()=>{setCharacter('idle');toast('朗读未能启动，请检查浏览器语音支持。');}; window.speechSynthesis.speak(utterance);
  }
  function routeText() { if (!activeRoute || activeRoute.error) return ''; return activeRoute.title + '\n计划时间：' + activeRoute.duration + ' 分钟\n' + activeRoute.stops.map((s,i)=>`${i+1}. ${s.name}｜停留约 ${s.stay} 分钟${s.walk ? '，此前步行估算 ' + s.walk + ' 分钟' : ''}\n${s.description}`).join('\n') + '\n机动时间：' + activeRoute.rest + ' 分钟\n' + activeRoute.note; }
  function generateRoute() {
    activeRoute = core.plan(current, {duration:$('route-duration').value,interest:$('route-interest').value,pace:$('route-pace').value,start:$('route-start').value});
    const r = activeRoute;
    if (r.error) { $('route-results').innerHTML='<div class="empty-state"><h3>还需要一点路线资料</h3><p>'+escape(r.error)+'</p><button class="primary-button" data-open-knowledge>补充景区资料</button></div>'; return; }
    const interestTips={culture:'读一读现场介绍，找一个你最想追问的历史细节。',photo:'留意建筑与水面的关系，把时间留给光线和倒影。',family:'和孩子找一处新发现，再向泉灵问一个为什么。',relax:'跟着自己的节奏走，累了就在可休息区域停一停。'};
    $('route-results').innerHTML = '<div class="route-result-heading"><div><span class="eyebrow">YOUR LITTLE JOURNEY</span><h3>'+escape(r.title)+'</h3></div><span class="route-duration-badge">'+r.duration+' 分钟 · '+r.stops.length+' 站</span></div><div class="route-schematic" aria-label="游览顺序示意，非导航">'+r.stops.map((s,i)=>'<span><b>'+(i+1)+'</b>'+escape(s.name)+'</span>').join('<i aria-hidden="true">→</i>')+'</div><p class="route-disclaimer">游览顺序示意 · 非实时导航</p><div class="route-timeline">'+r.stops.map((s,i)=>'<article class="route-stop"><div class="stop-number">'+String(i+1).padStart(2,'0')+'</div><div><div class="stop-heading"><h4>'+escape(s.name)+'</h4><span>停留约 '+s.stay+' 分钟</span></div><p>'+escape(s.description)+'</p><p class="interest-tip">'+interestTips[r.interest]+'</p>'+(s.walk?'<small>与上一站衔接：步行估算约 '+s.walk+' 分钟，以现场路径为准</small>':'<small>从所选片区起步，具体入口按现场标识确认</small>')+'</div></article>').join('')+'</div><div class="route-summary"><span>游览与步行约 '+r.used+' 分钟</span><span>休息 / 机动 '+r.rest+' 分钟</span></div><p class="route-note">'+escape(r.note)+'</p><div class="route-actions"><button class="primary-button" id="route-copy">复制路线</button><button class="secondary-button" id="route-download">下载路线</button></div>';
    $('route-copy').addEventListener('click', async()=>{try{await navigator.clipboard.writeText(routeText());toast('路线已复制，可以发给同行人。');}catch{download('我的漫游路线.txt',routeText(),'text/plain');toast('浏览器未允许复制，已下载路线文本。');}});
    $('route-download').addEventListener('click',()=>download('我的漫游路线.txt',routeText(),'text/plain'));
  }
  function renderDestinations() { $('destination-select').innerHTML = destinations.map(d=>'<option value="'+escape(d.id)+'">'+escape(d.city+' · '+d.name)+'</option>').join('');$('destination-select').value=current.id; }
  const originalExplore = $('view-explore').innerHTML;
  const originalStarts = $('route-start').innerHTML;
  const originalBreadcrumb = document.querySelector('.breadcrumb').innerHTML;
  function switchDestination(id) {
    if(busy) return; current=destinations.find(d=>d.id===id)||destinations[0];activeRoute=null;window.speechSynthesis?.cancel();setCharacter('idle');
    $('view-explore').innerHTML = originalExplore;
    $('route-start').innerHTML = originalStarts;
    $('route-start').disabled = current.id !== 'daming';
    document.querySelector('.breadcrumb').innerHTML = originalBreadcrumb;
    document.querySelector('#view-community [data-view="explore"]').textContent = '先去发现' + current.name + ' →';
    if(current.id!=='daming') {
      document.querySelector('.breadcrumb').textContent = '探索中国 / ' + current.city;
      $('route-start').innerHTML = '<option value="south">按资料中的站点顺序</option>';
      $('destination-title').textContent=current.name; $('destination-description').textContent=current.description;
      if($('destination-subtitle')) $('destination-subtitle').textContent='让每一个地方，都有自己的故事。';
      if($('destination-label')) $('destination-label').textContent='你的专属景区';
      const hero=$('view-explore').querySelector('.hero');if(hero) hero.classList.add('custom-destination');
      hero.querySelector('h2').textContent = '在每一个地方，发现新的故事。';
      hero.querySelector('.hero-copy p').textContent = '让泉灵带上你的资料，开启新的旅程。';
      hero.querySelector('.art-caption').textContent = '泉灵旅行意象插画 · 非当前景区实景';
      const primary = hero.querySelector('[data-ask]'); primary.textContent = '听泉灵讲' + current.name + ' →'; primary.dataset.ask = '请介绍' + current.documents[0].title;
      $('view-explore').querySelector('.section-heading [data-ask]').dataset.ask = '请介绍' + current.documents[0].title;
      $('view-explore').querySelector('.intro-heading .eyebrow').textContent = 'EVERY PLACE HAS A STORY.';
      $('view-explore').querySelector('.destination-seal').textContent = '新旅程';
      const scenic=$('view-explore').querySelector('[aria-label*="大明湖"]');if(scenic)scenic.setAttribute('aria-label','泉灵景区意象插画');
      $('places-grid').innerHTML=current.documents.slice(0,3).map((d,i)=>'<button class="imported-place" data-ask="'+escape('请介绍'+d.title)+'"><span class="eyebrow">STORY '+String(i+1).padStart(2,'0')+'</span><h3>'+escape(d.title)+'</h3><p>'+escape(d.content.slice(0,85))+'…</p><span>听泉灵讲讲 ↗</span></button>').join('');
      if($('route-preview')) $('route-preview').innerHTML='<p>从 '+escape(current.name)+' 的资料出发，发现属于你的旅行节奏。</p><button class="secondary-button" data-open-route>规划我的路线 →</button>';
    }
    document.querySelectorAll('[data-current-destination]').forEach(el=>el.textContent=current.name);
    if($('knowledge-count'))$('knowledge-count').textContent=current.documents.length+' 条资料';
    renderHistory();renderDestinations();showView('explore');
  }
  function openKnowledge() {
    $('kb-destination-name').value = current.name;
    $('kb-list').innerHTML=current.documents.map(d=>'<article class="kb-document"><span class="eyebrow">'+escape(d.category||'景区资料')+'</span><h4>'+escape(d.title)+'</h4><p>'+escape(d.content.slice(0,100))+'…</p><small>'+escape(d.sourceTitle)+'</small></article>').join('');
    $('kb-import-status').textContent='支持 TXT、Markdown 和 JSON，最大 1 MB。导入内容保存在当前浏览器；使用 AI 回答时，相关资料会发送给你配置的模型服务。';
    $('kb-dialog').showModal();
  }
  function download(name, content, type='application/json') {const blob=new Blob([content],{type:type+';charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importKnowledge() {
    if(busy){toast('请等待当前回答完成后再导入。');return;}
    const file=$('kb-file').files[0];if(!file){$('kb-import-status').textContent='请先选择一个资料文件。';return;}
    if(file.size>1048576){$('kb-import-status').textContent='文件超过 1 MB，请精简后再试。';return;}
    try {
      const text=(await file.text()).replace(/^\uFEFF/,'');
      const parsed=/\.json$/i.test(file.name)?core.validateDestination(JSON.parse(text)):core.fromText($('kb-destination-name').value.trim()||file.name.replace(/\.[^.]+$/,''),text,file.name);
      const index=custom.findIndex(d=>d.id===parsed.id);if(index>=0)custom[index]=parsed;else custom.push(parsed);
      save('quan.destinations.v1',custom);destinations=[window.DAMING_DATA,...custom];switchDestination(parsed.id);$('kb-dialog').close();toast('已导入 '+parsed.name+'，可以开始提问。');
    } catch(error){$('kb-import-status').textContent='导入失败：'+error.message;}
  }
  async function checkApi() {
    $('api-status').textContent='正在检查服务端配置…';
    try {
      if(location.protocol==='file:')throw Error('本地文件模式可体验知识库。连接模型请用本地服务或托管网页。');
      const response=await fetch('/api/status',{signal:AbortSignal.timeout(6000)});if(!response.ok)throw Error('服务端状态暂时不可用。'); const status=await response.json();configured=status.configured===true;
      $('api-status').textContent=configured?'模型配置已就绪：'+status.model+'。发送一个景区问题即可验证实际回答。':'尚未配置模型 API，当前可使用知识库问答和路线规划。';
    } catch(error){configured=false;$('api-status').textContent=error.message;}
    $('model-status').textContent=configured?'AI 讲解已就绪':'知识库体验模式'; if($('api-mode-label'))$('api-mode-label').textContent=configured?'模型已连接':'接入 AI 模型';
  }
  document.addEventListener('click',event=>{
    const askButton=event.target.closest('[data-ask]');if(askButton){ask(askButton.dataset.ask);return;}
    const place=event.target.closest('[data-place]');if(place){const mapping={lixia:'历下亭',chaoran:'超然楼',tie:'铁公祠',jiaxuan:'稼轩祠',xiayuan:'遐园'};ask('请介绍'+(mapping[place.dataset.place]||place.dataset.place));return;}
    if(event.target.closest('[data-open-route]')){showView('route');return;}
    if(event.target.closest('[data-open-knowledge]')){openKnowledge();return;}
    const view=event.target.closest('[data-view]');if(view){showView(view.dataset.view);return;}
    const closer=event.target.closest('[data-close-dialog]');if(closer){closer.closest('dialog')?.close();return;}
    const bookmark=event.target.closest('[data-bookmark]');if(bookmark){const bookmarks=read('quan.bookmarks.v1',[]),id=bookmark.dataset.bookmark,index=bookmarks.indexOf(id);if(index<0)bookmarks.push(id);else bookmarks.splice(index,1);save('quan.bookmarks.v1',bookmarks);bookmark.setAttribute('aria-pressed',String(index<0));toast(index<0?'已加入本机收藏':'已取消收藏');}
  });
  $('chat-form').addEventListener('submit',event=>{event.preventDefault();ask($('chat-input').value);});
  $('chat-input').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();ask($('chat-input').value);}});
  $('chat-input').maxLength=1500;
  $('chat-reset').addEventListener('click',()=>{if(busy){toast('请等待当前回答结束后再开始新对话。');return;}histories[current.id]=[];save('quan.histories.v1',histories);window.speechSynthesis?.cancel();setCharacter('idle');renderHistory();toast('已开启新对话。');});
  $('voice-button').addEventListener('click',()=>{speechEnabled=!speechEnabled;$('voice-button').setAttribute('aria-pressed',String(speechEnabled));if(!speechEnabled){window.speechSynthesis?.cancel();setCharacter('idle');}toast(speechEnabled?'已开启回答自动朗读':'已关闭自动朗读');});
  $('destination-select').addEventListener('change',event=>switchDestination(event.target.value));
  $('route-form').addEventListener('submit',event=>{event.preventDefault();generateRoute();toast('已按你的偏好更新路线。');});
  $('kb-open').addEventListener('click',openKnowledge);
  $('kb-import').addEventListener('click',importKnowledge);
  $('kb-template').addEventListener('click',()=>download('景区知识库模板.json',JSON.stringify({name:'我的景区',city:'所在城市',description:'景区的一句话介绍',documents:[{id:'story-1',title:'景区的故事',content:'在这里写入经过核实的景点资料、历史背景或游览提示。',tags:['历史','文化'],sourceTitle:'资料出处',sourceUrl:'',checkedAt:'2026-10-13'}],stops:[{id:'entrance',name:'入口广场',description:'从入口出发，按现场标识通行。',minutes:15,interests:['culture','family']},{id:'garden',name:'花园',description:'示例站点，请改成实际相邻可达景点；按步行顺序排列。',minutes:20,interests:['photo','relax']}]},null,2)));
  $('kb-export').addEventListener('click',()=>download(current.name+'知识库.json',JSON.stringify(current,null,2)));
  $('api-open').addEventListener('click',()=>{$('api-dialog').showModal();checkApi();});
  $('api-test').addEventListener('click',checkApi);
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
  renderDestinations();renderHistory();checkApi();setCharacter('idle');
})();
