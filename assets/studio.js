'use strict';
(() => {
  const {items, categories, ui} = window.TactileCatalog;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const titles = {
    components:['实体界面组件库。','从一颗旋钮，到一整个产品。用同一种材质，组织每一次操作。'],
    pages:['把组件，组合成产品。','三种网页结构，体验同一套材质在真实页面中的层级与节奏。'],
    device:['一块屏幕，一整套触感。','为 LVGL 9.x · 800 × 480 设计的触控布局，预览控制、设置与音频页面。'],
    tokens:['克制的材质，清楚的规则。','统一底色、边缘、凹槽与光源，让每一个新组件都属于同一个产品。']
  };
  const state = {view:'components',category:'all',query:'',theme:'blue',page:'dashboard',devicePage:'control'};
  let priorFocus = null;
  let drawerFocus = null;
  const temporaryTimers = new Set();
  function later(callback, delay) {const timer=setTimeout(()=>{temporaryTimers.delete(timer);callback();},delay);temporaryTimers.add(timer);return timer;}
  function toast(message) {
    const node=document.createElement('div');node.className='toast';
    const text=document.createElement('span');text.textContent=message;
    const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','关闭通知');close.addEventListener('click',()=>node.remove());
    node.append(text,close);$('#toast-stack').appendChild(node);window.TactileIcons.normalize(node);later(()=>node.remove(),4500);
  }
  function setPressedGroup(container, target, attribute='aria-pressed') {container.querySelectorAll(`button[${attribute}]`).forEach(button=>button.setAttribute(attribute,String(button===target)));}
  function paintRange(input) {
    const min=Number(input.min||0),max=Number(input.max||100),value=Number(input.value);
    const percent=(value-min)/(max-min)*100;input.style.setProperty('--range',`${percent}%`);if(input.parentElement.classList.contains('range-control'))input.parentElement.style.setProperty('--range-ratio',percent/100);
    $$(`[data-range-output="${input.id}"]`).forEach(output=>{output.textContent=`${value}${input.dataset.unit||''}`;});
    $$(`.rotary[data-range="${input.id}"]`).forEach(rotary=>{
      rotary.style.setProperty('--angle',`${-112.5+percent*2.25}deg`);
      rotary.querySelectorAll('.rotary-led').forEach((led,index)=>led.classList.toggle('on',index<Math.round(percent*19/100)));
    });
  }
  function showUpload(input) {
    const zone=input.closest('.dropzone'),file=input.files[0];
    zone.classList.toggle('has-file',Boolean(file));
    zone.querySelector('[data-upload-status]').textContent=file?file.name:'本地文件预览';
    zone.querySelector('.upload-hint').textContent=file?`${file.size<1024?file.size+' B':file.size<1048576?(file.size/1024).toFixed(1)+' KB':(file.size/1048576).toFixed(1)+' MB'} · 已选择`:'拖入文件，或点击选择';
    zone.querySelector('[data-upload-clear]').hidden=!file;
  }
  function hydrate(root) {
    window.TactileControls.hydrate(root);
    window.TactileIcons.normalize(root);
    root.querySelectorAll('.rotary').forEach(rotary=>{
      if(!rotary.querySelector('.rotary-led'))for(let index=0;index<19;index++){const led=document.createElement('i');led.className='rotary-led';led.style.setProperty('--tick',`${-112.5+index*225/18}deg`);rotary.appendChild(led);}
    });
    root.querySelectorAll('input.slider').forEach(paintRange);
    root.querySelectorAll('.number-input').forEach(group=>updateStepper(group));
    root.querySelectorAll('.roller').forEach(roller=>{const selected=roller.querySelector('[aria-pressed="true"]');if(selected)roller.scrollTop=selected.offsetTop-roller.offsetTop-34;});
  }
  function renderCards() {
    const query=state.query.toLowerCase();
    const filtered=items.filter(item=>(state.category==='all'||item.category===state.category)&&`${item.title} ${item.subtitle} ${item.lvgl} ${item.notes}`.toLowerCase().includes(query));
    $('#component-grid').innerHTML=filtered.map(item=>`<article class="component-card" data-component="${item.id}"><header class="component-heading"><span class="component-number">${String(item.id).padStart(2,'0')}</span><h2>${item.title}</h2></header><div class="component-demo">${item.html}</div><footer class="component-footer"><span>${item.subtitle}</span><button class="map-button" data-map="${item.id}" aria-label="查看${item.title}的 LVGL 映射">LVGL ↗</button></footer></article>`).join('');
    $('#result-count').textContent=`${filtered.length} 个组件`;$('#no-results').hidden=filtered.length!==0;
    $('#active-category').textContent=categories.find(c=>c[0]===state.category)[1]+' / COLLECTION';hydrate($('#component-grid'));
  }
  function renderCategories() {
    $('#category-nav').innerHTML=categories.map(([id,label,icon])=>`<button class="nav-item category-item ${id===state.category?'active':''}" data-category="${id}" aria-pressed="${id===state.category}"><span>${icon}</span>${label}<small>${id==='all'?items.length:items.filter(item=>item.category===id).length}</small></button>`).join('');
    $('#nav-count').textContent=items.length;
    window.TactileControls.hydrate($('#category-nav'));
    $('#mobile-category').innerHTML=categories.map(([id,label])=>`<option value="${id}" ${state.category===id?'selected':''}>${label}</option>`).join('');window.TactileControls.refreshDropdown($('#mobile-category'));
  }
  function setView(view) {
    state.view=view;$$('.view').forEach(node=>{node.hidden=node.id!==view+'-view';});
    $$('#view-nav button').forEach(button=>{button.classList.toggle('active',button.dataset.view===view);button.setAttribute('aria-pressed',String(button.dataset.view===view));});
    $('#view-title').textContent=titles[view][0];$('#view-description').textContent=titles[view][1];
    $('.searchbox').hidden=view!=='components';
    if(view==='device')fitDevice();
  }
  function setTheme(theme) {
    if(!['blue','silver','graphite','warm','avocado'].includes(theme))theme='blue';state.theme=theme;
    document.documentElement.dataset.theme=theme;
    $$('.themes button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeValue===theme)));
    try{localStorage.setItem('tactile-personal-theme',theme);}catch{}
    renderTokens();
  }
  function openDialog(title,content,actions=[]) {
    priorFocus=document.activeElement;$('#dialog-title').textContent=title;$('#dialog-content').replaceChildren();
    if(typeof content==='string')$('#dialog-content').innerHTML=content;else $('#dialog-content').appendChild(content);
    $('#dialog-actions').replaceChildren();
    actions.forEach(({label,primary,onClick})=>{const button=document.createElement('button');button.className='btn'+(primary?' primary':'');button.textContent=label;button.addEventListener('click',onClick||closeDialog);$('#dialog-actions').appendChild(button);});
    window.TactileControls.hydrate($('#demo-dialog'));window.TactileIcons.normalize($('#demo-dialog'));$('#demo-dialog').showModal();
  }
  function closeDialog() {$('#demo-dialog').close();}
  $('#demo-dialog').addEventListener('close',()=>{if(priorFocus?.isConnected)priorFocus.focus();});
  $('#demo-dialog').addEventListener('click',event=>{if(event.target===$('#demo-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
  function openMapping(id) {
    const item=items.find(item=>item.id===id);const body=document.createElement('div');
    const description=document.createElement('p');description.textContent=`${item.title}：${item.subtitle}。`;
    const pre=document.createElement('pre');pre.className='well';pre.textContent=`LVGL 9.x 控件映射\n${item.lvgl}\n\n共享样式\n底板 → 套框 → 内槽 → 操作面\nLV_PART_MAIN / INDICATOR / KNOB\nLV_STATE_PRESSED / CHECKED / DISABLED`;
    const notes=document.createElement('p');notes.textContent=item.notes||'使用共享颜色、圆角和状态样式。复杂内阴影按实际硬件选择对象分层、预渲染资源或轻量近似，不直接照搬 CSS。';
    body.append(description,pre,notes);openDialog(`${item.title} · LVGL 映射`,body,[{label:'知道了'}]);
  }
  function openDrawer() {drawerFocus=document.activeElement;$('#demo-drawer').hidden=false;$('#drawer-backdrop').hidden=false;$('.workspace').inert=true;$('.sidebar').inert=true;$('#close-drawer').focus();}
  function closeDrawer() {$('#demo-drawer').hidden=true;$('#drawer-backdrop').hidden=true;$('.workspace').inert=false;$('.sidebar').inert=false;if(drawerFocus?.isConnected)drawerFocus.focus();}
  $('#close-drawer').addEventListener('click',closeDrawer);$('#drawer-backdrop').addEventListener('click',closeDrawer);
  function updateStepper(group) {const input=group.querySelector('input');let value=Number(input.value);const min=Number(input.min),max=Number(input.max);if(!Number.isFinite(value))value=min;value=Math.min(max,Math.max(min,value));input.value=value;group.querySelector('[data-step="-1"]').disabled=value<=min;group.querySelector('[data-step="1"]').disabled=value>=max;}
  function renderPage() {
    const statusBadge='<span class="badge success"><i class="status-dot"></i>运行正常</span>';
    if(state.page==='dashboard')$('#page-preview').innerHTML=`<div class="page-canvas"><div class="page-header"><div><p class="overline">STUDIO / DEVICE OVERVIEW</p><h2>设备仪表台</h2><p>今天，让每一台设备都在正确的状态。</p></div>${ui.btn('连接新设备 +','primary','data-toast="已打开新设备连接入口（演示）"')}</div><div class="page-stats"><div class="surface stat"><span class="small muted">在线设备</span><strong>03 <small>/ 04</small></strong><small>✓ 全部运行正常</small></div><div class="surface stat"><span class="small muted">平均负载</span><strong>46.8<small>%</small></strong><small>↓ 8.2% 较昨日</small></div><div class="surface stat"><span class="small muted">运行时长</span><strong>128.6<small> h</small></strong><small>↑ 12.8% 较上周</small></div></div><div class="page-columns"><div class="page-card"><div class="row spread page-subheading"><span>负载趋势</span><span class="muted small">最近 7 天</span></div>${ui.chart.replace('class="chart"','class="chart page-chart"')}<hr class="divider"><table class="data-table"><thead><tr><th>设备</th><th>状态</th><th>负载</th></tr></thead><tbody><tr><td>Studio Hub 01</td><td>在线</td><td>72%</td></tr><tr><td>Audio Dock 02</td><td>待机</td><td>18%</td></tr><tr><td>Ambient Light 03</td><td>在线</td><td>46%</td></tr></tbody></table></div><div class="surface col"><div class="row spread page-subheading"><span>快速控制</span>${statusBadge}</div>${ui.slider('page-level','环境亮度',65)}<hr class="divider"><div class="row spread small"><span>专注模式</span>${ui.toggle('页面专注模式')}</div><div class="row spread small"><span>夜间静音</span>${ui.toggle('页面夜间静音',false)}</div>${ui.btn('查看设备详情 →','','data-drawer')}</div></div></div>`;
    if(state.page==='assistant')$('#page-preview').innerHTML=`<div class="page-canvas"><div class="row spread"><span class="small">✦ 创作工作台</span><span class="badge">灵感模式</span></div><div class="assistant-hero"><h2>今天，想从哪里开始？</h2><p>让一个好想法，慢慢变成可以触摸的产品。</p></div><div class="conversation" id="assistant-conversation" aria-live="polite"></div><form class="composer" id="assistant-form"><label class="sr-only" for="assistant-input">描述你的想法</label><textarea id="assistant-input" placeholder="描述你的产品想法…" required></textarea><div class="row spread composer-toolbar"><div class="row">${ui.btn('+ 参考图','secondary sm','type="button" data-toast="参考图入口示例"')}${ui.toolsMenu()}</div><div class="row"><select class="select" aria-label="工作模式" style="width:90px"><option>快速</option><option>思考</option><option>精细</option></select>${ui.btn('发送 ↗','primary','type="submit"')}</div></div></form><div class="suggestions">${['设计网页','设备控制台','生成组件','整理风格'].map(text=>ui.btn(text,'pill','data-suggestion="'+text+'"')).join('')}</div></div>`;
    if(state.page==='settings')$('#page-preview').innerHTML=`<div class="page-canvas"><div class="page-header"><div><h2>你的产品，按你的习惯。</h2><p>统一设置，保留精细的控制。</p></div>${ui.btn('保存设置','primary','data-toast="当前页面设置已保存（演示）"')}</div><div class="settings-layout"><div class="menu-list well" data-exclusive><button aria-pressed="true">基本设置</button><button aria-pressed="false">设备连接</button><button aria-pressed="false">高级参数</button></div><div><div class="setting-row"><div><h3>设备名称</h3><p>显示在工作台中的识别名称</p></div><input class="field" value="Studio Hub 01" aria-label="设备名称" style="width:160px"></div><div class="setting-row"><div><h3>界面语言</h3><p>设备与网页使用统一语言</p></div><select class="select" aria-label="界面语言"><option>简体中文</option><option>English</option></select></div><div class="setting-row"><div><h3>自动同步</h3><p>参数变化后自动同步到设备</p></div>${ui.toggle('设置页自动同步')}</div><div class="setting-row"><div><h3>提示音</h3><p>操作完成时播放轻量提示</p></div>${ui.toggle('设置页提示音',false)}</div><div class="setting-row"><div><h3>屏幕亮度</h3><p>适配当前环境的可读性</p></div><input class="slider" type="range" min="0" max="100" value="70" aria-label="设置页屏幕亮度"></div></div></div></div>`;
    hydrate($('#page-preview'));
  }
  function renderDevice() {
    const top=`<div class="device-top"><span class="device-title">${{control:'Studio 控制台',settings:'系统设置',audio:'音频工作台'}[state.devicePage]}</span><span><i class="online-dot"></i>已连接 · 09:41</span></div>`;
    const nav=`<nav class="device-nav" aria-label="设备屏幕导航">${[['control','◫ 控制'],['settings','☷ 设置'],['audio','◌ 音频']].map(([id,label])=>`<button data-device-page="${id}" aria-pressed="${state.devicePage===id}">${label}</button>`).join('')}</nav>`;
    let content='';
    if(state.devicePage==='control')content=`<div class="device-content"><section class="surface"><div class="row spread"><h3>环境控制</h3><span class="badge success">舒适</span></div><div class="row spread" style="margin:12px 0 20px"><div><div class="reading-number">24.5 <span class="small">°C</span></div><p class="small muted" style="margin-top:8px">当前温度 · 稳定</p></div><div class="ring-meter" style="--progress:64%;width:92px;height:92px" role="meter" aria-label="空气湿度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64"><div class="ring-center"><strong>64%</strong><small>空气湿度</small></div></div></div>${ui.slider('device-brightness','屏幕亮度',65)}<div class="row spread small" style="margin-top:15px"><span>自动调节</span>${ui.toggle('设备自动调节')}</div></section><section class="well"><h3>音量与运行</h3>${ui.knob('device-volume',60)}<div class="row spread" style="margin-top:23px"><span class="small muted">设备状态 · 待机</span>${ui.btn('启动运行','primary','data-device-run aria-pressed="false"')}</div></section></div>`;
    if(state.devicePage==='settings')content=`<div class="device-content"><section class="surface"><h3>显示设置</h3><div class="setting-row"><div><h3>自动亮度</h3><p>跟随环境变化</p></div>${ui.toggle('设备自动亮度')}</div><div class="setting-row"><div><h3>操作提示音</h3><p>轻量反馈</p></div>${ui.toggle('设备提示音',false)}</div><div class="setting-row"><div><h3>待机休眠</h3><p>节约功耗</p></div>${ui.toggle('设备待机休眠')}</div></section><section class="well"><h3>设备信息</h3><dl class="property-list"><div><dt>型号</dt><dd>Studio TH-800</dd></div><div><dt>分辨率</dt><dd>800 × 480</dd></div><div><dt>图形框架</dt><dd>LVGL 9.x</dd></div><div><dt>固件</dt><dd>样式演示</dd></div></dl>${ui.btn('保存设置','primary','data-toast="设备设置已保存（演示）"')}</section></div>`;
    if(state.devicePage==='audio')content=`<div class="device-content"><section class="surface"><h3>主音量</h3><div class="row" style="justify-content:center;margin-top:20px">${ui.knob('device-audio-volume',70)}</div><div class="row spread small" style="margin-top:25px"><span>静音模式</span>${ui.toggle('设备音频静音',false)}</div></section><section class="well"><h3>声音设置</h3>${ui.slider('device-bass','低频',55)}<div style="height:17px"></div>${ui.slider('device-treble','高频',65)}<div style="height:17px"></div><div class="segmented" data-exclusive><button aria-pressed="true">均衡</button><button aria-pressed="false">人声</button><button aria-pressed="false">音乐</button></div></section></div>`;
    $('#device-screen').innerHTML=top+content+nav;hydrate($('#device-screen'));
    $$('.device-tools [data-device-page]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.devicePage===state.devicePage)));fitDevice();
  }
  function fitDevice(){if($('#device-view').hidden)return;const frame=$('.device-frame'),screen=$('#device-screen');const width=$('#device-pixel').checked?848:Math.min(848,$('.device-scroll').clientWidth-20);frame.style.width=width+'px';const scale=Math.max(.15,(width-44)/800);screen.style.transform=`scale(${scale})`;frame.style.height=(480*scale+44)+'px';}
  function materialGuide(){return `<section class="material-guide"><h2>凹凸按用途分配，选中按状态升起</h2><p>底板平，模块浅凸；能按压的面凸起，承托与显示窗口凹下。选择组的槽体不动，只有选中项升起。</p><div class="material-guide-grid"><article><h3>平面 / 页面与内容</h3><div class="material-flat material-example">正文、辅助文字与菜单内容</div><p>保持清楚的排版，不给每一行内容加投影。</p></article><article><h3>浅凸 / 模块外壳</h3><div class="surface material-example">卡片 · 面板 · 设备底座</div><p>外壳倒角与轻投影，层次低于操作按钮。</p></article><article><h3>凸起 / 动作与选中项</h3><div class="material-example material-action">${ui.btn('执行动作')}<div class="segmented" data-exclusive><button aria-pressed="false">选项 A</button><button aria-pressed="true">选项 B</button></div></div><p>普通动作按钮凸起；选择项未选中保持原面，选中使用圆帽凸面。</p></article><article><h3>凹下 / 输入与承托</h3><div class="well material-example">输入槽 · 数据窗口 · 轨道</div><p>渐变槽缘、深内影和底部反光。圆帽在轨道上，进度色在槽内。</p></article></div></section>`;}
  function renderTokens() {
    const colors=[['底板','--bg'],['操作面','--face'],['套框','--cap'],['凹槽','--well-bg'],['阴影','--shade'],['状态强调','--accent']];
    const computed=getComputedStyle(document.documentElement);
    $('#token-preview').innerHTML=materialGuide()+`<div class="token-grid"><section class="token-panel"><h2>01 / 颜色与材质</h2>${colors.map(([label,token])=>`<div class="color-token"><i style="background:var(${token})"></i><span>${label}</span><code>${computed.getPropertyValue(token).trim()}</code></div>`).join('')}</section><section class="token-panel"><h2>02 / 字体与层级</h2><div class="type-display">让界面，有一点触感。</div><div class="type-heading">清楚的标题，安静的正文。</div><div class="type-body">用字重、字号和留白组织信息。让精致材质落在关键控件上，正文依然容易阅读。</div><div class="type-caption">正文使用清晰的无衬线字体，读数使用等宽数字。</div></section><section class="token-panel"><h2>03 / 凹凸结构与状态</h2><div class="row wrap" style="padding:7px 0 24px">${ui.btn('凸起操作面')}${ui.btn('选中凸面','','aria-pressed="true"')}<div class="well small">深凹槽</div></div><ul class="token-notes"><li>顶部或左上光源；音量旋钮允许使用左侧光源。</li><li>按下缩短按钮投影，保留凸面结构；轨道始终凹下。指针旋转时环境光保持固定。</li><li>普通反馈 160–260ms，拖动即时更新；运行态才使用扫光。</li></ul></section><section class="token-panel"><h2>04 / 尺度与布局</h2><div class="space-tokens">${[4,8,12,16,24,32,48].map(n=>`<div><i style="--space:${n}px"></i>${n}</div>`).join('')}</div><ul class="token-notes" style="margin-top:20px"><li>网页以弹性布局适配窄屏；设备屏按 800×480 的固定坐标与触控目标设计。</li><li>按钮常用 40–48px；设备重要触控目标优先 44px 以上。</li><li>同类组件复用统一的圆角、间距与触控尺寸。</li></ul></section></div>`;
    window.TactileControls.hydrate($('#token-preview'));
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.hasAttribute('data-toast')){event.preventDefault();toast(target.dataset.toast);}
    if(target.dataset.view)setView(target.dataset.view);
    if(target.dataset.category){state.category=target.dataset.category;state.query='';$('#component-search').value='';renderCategories();renderCards();setView('components');}
    if(target.dataset.themeValue)setTheme(target.dataset.themeValue);
    if(target.dataset.map)openMapping(Number(target.dataset.map));
    if(target.hasAttribute('data-close-dialog'))closeDialog();
    if(target.hasAttribute('data-drawer'))openDrawer();
    if(target.dataset.page){state.page=target.dataset.page;setPressedGroup($('.page-tabs'),target);renderPage();}
    if(target.dataset.devicePage){state.devicePage=target.dataset.devicePage;renderDevice();}
    if(target.hasAttribute('data-toggle-pressed')){const enabled=target.getAttribute('aria-pressed')!=='true';target.setAttribute('aria-pressed',String(enabled));if(target.getAttribute('aria-label')==='收藏'){target.innerHTML=window.TactileIcons.icon(enabled?'★':'☆');window.TactileControls.frameIconButton(target);}const output=target.closest('.component-demo')?.querySelector('[data-local-status]');if(output)output.textContent=enabled?'已锁定':'未锁定';}
    if(target.hasAttribute('data-loading')&&!target.disabled){target.disabled=true;const original=target.textContent;target.innerHTML='<span class="spinner"></span>正在同步';window.TactileControls.frameButton(target);const output=target.closest('.component-demo').querySelector('[data-local-status]');output.textContent='正在同步 · 演示';later(()=>{target.textContent=original;window.TactileControls.frameButton(target);target.disabled=false;output.textContent='同步完成 · 演示';toast('设备同步完成（演示）');},1200);}
    if(target.hasAttribute('data-password')){const input=target.parentElement.querySelector('input');const shown=input.type==='password';input.type=shown?'text':'password';target.setAttribute('aria-pressed',String(shown));target.setAttribute('aria-label',shown?'隐藏密码':'显示密码');}
    if(target.hasAttribute('data-remove-chip'))target.closest('.chip').remove();
    if(target.hasAttribute('data-upload-pick'))target.closest('.dropzone').querySelector('[data-upload]').click();
    if(target.hasAttribute('data-upload-clear')){const input=target.closest('.dropzone').querySelector('[data-upload]');input.value='';showUpload(input);}
    if(target.hasAttribute('data-add-chip')){const chips=target.parentElement.querySelector('.chips');const chip=document.createElement('span');chip.className='chip';chip.append('新标签 ');const close=document.createElement('button');close.textContent='×';close.setAttribute('data-remove-chip','');close.setAttribute('aria-label','移除新标签');chip.append(close);chips.append(chip);window.TactileIcons.normalize(chips);}
    if(target.dataset.step){const group=target.closest('.number-input');const input=group.querySelector('input');input.value=Number(input.value)+Number(target.dataset.step);updateStepper(group);}
    if(target.hasAttribute('data-popover')){const panel=target.closest('.popover-wrap').querySelector('.popover-panel');panel.hidden=!panel.hidden;target.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){const rect=target.getBoundingClientRect();panel.classList.toggle('open-up',innerHeight-rect.bottom<panel.offsetHeight+20&&rect.top>panel.offsetHeight+20);}}
    if(target.dataset.tabContent){setPressedGroup(target.parentElement,target,'aria-selected');target.closest('.col').querySelector('.tab-content').textContent=target.dataset.tabContent;}
    const exclusive=target.closest('[data-exclusive]');if(exclusive&&target.hasAttribute('aria-pressed')){setPressedGroup(exclusive,target);const output=exclusive.closest('.component-demo')?.querySelector('[data-local-status]');if(output)output.textContent='当前：'+target.textContent;}
    if(target.closest('[data-pagination]')){const group=target.closest('[data-pagination]');const current=Number(group.querySelector('[aria-pressed="true"]').dataset.pageNumber);let next=target.dataset.pageNumber?Number(target.dataset.pageNumber):target.hasAttribute('data-page-prev')?Math.max(1,current-1):Math.min(3,current+1);const selected=group.querySelector(`[data-page-number="${next}"]`);setPressedGroup(group,selected);group.querySelectorAll('[data-page-number]').forEach(button=>button.removeAttribute('aria-current'));selected.setAttribute('aria-current','page');group.parentElement.querySelector('[data-local-status]').textContent=`第 ${next} 页`;}
    if(target.hasAttribute('data-next-step')){const steps=target.parentElement.querySelectorAll('.step');let current=[...steps].filter(step=>step.classList.contains('active')).length;steps.forEach((step,index)=>step.classList.toggle('active',index<(current===steps.length?1:current+1)));}
    if(target.hasAttribute('data-sort')){const tbody=target.closest('table').tBodies[0];const rows=[...tbody.rows];const ascending=target.dataset.order!=='asc';rows.sort((a,b)=>a.cells[0].textContent.localeCompare(b.cells[0].textContent)*(ascending?1:-1));rows.forEach(row=>tbody.appendChild(row));target.dataset.order=ascending?'asc':'desc';target.textContent=`设备名称 ${ascending?'↑':'↓'}`;window.TactileIcons.normalize(target.closest('table'));target.closest('th').setAttribute('aria-sort',ascending?'ascending':'descending');}
    if(target.hasAttribute('data-progress-step')){const demo=target.closest('.component-demo');const progress=demo.querySelector('.progress');const current=Number(progress.getAttribute('aria-valuenow'));const next=current===100?0:Math.min(100,current+12);progress.style.setProperty('--progress',next+'%');progress.style.setProperty('--progress-ratio',next/100);progress.setAttribute('aria-valuenow',next);demo.querySelector('[data-progress-output]').textContent=next+'%';}
    if(target.hasAttribute('data-status-toggle')){const parent=target.closest('.component-demo');const line=parent.querySelector('[data-status-light]');const offline=line.classList.toggle('off');line.querySelector('span').textContent=offline?'设备未连接':'连接正常';if(target.textContent==='断开'||target.textContent==='连接'){target.textContent=offline?'连接':'断开';window.TactileControls.frameButton(target);}}
    if(target.dataset.modal==='confirm')openDialog('应用当前配置？','<p>确认后将应用当前配置。</p>',[{label:'取消'},{label:'确认应用',primary:true,onClick:()=>{closeDialog();toast('配置已应用（演示）');}}]);
    if(target.dataset.modal==='command'){openDialog('搜索操作','<label class="field-label">输入组件或操作名称<input class="field" id="command-query" placeholder="例如：旋钮、设置、按钮"></label><div class="menu-list" id="command-results" style="margin-top:15px"></div>',[{label:'关闭'}]);renderCommands('');$('#command-query').focus();}
    if(target.dataset.commandId){const id=Number(target.dataset.commandId);closeDialog();state.category='all';state.query='';$('#component-search').value='';renderCategories();renderCards();setView('components');const card=$(`[data-component="${id}"]`);card.scrollIntoView({block:'center'});card.querySelector('.map-button').focus();}
    if(target.hasAttribute('data-launch')){const running=target.getAttribute('aria-pressed')!=='true';target.setAttribute('aria-pressed',String(running));target.querySelector('[data-launch-label]').textContent=running?'运行中':'启动';target.closest('.component-demo').querySelector('[data-local-status]').textContent=running?'正在运行 · 演示':'待机';}
    if(target.dataset.direction){const pad=target.closest('.direction-pad');setPressedGroup(pad,target);pad.dataset.selected={上:'up',下:'down',左:'left',右:'right'}[target.dataset.direction];pad.parentElement.querySelector('[data-local-status]').textContent='已选择：向'+target.dataset.direction;}
    if(target.dataset.roller){setPressedGroup(target.parentElement,target);target.closest('.component-demo').querySelector('[data-local-status]').textContent='当前：'+String(target.dataset.roller).padStart(2,'0')+' 档';}
    if(target.dataset.key){const output=target.closest('.component-demo').querySelector('[data-keypad-output]');const current=output.textContent;output.textContent=target.dataset.key==='C'?'0':target.dataset.key==='⌫'?current.slice(0,-1)||'0':current==='0'?target.dataset.key:(current+target.dataset.key).slice(0,8);}
    if(target.hasAttribute('data-device-run')){const running=target.getAttribute('aria-pressed')!=='true';target.setAttribute('aria-pressed',String(running));target.textContent=running?'停止运行':'启动运行';window.TactileControls.frameButton(target);target.parentElement.querySelector('span').textContent=running?'设备状态 · 运行中':'设备状态 · 待机';}
    if(target.dataset.suggestion){$('#assistant-input').value=target.dataset.suggestion;$('#assistant-input').focus();}
    $$('.popover-wrap').forEach(wrap=>{if(!wrap.contains(target)){wrap.querySelector('.popover-panel').hidden=true;wrap.querySelector('[data-popover]').setAttribute('aria-expanded','false');}});
  });
  function renderCommands(query){const found=items.filter(item=>item.title.includes(query)||item.lvgl.toLowerCase().includes(query.toLowerCase())).slice(0,8);$('#command-results').replaceChildren();found.forEach(item=>{const button=document.createElement('button');button.dataset.commandId=item.id;button.textContent=item.title+' ↗';$('#command-results').append(button);});if(!found.length)$('#command-results').textContent='没有匹配的操作';}
  document.addEventListener('input',event=>{
    const input=event.target;if(input.id==='component-search'){state.query=input.value;renderCards();}
    if(input.classList.contains('slider')&&!['range-low','range-high'].includes(input.id))paintRange(input);
    if(input.id==='range-low'||input.id==='range-high'){const low=$('#range-low'),high=$('#range-high');if(Number(low.value)>Number(high.value)){if(input===low)low.value=high.value;else high.value=low.value;}paintRange(low);paintRange(high);$('#range-pair-output').textContent=`${low.value}–${high.value}`;}
    if(input.hasAttribute('data-character-count'))input.closest('.field-label').querySelector('[data-character-output]').textContent=`${input.value.length} / ${input.maxLength}`;
    if(input.id==='command-query')renderCommands(input.value);
    if(input.closest('.eq-column')){paintRange(input);input.closest('.eq-column').querySelector('output').textContent=input.value+'%';}
  });
  document.addEventListener('change',event=>{
    const input=event.target;
    if(input.id==='mobile-category'){state.category=input.value;state.query='';$('#component-search').value='';renderCategories();renderCards();}
    if(input.id==='compact-toggle')$('#component-grid').classList.toggle('compact',input.checked);
    if(input.id==='device-pixel')fitDevice();
    if(input.hasAttribute('data-select-status'))input.closest('.field-label').querySelector('[data-local-status]').textContent='当前：'+input.value;
    if(input.hasAttribute('data-toggle-label')){const indicator=input.closest('.toggle-control').querySelector('.toggle-state');indicator.textContent=input.checked?'开':'关';indicator.classList.toggle('on',input.checked);indicator.classList.toggle('off',!input.checked);const output=input.closest('.component-demo')?.querySelector('[data-local-status]');if(output)output.textContent=`${input.dataset.toggleLabel} · ${input.checked?'已开启':'已关闭'}`;}
    if(input.hasAttribute('data-upload'))showUpload(input);
    if(input.closest('.number-input'))updateStepper(input.closest('.number-input'));
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='assistant-form'){event.preventDefault();const input=$('#assistant-input');const message=input.value.trim();if(!message)return;const conversation=$('#assistant-conversation');for(const [text,mine] of [[message,true],['已收到你的想法，可以继续补充页面内容与交互需求。',false]]){const bubble=document.createElement('div');bubble.className='bubble'+(mine?' mine':'');bubble.textContent=text;conversation.appendChild(bubble);}input.value='';}
  });
  document.addEventListener('click',event=>{const zone=event.target.closest('.dropzone');if(zone&&!event.target.closest('button,input'))zone.querySelector('[data-upload]').click();});
  document.addEventListener('dragover',event=>{const zone=event.target.closest('.dropzone');if(!zone)return;event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';zone.classList.add('drag-over');});
  document.addEventListener('dragleave',event=>{const zone=event.target.closest('.dropzone');if(zone&&!zone.contains(event.relatedTarget))zone.classList.remove('drag-over');});
  document.addEventListener('drop',event=>{const zone=event.target.closest('.dropzone');if(!zone)return;event.preventDefault();zone.classList.remove('drag-over');if(!event.dataTransfer?.files.length)return;const input=zone.querySelector('[data-upload]'),transfer=new DataTransfer();transfer.items.add(event.dataTransfer.files[0]);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){$$('.popover-panel').forEach(panel=>{panel.hidden=true;panel.parentElement.querySelector('[data-popover]').setAttribute('aria-expanded','false');});if(!$('#demo-drawer').hidden)closeDrawer();}
    if(event.key==='Tab'&&!$('#demo-drawer').hidden){const focusable=[...$('#demo-drawer').querySelectorAll('button,a,input,[tabindex="0"]')];if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus();}}
    const tab=event.target.closest('[role="tab"]');if(tab&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const tabs=[...tab.parentElement.children];const offset=event.key==='ArrowRight'?1:-1;const next=tabs[(tabs.indexOf(tab)+offset+tabs.length)%tabs.length];next.click();next.focus();}
    if(event.target.id==='command-query'&&['ArrowDown','Enter'].includes(event.key)){const first=$('#command-results button');if(first){event.preventDefault();first.focus();if(event.key==='Enter')first.click();}}
    if(event.target.hasAttribute('data-command-id')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();const buttons=[...$('#command-results').children];const offset=event.key==='ArrowDown'?1:-1;buttons[(buttons.indexOf(event.target)+offset+buttons.length)%buttons.length].focus();}
  });
  document.addEventListener('click',event=>{
    $$('.popover-wrap').forEach(wrap=>{const panel=wrap.querySelector('.popover-panel');if(!wrap.contains(event.target)||event.target.closest('.popover-panel button')){panel.hidden=true;wrap.querySelector('[data-popover]').setAttribute('aria-expanded','false');}});
  });
  let dragging=null;
  document.addEventListener('pointerdown',event=>{const rotary=event.target.closest('.rotary');if(!rotary)return;if(event.button!==0)return;const input=document.getElementById(rotary.dataset.range);dragging={rotary,input,startY:event.clientY,startValue:Number(input.value)};rotary.setPointerCapture(event.pointerId);event.preventDefault();});
  document.addEventListener('pointermove',event=>{if(!dragging)return;dragging.input.value=Math.min(100,Math.max(0,Math.round(dragging.startValue+(dragging.startY-event.clientY)/1.6)));paintRange(dragging.input);});
  function stopDragging(){dragging=null;}document.addEventListener('pointerup',stopDragging);document.addEventListener('pointercancel',stopDragging);document.addEventListener('lostpointercapture',stopDragging);
  $('#reset-demo').addEventListener('click',()=>{temporaryTimers.forEach(clearTimeout);temporaryTimers.clear();state.category='all';state.query='';$('#component-search').value='';$('#compact-toggle').checked=false;$('#component-grid').classList.remove('compact');renderCategories();renderCards();renderPage();renderDevice();toast('预览已重置，保留当前主题');});
  window.addEventListener('resize',fitDevice);
  const initialCategory=location.hash.slice(1);if(categories.some(category=>category[0]===initialCategory))state.category=initialCategory;
  renderCategories();renderCards();renderPage();renderDevice();window.TactileControls.hydrate(document);window.TactileIcons.normalize(document);
  let savedTheme='blue';try{savedTheme=localStorage.getItem('tactile-personal-theme')||'blue';}catch{}setTheme(savedTheme);
})();
