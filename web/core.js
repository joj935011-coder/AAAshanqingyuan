(function (root) {
  'use strict';
  const normalize = text => String(text || '').toLowerCase().replace(/\s+/g, '');
  const tokens = text => {
    const s = normalize(text), out = new Set(s.match(/[a-z0-9]+/g) || []);
    for (const run of s.match(/[\u3400-\u9fff]+/g) || []) for (let i = 0; i < run.length - 1; i++) out.add(run.slice(i, i + 2));
    return [...out].filter(t => !['什么','怎么','可以','一下','告诉','我们','这个','那个','介绍','请问','知道','大明','明湖'].includes(t));
  };
  function retrieve(query, documents, history = []) {
    let effective = query;
    if (/^(它|那里|那儿|这个|还有|再|详细|适合|带孩子|为什么呢|然后)/.test(query)) effective = history.filter(m => m.role === 'user').slice(-1).map(m => m.content).join(' ') + ' ' + query;
    if (/泉城|泉水|湖水|水从/.test(effective)) effective += ' 泉水 来源';
    if (/诗|对联/.test(effective)) effective += ' 历下亭 楹联';
    if (/辛弃疾/.test(effective)) effective += ' 稼轩祠';
    const terms = tokens(effective);
    return documents.map(doc => {
      const title = normalize(doc.title), tags = normalize((doc.tags || []).join(' ')), body = normalize(doc.content);
      let score = terms.reduce((n, t) => n + (title.includes(t) ? 6 : 0) + (tags.includes(t) ? 4 : 0) + (body.includes(t) ? 1 : 0), 0);
      if (title.length > 1 && normalize(effective).includes(title)) score += 30;
      return { ...doc, score };
    }).filter(d => d.score >= 3).sort((a, b) => b.score - a.score).slice(0, 3);
  }
  function answer(query, destination, history = []) {
    const sources = retrieve(query, destination.documents, history);
    if (/^(你好|您好|嗨|hello|hi)[！!。\s]*$/i.test(query)) return { text: `你好呀，我是泉灵！今天陪你探索${destination.name}。你可以问我景点故事，也可以告诉我有多少时间，我帮你安排一段漫游。`, sources: [], mode: 'knowledge' };
    if (/门票|票价|多少钱|几点|开放时间|亮灯|营业|天气|拥挤|闭馆|现在开放/.test(query)) return { text: '这些信息可能随季节、活动和现场安排变化，我的知识库没有实时票务、天气或营业状态。出发前请查看景区官方公告或现场提示。\n\n' + (sources[0] ? `${sources[0].title}：${sources[0].content}` : '我可以继续介绍景点背景，或帮你做一份可调整的游览安排。'), sources: sources.slice(0, 1), mode: 'knowledge' };
    if (!sources.length) return { text: `关于这个问题，${destination.name}的现有知识库还没有足够资料，我先不猜。可以换成具体景点名称，或在「景区知识库」中补充相关材料。接通模型后，也会优先依据这里的资料回答。`, sources: [], mode: 'knowledge' };
    return { text: `我从${destination.name}的资料里找到了这些内容：\n\n` + sources.slice(0, 2).map((d, i) => `${d.title} [${i + 1}]\n${d.content}`).join('\n\n') + '\n\n你可以继续追问，或者让我帮你安排游览顺序。', sources: sources.slice(0, 2), mode: 'knowledge' };
  }
  function validateDestination(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('请导入包含 name 和 documents 的 JSON 对象。');
    if (typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 40) throw Error('景区名称需要为 1–40 个字符。');
    if (!Array.isArray(raw.documents) || !raw.documents.length || raw.documents.length > 100) throw Error('知识库需要包含 1–100 条 documents。');
    let length = 0;
    const documents = raw.documents.map((d, i) => {
      if (!d || typeof d.title !== 'string' || typeof d.content !== 'string' || !d.content.trim()) throw Error(`第 ${i + 1} 条资料缺少有效 title 或 content。`);
      length += d.content.length;
      if (d.content.length > 12000) throw Error(`第 ${i + 1} 条过长，请拆分为较小资料。`);
      return { id: String(d.id || 'doc-' + i).slice(0, 80), title: d.title.slice(0, 120), content: d.content, category: String(d.category || '景区资料').slice(0, 40), tags: Array.isArray(d.tags) ? d.tags.filter(t => typeof t === 'string').slice(0, 20).map(t => t.slice(0, 40)) : [], sourceTitle: String(d.sourceTitle || '用户导入资料').slice(0, 150), sourceUrl: /^https?:\/\//i.test(d.sourceUrl || '') ? String(d.sourceUrl).slice(0, 2000) : '', checkedAt: String(d.checkedAt || '').slice(0, 20) };
    });
    if (length > 120000) throw Error('知识库内容超过 12 万字，请分批精简。');
    const stops = Array.isArray(raw.stops) ? raw.stops.slice(0, 30).filter(s => s && typeof s.name === 'string').map((s, i) => ({ id: String(s.id || 'stop-' + i).slice(0, 60), name: s.name.slice(0, 80), description: String(s.description || '').slice(0, 350), minutes: Math.max(10, Math.min(60, Number(s.minutes) || 20)), interests: Array.isArray(s.interests) ? s.interests.filter(x => ['culture','photo','family','relax'].includes(x)) : [], order: i })) : [];
    return { id: 'custom-' + normalize(raw.name).replace(/[^\w\u3400-\u9fff]/g, '').slice(0, 40), name: raw.name.trim(), city: String(raw.city || '自定义景区').slice(0, 40), description: String(raw.description || '带上自己的景区资料，让泉灵陪你探索。').slice(0, 300), documents, stops, imported: true };
  }
  function fromText(name, text, filename) {
    const paragraphs = text.replace(/\r/g, '').split(/\n\s*\n/).filter(p => p.trim());
    const chunks = [];
    for (const paragraph of paragraphs) for (let i = 0; i < paragraph.length; i += 900) chunks.push(paragraph.slice(i, i + 900));
    return validateDestination({ name, documents: chunks.map((content, i) => ({ title: content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 36) || `${name}资料 ${i + 1}`, content, sourceTitle: filename })) });
  }
  function plan(destination, options = {}) {
    const duration = [60, 120, 180].includes(Number(options.duration)) ? Number(options.duration) : 120;
    const interest = ['culture', 'photo', 'family', 'relax'].includes(options.interest) ? options.interest : 'culture';
    const relaxed = options.pace === 'relaxed';
    const names = {culture:'人文寻踪',photo:'湖畔出片',family:'亲子发现',relax:'慢慢逛湖'};
    if (!destination.stops?.length) return { title: `${destination.name} · 待补充路线信息`, error: '这份知识库还没有可用于路线规划的站点顺序。请在 JSON 中加入 stops（按可步行游览顺序排列），或先向泉灵询问景点信息。', stops: [], duration };
    let available = [...destination.stops];
    if (destination.id === 'daming') {
      const ids = duration === 60 ? (options.start === 'east' ? ['chaoran', 'east-lakeside'] : ['xiayuan', 'south-lakeside']) : (options.start === 'east' ? ['chaoran', 'east-lakeside', 'south-lakeside', 'xiayuan'] : ['xiayuan', 'south-lakeside', 'east-lakeside', 'chaoran']);
      available = ids.map(id => available.find(s => s.id === id)).filter(Boolean);
    }
    const limit = duration === 60 ? 2 : (duration === 120 ? (relaxed ? 3 : 4) : (relaxed ? 4 : 6));
    // Select a contiguous corridor; reserve walking time before admitting each stop.
    const stops = []; let used = 0;
    for (const stop of available) {
      if (stops.length >= limit) break;
      const walk = stops.length ? (relaxed ? 18 : 14) : 0;
      const stay = Math.round((stop.minutes || 15) * ((stop.interests || []).includes(interest) ? 1.3 : 1) * (relaxed ? 1.1 : 1));
      if (used + walk + stay > duration - 5) break;
      used += walk + stay;
      stops.push({ ...stop, stay, walk, elapsed: used });
    }
    return { title: `${destination.name} · ${names[interest]}`, duration, interest, relaxed, stops, used, rest: Math.max(0, duration - used), note: '时间为规划估算；示意顺序不是实时道路导航。请按现场标识通行，临时关闭、船班、登楼与票务另查官方公告。' };
  }
  root.GuideCore = { retrieve, answer, validateDestination, fromText, plan };
})(typeof globalThis !== 'undefined' ? globalThis : window);
