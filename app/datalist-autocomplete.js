/* =========================================================
   COPA MANAGER 2026 — app/datalist-autocomplete.js
   Autocompletado que ignora acentos y signos en los campos con sugerencias (los <input list="…">
   ligados a un <datalist>). El <datalist> nativo del navegador filtra por coincidencia LITERAL, así
   que al escribir "mexico" nunca sugería "México"; aunque al guardar el nombre sí se resolvía bien
   (normLoose), daba la impresión de estar roto. Este motor añade, sin sustituir el datalist, un panel
   propio de sugerencias que coincide sin acentos y, al elegir, escribe el nombre real (con tildes).

   No es intrusivo: se engancha por delegación a TODOS los input[list] presentes o futuros, lee las
   opciones del propio <datalist>, y no requiere tocar cada editor. Script CLÁSICO. Cargar al final,
   junto con app/init.js.
   ========================================================= */
(function(){
  // Normaliza para comparar: sin acentos ni signos. Reusa normLoose si está disponible.
  function norm(s){
    if(typeof normLoose==="function") return normLoose(s||"");
    return (s||"").toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g," ").trim();
  }

  let panel = null;      // el <div> flotante con las sugerencias
  let activeInput = null; // input al que pertenece el panel abierto
  let activeIndex = -1;   // opción resaltada con las flechas

  function ensurePanel(){
    if(panel) return panel;
    panel = document.createElement("div");
    panel.className = "ac-suggest";
    panel.setAttribute("role","listbox");
    Object.assign(panel.style, {
      position:"absolute", zIndex:"99999", display:"none",
      maxHeight:"240px", overflowY:"auto", minWidth:"120px",
      background:"var(--surface, #1b1c24)", color:"var(--ink, #e8e8ef)",
      border:"1px solid var(--border, #2c2e3a)", borderRadius:"8px",
      boxShadow:"0 8px 24px rgba(0,0,0,.35)", padding:"4px",
      font:"13px system-ui, sans-serif"
    });
    document.body.appendChild(panel);
    // Clic en una sugerencia
    panel.addEventListener("mousedown", (e)=>{
      const item = e.target.closest("[data-ac-value]");
      if(!item || !activeInput) return;
      e.preventDefault();
      choose(activeInput, item.dataset.acValue);
    });
    return panel;
  }

  // id del <datalist> asociado. Tras desengancharlo del navegador (detachNative) el atributo "list"
  // ya no existe, así que se guarda en dataset.acList.
  function listIdFor(input){
    return (input.dataset && input.dataset.acList) || input.getAttribute("list") || "";
  }

  // Desactiva el <datalist> NATIVO del navegador para este input, conservando el id de la lista en
  // dataset.acList. El desplegable nativo filtra por coincidencia LITERAL: al escribir "niger" mostraba
  // "Nigeria" pero nunca "Níger", y ese popup nativo se superponía a nuestro panel, dando la impresión
  // de que faltaban países con tilde. Al quitar el atributo "list" el navegador deja de mostrar su
  // propio desplegable y el único que aparece es el nuestro, que compara sin acentos. El <datalist>
  // sigue existiendo en el DOM como fuente de opciones (lo leemos por id).
  function detachNative(input){
    const id = input.getAttribute("list");
    if(id){
      input.dataset.acList = id;
      input.removeAttribute("list");
    }
  }

  // Opciones de un input, leídas de su <datalist>.
  function optionsFor(input){
    const id = listIdFor(input);
    if(!id) return [];
    const dl = document.getElementById(id);
    if(!dl) return [];
    return [...dl.querySelectorAll("option")]
      .map(o=> o.getAttribute("label") || o.value || o.textContent || "")
      .map(s=> s.trim())
      .filter(Boolean);
  }

  function close(){
    if(panel) panel.style.display = "none";
    activeInput = null; activeIndex = -1;
  }

  function choose(input, value){
    input.value = value;
    close();
    // Notifica a los listeners existentes (los editores escuchan "input"/"change").
    input.dispatchEvent(new Event("input", {bubbles:true}));
    input.dispatchEvent(new Event("change", {bubbles:true}));
    input.focus();
  }

  function render(input){
    const q = norm(input.value);
    const opts = optionsFor(input);
    // Con el campo vacío no se muestra nada (deja actuar al datalist nativo si el usuario lo abre).
    if(!q){ close(); return; }
    // Coincidencia sin acentos: primero las que empiezan por el texto, luego las que lo contienen.
    const starts = [], contains = [];
    const seen = new Set();
    for(const name of opts){
      const n = norm(name);
      if(seen.has(name)) continue;
      seen.add(name);
      if(n.startsWith(q)) starts.push(name);
      else if(n.includes(q)) contains.push(name);
    }
    const list = starts.concat(contains).slice(0, 40);
    // Se oculta el panel solo si la única coincidencia es LITERALMENTE idéntica a lo ya escrito (mismo
    // texto, acentos incluidos): en ese caso no hay nada que elegir. Si difiere por acentos/signos
    // (p. ej. escribiste "mexico" y la opción es "México"), el panel se mantiene para que puedas
    // hacer clic e insertar la forma correcta con tilde.
    if(!list.length || (list.length===1 && list[0] === (input.value||""))){ close(); return; }
    const p = ensurePanel();
    p.innerHTML = list.map((name,i)=>
      `<div data-ac-value="${escapeAttr(name)}" role="option" style="padding:6px 9px;border-radius:6px;cursor:pointer;white-space:nowrap;${i===activeIndex?'background:var(--surface-2,#262838);':''}">${escapeHtml2(name)}</div>`
    ).join("");
    positionPanel(input);
    p.style.display = "block";
    activeInput = input;
    if(activeIndex >= list.length) activeIndex = -1;
  }

  function positionPanel(input){
    const r = input.getBoundingClientRect();
    const p = ensurePanel();
    p.style.left = (window.scrollX + r.left) + "px";
    p.style.top  = (window.scrollY + r.bottom + 2) + "px";
    p.style.width = r.width + "px";
  }

  function escapeAttr(s){ return (s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
  function escapeHtml2(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function currentItems(){
    return panel ? [...panel.querySelectorAll("[data-ac-value]")] : [];
  }
  function highlight(i){
    const items = currentItems();
    if(!items.length) return;
    activeIndex = (i + items.length) % items.length;
    items.forEach((el,idx)=>{ el.style.background = idx===activeIndex ? "var(--surface-2,#262838)" : ""; });
    items[activeIndex].scrollIntoView({block:"nearest"});
  }

  // Solo campos ligados a un datalist (con "list" nativo aún puesto, o ya desenganchado en acList).
  function isTarget(el){
    return el && el.tagName==="INPUT" && (el.hasAttribute("list") || !!(el.dataset && el.dataset.acList));
  }

  document.addEventListener("input", (e)=>{
    if(!isTarget(e.target)) return;
    detachNative(e.target);
    activeIndex = -1;
    render(e.target);
  });
  document.addEventListener("focusin", (e)=>{
    if(!isTarget(e.target)) return;
    detachNative(e.target);
    if(e.target.value) render(e.target);
  });
  document.addEventListener("keydown", (e)=>{
    if(!isTarget(e.target) || !panel || panel.style.display==="none") return;
    if(e.key==="ArrowDown"){ e.preventDefault(); highlight(activeIndex+1); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); highlight(activeIndex-1); }
    else if(e.key==="Enter"){
      const items = currentItems();
      if(activeIndex>=0 && items[activeIndex]){ e.preventDefault(); choose(e.target, items[activeIndex].dataset.acValue); }
    }
    else if(e.key==="Escape"){ close(); }
  });
  // Cerrar al salir del campo o al hacer clic fuera.
  document.addEventListener("focusout", (e)=>{ if(isTarget(e.target)) setTimeout(close, 120); });
  document.addEventListener("click", (e)=>{ if(!isTarget(e.target) && !(panel && panel.contains(e.target))) close(); });
  window.addEventListener("scroll", ()=>{ if(activeInput) positionPanel(activeInput); }, true);
})();
