'use strict';
(() => {
  const paths = {
    '✓':'<path d="m5 12 4 4L19 6"/>',
    '↑':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
    '↕':'<path d="M12 3v18m-4-4 4 4 4-4M8 7l4-4 4 4"/>',
    '△':'<path d="m12 3 10 18H2Z"/><path d="M12 9v5M12 17h.01"/>',
    '↗':'<path d="M6 18 18 6M6 6h12v12"/>',
    '+':'<path d="M12 5v14M5 12h14"/>',
    '−':'<path d="M5 12h14"/>',
    '×':'<path d="m6 6 12 12M18 6 6 18"/>',
    '‹':'<path d="m15 5-7 7 7 7"/>',
    '›':'<path d="m9 5 7 7-7 7"/>',
    '⌃':'<path d="m5 15 7-7 7 7"/>',
    '⌄':'<path d="m5 9 7 7 7-7"/>',
    '⌕':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    '☷':'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="18" r="2" fill="currentColor"/>',
    '◫':'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 4v16M10 10h10"/>',
    '◌':'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    '▣':'<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    '▱':'<path d="M3 7h6l2-2h10v15H3Z"/>',
    '▤':'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    '◈':'<path d="m12 3 9 9-9 9-9-9Z"/><path d="m12 8 4 4-4 4-4-4Z"/>',
    '▥':'<path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7"/>',
    '⌘':'<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M7 7H5a2 2 0 1 1 2-2ZM17 7V5a2 2 0 1 1 2 2ZM17 17h2a2 2 0 1 1-2 2ZM7 17v2a2 2 0 1 1-2-2Z"/>',
    '◉':'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    '☆':'<path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.5l-5.6 2.9 1.1-6.3-4.6-4.5 6.3-.9Z"/>',
    '★':'<path fill="currentColor" d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.5l-5.6 2.9 1.1-6.3-4.6-4.5 6.3-.9Z"/>',
    '?':'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
    '⇧':'<path d="m6 9 6-6 6 6M12 3v12M4 15v6h16v-6"/>',
    '↶':'<path d="M4 10h9a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5" transform="translate(0 -3)"/>',
    '↷':'<path d="M20 10h-9a6 6 0 0 0 0 12M20 10l-5-5M20 10l-5 5" transform="translate(0 -3)"/>',
    '↻':'<path d="M20 11a8 8 0 1 0-1 5M20 4v7h-7"/>',
    '⌫':'<path d="M9 5h12v14H9l-7-7Z"/><path d="m12 9 6 6M18 9l-6 6"/>',
    '→':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    '↓':'<path d="M12 4v16m-6-6 6 6 6-6"/>'
  };
  const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function icon(char) {return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[char]}</svg>`;}
  const pattern = new RegExp('(['+Object.keys(paths).map(c=>c.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&')).join('')+'])','u');
  function label(text) {return text.split(pattern).map(part=>paths[part]?icon(part):part.trim()?`<span class="control-label">${escape(part.trim())}</span>`:'').join('');}
  function normalize(root) {
    root.querySelectorAll('.icon-btn,.direction-pad button,.btn,.btn-face,.chip button,.device-nav button,.nav-item>span,.dock button>span,.launch-face>span:first-child,.device-tile-icon,.empty-icon,.searchbox>span,.step i,.data-table th button').forEach(node=>{
      if(node.childElementCount===0&&[...node.textContent].some(c=>paths[c])){
        if(!node.getAttribute('aria-label')&&node.tagName==='BUTTON'&&Object.keys(paths).includes(node.textContent.trim()))node.setAttribute('aria-label',node.textContent.trim());
        node.innerHTML=label(node.textContent);
      }
    });
    root.querySelectorAll('.menu-list button,.tree summary,.tree details>div,.alert,.toast-example>span,.toast button').forEach(node=>{
      for(const child of [...node.childNodes])if(child.nodeType===Node.TEXT_NODE&&pattern.test(child.textContent)){
        const fragment=document.createElement('template');fragment.innerHTML=label(child.textContent);child.replaceWith(fragment.content);
      }
    });
  }
  window.TactileIcons={icon,label,normalize};
})();
