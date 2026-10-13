'use strict';
(() => {
  let counter=0;
  function closeDropdown(dropdown,returnFocus=false) {
    const trigger=dropdown.querySelector('.dropdown-trigger');dropdown.querySelector('.dropdown-menu').hidden=true;trigger.setAttribute('aria-expanded','false');if(returnFocus)trigger.focus();
  }
  function openDropdown(dropdown,focusOption=false) {
    document.querySelectorAll('.dropdown').forEach(other=>{if(other!==dropdown)closeDropdown(other);});
    const trigger=dropdown.querySelector('.dropdown-trigger'),menu=dropdown.querySelector('.dropdown-menu');menu.hidden=false;trigger.setAttribute('aria-expanded','true');
    const rect=trigger.getBoundingClientRect();menu.classList.toggle('open-up',innerHeight-rect.bottom<menu.offsetHeight+20&&rect.top>menu.offsetHeight+20);
    if(focusOption)(menu.querySelector('[aria-selected="true"]')||menu.querySelector('button:not(:disabled)'))?.focus();
  }
  function createDropdown(select) {
    if(select.dataset.tactileDropdown)return;
    select.dataset.tactileDropdown='true';
    const wrapper=document.createElement('div');wrapper.className='dropdown';if(select.style.width){wrapper.style.width=select.style.width;select.style.width='100%';}
    const trigger=document.createElement('button');trigger.type='button';trigger.className='dropdown-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.disabled=select.disabled;
    const label=select.getAttribute('aria-label')||select.closest('.field-label')?.firstChild?.textContent?.trim()||'选择选项';trigger.setAttribute('aria-label',label);
    const menu=document.createElement('div');menu.className='dropdown-menu';menu.id=`tactile-dropdown-${++counter}`;menu.setAttribute('role','listbox');menu.setAttribute('aria-label',label);menu.hidden=true;trigger.setAttribute('aria-controls',menu.id);
    function rebuild(){menu.replaceChildren();for(const option of select.options){const button=document.createElement('button');button.type='button';button.className='dropdown-option';button.setAttribute('role','option');button.setAttribute('aria-selected',String(option.selected));button.dataset.value=option.value;button.disabled=option.disabled;button.textContent=option.textContent;button.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));closeDropdown(wrapper,true);});menu.appendChild(button);}update();}
    function update(){const selected=select.selectedOptions[0];trigger.innerHTML=window.TactileIcons.label(selected?.textContent||'请选择')+window.TactileIcons.icon('⌄');menu.querySelectorAll('button').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.value===select.value));});}
    select.addEventListener('change',update);select.before(wrapper);wrapper.append(trigger,menu,select);select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');trigger.addEventListener('click',()=>trigger.getAttribute('aria-expanded')==='true'?closeDropdown(wrapper):openDropdown(wrapper));select.tactileRefresh=rebuild;rebuild();
  }
  function hydrate(root) {
    window.TactileIcons.normalize(root);
    root.querySelectorAll('.select').forEach(createDropdown);
    root.querySelectorAll('.field,.textarea').forEach(field=>{
      if(field.parentElement.classList.contains('recess-frame'))return;
      const rim=document.createElement('span');rim.className='recess-frame';if(field.style.width){rim.style.width=field.style.width;field.style.width='100%';}field.before(rim);rim.appendChild(field);
    });
    root.querySelectorAll('.searchbox,.composer').forEach(container=>{
      if(container.classList.contains('recess-frame'))return;
      const inner=document.createElement('div');inner.className=container.classList.contains('searchbox')?'recess-inner search-inner':'composer-inner';
      while(container.firstChild)inner.appendChild(container.firstChild);container.classList.add('recess-frame');container.appendChild(inner);
      window.TactileIcons.normalize(inner);
      const searchIcon=inner.querySelector('span');if(container.classList.contains('searchbox')&&searchIcon&&searchIcon.childElementCount===0)searchIcon.innerHTML=window.TactileIcons.icon('⌕');
    });
    root.querySelectorAll('.btn').forEach(frameButton);
    root.querySelectorAll('.icon-btn').forEach(frameIconButton);
    root.querySelectorAll('.dock,.device-nav').forEach(frameNavigation);
    root.querySelectorAll('.nav-item').forEach(button=>{
      if(button.firstElementChild?.classList.contains('nav-face'))return;
      const face=document.createElement('span');face.className='nav-face';while(button.firstChild)face.appendChild(button.firstChild);button.appendChild(face);
    });
    root.querySelectorAll('.segmented button').forEach(button=>{
      if(button.firstElementChild?.classList.contains('segment-face'))return;
      const face=document.createElement('span');face.className='segment-face';while(button.firstChild)face.appendChild(button.firstChild);if(!face.childElementCount)face.innerHTML=window.TactileIcons.label(face.textContent);button.appendChild(face);
    });
    root.querySelectorAll('.menu-list button,.roller button,.themes button,.tabs button').forEach(button=>{
      if(button.firstElementChild?.classList.contains('choice-face'))return;
      const face=document.createElement('span');face.className='choice-face';while(button.firstChild)face.appendChild(button.firstChild);if(!face.childElementCount)face.innerHTML=window.TactileIcons.label(face.textContent);button.appendChild(face);
    });
    root.querySelectorAll('.slider,.eq-slider').forEach(input=>{
      if(input.parentElement.classList.contains('range-control'))return;
      const control=document.createElement('span');control.className='range-control'+(input.classList.contains('eq-slider')?' vertical':'');
      const knob=document.createElement('span');knob.className='slider-knob toggle-knob';knob.setAttribute('aria-hidden','true');knob.innerHTML='<span class="toggle-knob-face"></span>';
      const ratio=(Number(input.value)-Number(input.min||0))/(Number(input.max||100)-Number(input.min||0));control.style.setProperty('--range-ratio',ratio);
      input.before(control);control.append(input,knob);
    });
    root.querySelectorAll('.ring-meter').forEach(meter=>{if(meter.querySelector('.ring-collar'))return;const center=meter.querySelector('.ring-center');if(!center)return;const collar=document.createElement('span'),bezel=document.createElement('span');collar.className='ring-collar';bezel.className='ring-value-bezel';bezel.appendChild(center);collar.appendChild(bezel);meter.appendChild(collar);});
    root.querySelectorAll('.progress').forEach(progress=>{progress.style.setProperty('--progress-ratio',Number(progress.getAttribute('aria-valuenow')||72)/100);if(progress.querySelector('.progress-track'))return;const fill=progress.firstElementChild;if(!fill)return;fill.classList.add('progress-fill');const track=document.createElement('span');track.className='progress-track';track.appendChild(fill);progress.appendChild(track);});
  }
  function frameButton(button){if(button.firstElementChild?.classList.contains('btn-face'))return;const face=document.createElement('span');face.className='btn-face';while(button.firstChild)face.appendChild(button.firstChild);if(face.childElementCount===0)face.innerHTML=window.TactileIcons.label(face.textContent);button.appendChild(face);}
  function frameIconButton(button){if(button.firstElementChild?.classList.contains('icon-socket'))return;const socket=document.createElement('span'),cap=document.createElement('span'),face=document.createElement('span');socket.className='icon-socket';cap.className='icon-cap';face.className='icon-face';while(button.firstChild)face.appendChild(button.firstChild);if(face.childElementCount===0)face.innerHTML=window.TactileIcons.label(face.textContent);cap.appendChild(face);socket.appendChild(cap);button.appendChild(socket);}
  function frameNavigation(container){
    if(container.querySelector('.navigation-tray'))return;
    window.TactileIcons.normalize(container);
    const tray=document.createElement('span');tray.className='navigation-tray';
    for(const button of [...container.children]){
      const rim=document.createElement('span'),face=document.createElement('span');rim.className='navigation-key-rim';face.className='navigation-key-face';
      while(button.firstChild)face.appendChild(button.firstChild);
      rim.appendChild(face);button.appendChild(rim);tray.appendChild(button);
    }
    container.appendChild(tray);
  }
  document.addEventListener('click',event=>document.querySelectorAll('.dropdown').forEach(dropdown=>{if(!dropdown.contains(event.target))closeDropdown(dropdown);}));
  document.addEventListener('keydown',event=>{
    const dropdown=event.target.closest('.dropdown');if(!dropdown)return;
    const menu=dropdown.querySelector('.dropdown-menu'),trigger=dropdown.querySelector('.dropdown-trigger');
    if(event.key==='Escape'){event.preventDefault();closeDropdown(dropdown,true);}
    if(event.target===trigger&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openDropdown(dropdown,true);return;}
    if(event.target.classList.contains('dropdown-option')&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const options=[...menu.querySelectorAll('button:not(:disabled)')];const index=options.indexOf(event.target);const next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();}
    if(event.key==='Tab'&&!menu.hidden)closeDropdown(dropdown);
  });
  window.TactileControls={hydrate,closeDropdown,frameButton,frameIconButton,refreshDropdown(select){if(select.tactileRefresh)select.tactileRefresh();else createDropdown(select);}};
})();
