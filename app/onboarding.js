/* =========================================================
   COPA MANAGER 2026 — app/onboarding.js
   Pantallas iniciales (splash → selección → entrenador → noticia) como overlay
   a pantalla completa. Lee el DB EN VIVO (teamRatings, computeFifaRanks, flagSrc,
   playerDisplayName, personDemonym, personPhotoDefault) — sin datos embebidos.
   Se muestra SIEMPRE al arrancar (init.js llama Onboarding.boot()). "Cargar Partida"
   funciona igual que "Iniciar Partida" (temporal). Botón temporal "Ir al simulador"
   para saltar el flujo mientras se edita. CSS aislado bajo #cm-onb.
   Script CLÁSICO. Cargar ANTES de app/init.js.
   ========================================================= */
(function(){
"use strict";
const OVERLAY_ID = "cm-onb";
const ONB_CSS = "#cm-onb{\n  /* --- Tokens heredados de la app (mundial2026-manager_62.html) --- */\n  --bg:#0F1117;\n  --surface:#1A1D27;\n  --surface-2:#242837;\n  --ink:#EDEFF5;\n  --muted:#9298AC;\n  --line:#2B2F3D;\n  --indigo:#6D63F5;\n  --indigo-bright:#8B82FF;\n  --coral:#FF6B4D;\n  --coral-bright:#FF8266;\n  --lime:#CBFF4D;\n  --amber:#F5C842;\n  --success:#34D399;\n  --danger:#FF6B6A;\n  --radius:16px;\n  --radius-sm:10px;\n  --shadow:0 1px 2px rgba(0,0,0,0.4), 0 8px 28px rgba(0,0,0,0.4);\n  --shadow-lift:0 10px 30px rgba(109,99,245,0.35);\n\n  /* --- Acentos fijos de la interfaz (negro + morado en TODAS las pantallas) --- */\n  --team-1:#6D63F5;\n  --team-2:#8B82FF;\n  --team-3:#FFFFFF;\n}\n#cm-onb, #cm-onb *{box-sizing:border-box;}\n#cm-onb, #cm-onb{margin:0;padding:0;height:100%;}\n#cm-onb{\n  background:var(--bg);\n  color:var(--ink);\n  font-family:'Inter',sans-serif;\n  -webkit-font-smoothing:antialiased;\n  overflow:hidden;\n}\n#cm-onb h1, #cm-onb h2, #cm-onb h3, #cm-onb .display{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-0.01em;color:var(--ink);margin:0;}\n#cm-onb .mono{font-family:'JetBrains Mono',monospace;}\n#cm-onb button{font-family:'Inter',sans-serif;cursor:pointer;}\n#cm-onb ::selection{background:rgba(139,130,255,0.35);}\n/* ---------- Contenedor a pantalla completa ---------- */\n#cm-onb{position:fixed;inset:0;overflow:hidden;}\n#cm-onb .screen{position:absolute;inset:0;display:flex;flex-direction:column;opacity:0;pointer-events:none;}\n#cm-onb .screen.active{opacity:1;pointer-events:auto;}\n#cm-onb .screen.enter{animation:onb-screenIn .45s cubic-bezier(.22,.61,.36,1) both;}\n#cm-onb /* Atm\u00f3sfera fija indigo/morada (no se recolorea por selecci\u00f3n) */\n.atmosphere{position:absolute;inset:0;z-index:0;overflow:hidden;background:var(--bg);}\n#cm-onb .atmosphere::before, #cm-onb .atmosphere::after{content:\"\";position:absolute;border-radius:50%;filter:blur(90px);opacity:.5;transition:background 1.1s ease;}\n#cm-onb .atmosphere::before{width:60vmax;height:60vmax;top:-18vmax;left:-12vmax;background:radial-gradient(circle at 30% 30%, var(--team-1), transparent 70%);animation:onb-drift1 26s ease-in-out infinite alternate;}\n#cm-onb .atmosphere::after{width:52vmax;height:52vmax;bottom:-20vmax;right:-14vmax;background:radial-gradient(circle at 60% 60%, var(--team-2), transparent 70%);animation:onb-drift2 32s ease-in-out infinite alternate;}\n#cm-onb .atmosphere .grain{position:absolute;inset:0;opacity:.05;background-image:radial-gradient(rgba(255,255,255,.5) .5px, transparent .5px);background-size:3px 3px;}\n#cm-onb .screen > .stage{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;min-height:0;}\n#cm-onb /* ---------- Botones ---------- */\n.btn{border:none;border-radius:12px;padding:13px 26px;font-size:15px;font-weight:600;background:var(--indigo);color:#fff;transition:transform .08s, background .15s, box-shadow .15s;letter-spacing:.01em;}\n#cm-onb .btn:hover{background:var(--indigo-bright);box-shadow:var(--shadow-lift);}\n#cm-onb .btn:active{transform:scale(0.97);}\n#cm-onb .btn:focus-visible{outline:2px solid var(--indigo-bright);outline-offset:3px;}\n#cm-onb .btn.gold{background:var(--coral);}\n#cm-onb .btn.gold:hover{background:var(--coral-bright);box-shadow:0 8px 20px rgba(255,107,77,0.3);}\n#cm-onb .btn.ghost{background:rgba(255,255,255,0.04);color:var(--ink);border:1px solid var(--line);backdrop-filter:blur(6px);}\n#cm-onb .btn.ghost:hover{background:rgba(255,255,255,0.09);box-shadow:none;}\n#cm-onb .btn.team{background:var(--team-1);color:#fff;}\n#cm-onb .btn.team:hover{background:var(--team-2);box-shadow:0 10px 30px color-mix(in srgb, var(--team-1) 45%, transparent);}\n#cm-onb .btn.sm{padding:8px 15px;font-size:13px;border-radius:9px;}\n#cm-onb .btn.big{padding:16px 34px;font-size:16px;border-radius:14px;}\n#cm-onb .btn:disabled{opacity:.4;cursor:not-allowed;}\n#cm-onb .link-btn{background:none;border:none;color:var(--muted);font-size:13px;text-decoration:underline;text-underline-offset:3px;padding:6px;}\n#cm-onb .link-btn:hover{color:var(--ink);}\n#cm-onb /* =========================================================\n   1) SPLASH\n   ========================================================= */\n#s-splash .stage{align-items:center;justify-content:center;text-align:center;padding:32px;}\n#cm-onb .splash-crest{width:112px;height:112px;border-radius:26px;object-fit:cover;box-shadow:0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06);margin-bottom:26px;animation:onb-floaty 6s ease-in-out infinite;}\n#cm-onb .splash-title{font-size:clamp(38px,7vw,72px);line-height:.98;font-weight:700;}\n#cm-onb .splash-title .yr{color:var(--indigo-bright);}\n#cm-onb .splash-sub{color:var(--muted);font-size:clamp(14px,2.2vw,18px);margin-top:14px;max-width:420px;letter-spacing:.02em;}\n#cm-onb .splash-actions{display:flex;gap:14px;margin-top:40px;flex-wrap:wrap;justify-content:center;}\n#cm-onb .splash-foot{position:absolute;bottom:22px;left:0;right:0;text-align:center;color:var(--muted);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;z-index:2;}\n#cm-onb .saved-pill{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:7px 14px;border-radius:20px;background:rgba(52,211,153,.12);color:var(--success);font-size:12.5px;font-weight:600;border:1px solid rgba(52,211,153,.25);}\n#cm-onb .saved-pill .dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 8px var(--success);}\n#cm-onb .temp-skip{margin-top:26px;background:rgba(245,200,66,.10);border:1px dashed rgba(245,200,66,.5);color:var(--amber);font-size:12.5px;font-weight:600;padding:9px 16px;border-radius:10px;letter-spacing:.02em;}\n#cm-onb .temp-skip:hover{background:rgba(245,200,66,.18);}\n#cm-onb /* =========================================================\n   Encabezado com\u00fan de las pantallas de flujo\n   ========================================================= */\n.flow-head{display:flex;align-items:center;gap:16px;padding:22px clamp(20px,4vw,54px) 8px;flex-wrap:wrap;}\n#cm-onb .flow-head .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}\n#cm-onb .flow-head h2{font-size:clamp(22px,3.4vw,32px);margin-top:2px;}\n#cm-onb .flow-head .spacer{flex:1;}\n#cm-onb .stepper{display:flex;gap:7px;align-items:center;}\n#cm-onb .stepper .pip{width:26px;height:4px;border-radius:3px;background:var(--line);transition:background .3s,width .3s;}\n#cm-onb .stepper .pip.done{background:var(--team-2);}\n#cm-onb .stepper .pip.now{background:var(--team-1);width:38px;}\n#cm-onb /* =========================================================\n   2) SELECCI\u00d3N DE SELECCI\u00d3N \u2014 grid de rect\u00e1ngulos\n   ========================================================= */\n.pick-toolbar{display:flex;align-items:center;gap:12px;padding:2px clamp(20px,4vw,54px) 14px;flex-wrap:wrap;}\n#cm-onb .pick-search{position:relative;flex:1;max-width:320px;min-width:180px;}\n#cm-onb .pick-search input{width:100%;padding:9px 12px 9px 34px;font-size:13.5px;background:var(--surface-2);border:1px solid var(--line);border-radius:20px;color:var(--ink);}\n#cm-onb .pick-search input:focus{outline:2px solid var(--team-2);outline-offset:1px;}\n#cm-onb .pick-search .ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:12px;opacity:.6;pointer-events:none;}\n#cm-onb .pick-count{color:var(--muted);font-size:12.5px;font-family:'JetBrains Mono',monospace;}\n#cm-onb .seg{display:inline-flex;background:var(--surface-2);border:1px solid var(--line);border-radius:20px;padding:3px;gap:2px;}\n#cm-onb .seg-btn{border:none;background:transparent;color:var(--muted);font-size:12.5px;font-weight:600;padding:6px 14px;border-radius:16px;transition:background .15s,color .15s;}\n#cm-onb .seg-btn:hover{color:var(--ink);}\n#cm-onb .seg-btn.on{background:var(--indigo);color:#fff;}\n#cm-onb .seg-btn:focus-visible{outline:2px solid var(--indigo-bright);outline-offset:2px;}\n#cm-onb .pick-scroll{flex:1;overflow-y:auto;padding:4px clamp(20px,4vw,54px) 130px;}\n#cm-onb .pick-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));max-width:1360px;margin:0 auto;}\n#cm-onb .team-tile{position:relative;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:15px;display:flex;flex-direction:column;gap:12px;transition:transform .12s, border-color .18s, box-shadow .18s;overflow:hidden;color:var(--ink);}\n#cm-onb .team-tile::before{content:\"\";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg, var(--t1), var(--t2));opacity:.9;}\n#cm-onb .team-tile:hover{transform:translateY(-3px);border-color:color-mix(in srgb, var(--t1) 55%, var(--line));box-shadow:0 12px 26px rgba(0,0,0,.35);}\n#cm-onb .team-tile:focus-visible{outline:2px solid var(--t2);outline-offset:2px;}\n#cm-onb .team-tile.selected{border-color:var(--indigo);box-shadow:0 0 0 2px var(--indigo), 0 14px 30px rgba(109,99,245,0.28);}\n#cm-onb .tile-name .code-badge{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:var(--muted);background:var(--surface-2);border:1px solid var(--line);padding:1px 6px;border-radius:6px;vertical-align:middle;margin-left:2px;letter-spacing:.02em;}\n#cm-onb .tile-top{display:flex;align-items:center;gap:12px;}\n#cm-onb .crest{width:46px;height:46px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(150deg, var(--t1), var(--t2));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);}\n#cm-onb .crest img{width:100%;height:100%;object-fit:cover;display:block;}\n#cm-onb .crest .code{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12.5px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5);letter-spacing:.02em;}\n#cm-onb .tile-id{flex:1;min-width:0;}\n#cm-onb .tile-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15.5px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n#cm-onb .tile-code{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:1px;}\n#cm-onb .tile-rating{text-align:center;flex-shrink:0;min-width:78px;align-self:center;}\n#cm-onb .tile-rating .rb-big{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:800;line-height:1;color:var(--indigo-bright);}\n#cm-onb .tile-rating .rb-cap{font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-top:2px;margin-bottom:7px;}\n#cm-onb .tile-rating .rb-grid{display:grid;grid-template-columns:auto auto;gap:2px 12px;justify-content:center;align-items:center;font-family:'JetBrains Mono',monospace;}\n#cm-onb .tile-rating .rb-l{font-size:10px;color:var(--muted);letter-spacing:.03em;line-height:16px;text-align:center;}\n#cm-onb .tile-rating .rb-v{font-size:12px;font-weight:700;color:var(--indigo);line-height:16px;text-align:center;}\n#cm-onb .tile-bottom{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}\n#cm-onb .badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;background:var(--surface-2);color:var(--muted);}\n#cm-onb .badge.flag{padding:2px;background:transparent;}\n#cm-onb .badge.flag img{width:22px;height:15px;border-radius:3px;object-fit:cover;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.12);}\n#cm-onb .badge.host{background:rgba(245,200,66,.16);color:var(--amber);}\n#cm-onb .dots{display:flex;gap:4px;margin-left:auto;}\n#cm-onb .dots i{width:11px;height:11px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);}\n#cm-onb /* Barra flotante de confirmaci\u00f3n */\n.pick-bar{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;gap:16px;padding:16px clamp(20px,4vw,54px);background:linear-gradient(to top, var(--bg) 55%, transparent);transform:translateY(120%);transition:transform .32s cubic-bezier(.22,.61,.36,1);}\n#cm-onb .pick-bar.show{transform:translateY(0);}\n#cm-onb .pick-bar .chip{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--line);padding:9px 9px 9px 14px;border-radius:14px;box-shadow:var(--shadow);}\n#cm-onb .pick-bar .chip .crest{width:34px;height:34px;border-radius:9px;}\n#cm-onb .pick-bar .chip .crest .code{font-size:10px;}\n#cm-onb .pick-bar .chip b{font-family:'Space Grotesk',sans-serif;font-size:14.5px;}\n#cm-onb .pick-bar .chip small{display:block;color:var(--muted);font-size:11px;font-family:'JetBrains Mono',monospace;}\n#cm-onb .pick-bar .spacer{flex:1;}\n#cm-onb /* =========================================================\n   3) ENTRENADOR\n   ========================================================= */\n.coach-stage{flex:1;display:flex;flex-direction:column;justify-content:center;padding:8px clamp(20px,4vw,54px) 40px;overflow-y:auto;}\n#cm-onb .coach-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:840px;width:100%;margin:6px auto 0;}\n#cm-onb .coach-card{position:relative;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:16px;min-height:250px;transition:transform .14s, border-color .18s, box-shadow .18s;color:var(--ink);overflow:hidden;}\n#cm-onb .coach-card::before{content:\"\";position:absolute;inset:0 0 auto 0;height:4px;background:linear-gradient(90deg,var(--team-1),var(--team-2));}\n#cm-onb .coach-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--team-1) 50%,var(--line));box-shadow:0 16px 34px rgba(0,0,0,.4);}\n#cm-onb .coach-card:focus-visible{outline:2px solid var(--team-2);outline-offset:3px;}\n#cm-onb .coach-card.selected{border-color:var(--team-1);box-shadow:0 0 0 1px var(--team-1),0 16px 34px color-mix(in srgb,var(--team-1) 26%,transparent);}\n#cm-onb .coach-card .kicker{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}\n#cm-onb .coach-person{display:flex;gap:16px;align-items:center;}\n#cm-onb .coach-photo{width:84px;height:84px;border-radius:16px;flex-shrink:0;overflow:hidden;background:var(--surface-2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}\n#cm-onb .coach-photo img, #cm-onb .coach-photo svg{width:100%;height:100%;object-fit:cover;display:block;}\n#cm-onb .coach-meta .nm{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:21px;line-height:1.1;}\n#cm-onb .coach-meta .role{color:var(--team-2);font-size:12.5px;font-weight:600;margin-top:4px;}\n#cm-onb .coach-meta .sub{color:var(--muted);font-size:12.5px;margin-top:6px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}\n#cm-onb .coach-meta .sub img{width:20px;height:14px;border-radius:3px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.12);}\n#cm-onb .coach-rating{margin-top:auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;}\n#cm-onb .coach-rating .n{font-family:'JetBrains Mono',monospace;font-size:40px;font-weight:800;color:var(--indigo-bright);line-height:1;}\n#cm-onb .coach-rating .l{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:3px;}\n#cm-onb .coach-card.create{align-items:flex-start;justify-content:center;}\n#cm-onb .create-icon{width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:30px;background:linear-gradient(150deg,color-mix(in srgb,var(--team-1) 30%,var(--surface-2)),var(--surface-2));color:var(--team-2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}\n#cm-onb .create-copy h3{font-family:'Space Grotesk',sans-serif;font-size:21px;}\n#cm-onb .create-copy p{color:var(--muted);font-size:13px;margin:8px 0 0;line-height:1.5;}\n#cm-onb .coach-foot{display:flex;justify-content:center;gap:14px;margin-top:26px;}\n#cm-onb /* Formulario Crea tu manager */\n.manager-form{max-width:640px;width:100%;margin:6px auto 0;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:26px clamp(20px,4vw,32px);box-shadow:var(--shadow);}\n#cm-onb .manager-form h3{font-size:20px;}\n#cm-onb .manager-form .hint{color:var(--muted);font-size:12.5px;margin:6px 0 20px;}\n#cm-onb .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;}\n#cm-onb .field{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--muted);font-weight:600;}\n#cm-onb .field.full{grid-column:1/-1;}\n#cm-onb .field input, #cm-onb .field select{font-family:'Inter',sans-serif;font-size:14px;padding:10px 12px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;color:var(--ink);width:100%;font-weight:500;}\n#cm-onb .field input:focus, #cm-onb .field select:focus{outline:2px solid var(--team-2);outline-offset:1px;}\n#cm-onb .field .echo{font-weight:400;color:var(--muted);font-size:11px;min-height:14px;}\n#cm-onb .avatar-row{display:flex;align-items:center;gap:16px;grid-column:1/-1;padding:4px 0 2px;}\n#cm-onb .avatar-prev{width:66px;height:66px;border-radius:16px;overflow:hidden;background:var(--surface-2);flex-shrink:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}\n#cm-onb .avatar-prev img, #cm-onb .avatar-prev svg{width:100%;height:100%;object-fit:cover;}\n#cm-onb .manager-foot{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-top:24px;flex-wrap:wrap;}\n#cm-onb /* =========================================================\n   4) NOTICIA \u2014 portada de medio\n   ========================================================= */\n.news-stage{flex:1;display:flex;align-items:center;justify-content:center;padding:20px clamp(20px,4vw,54px) 40px;overflow-y:auto;}\n#cm-onb .news-paper{max-width:760px;width:100%;background:var(--surface);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);}\n#cm-onb .news-masthead{display:flex;align-items:center;gap:14px;padding:18px 26px;border-bottom:2px solid var(--outlet-1,var(--indigo));background:color-mix(in srgb,var(--outlet-1,var(--indigo)) 12%, var(--surface));}\n#cm-onb .news-logo{width:44px;height:44px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(150deg,var(--outlet-1,var(--indigo)),var(--outlet-2,#15161D));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);}\n#cm-onb .news-logo img{width:100%;height:100%;object-fit:cover;}\n#cm-onb .news-logo span{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:var(--outlet-3,#fff);}\n#cm-onb .news-outlet{flex:1;min-width:0;}\n#cm-onb .news-outlet .nm{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;}\n#cm-onb .news-outlet .meta{color:var(--muted);font-size:11.5px;font-family:'JetBrains Mono',monospace;margin-top:1px;}\n#cm-onb .news-live{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--coral);border:1px solid color-mix(in srgb,var(--coral) 45%,transparent);padding:4px 9px;border-radius:20px;}\n#cm-onb .news-body{padding:30px 30px 26px;}\n#cm-onb .news-kicker{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--team-2);margin-bottom:14px;}\n#cm-onb .news-kicker img{width:22px;height:15px;border-radius:3px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.12);}\n#cm-onb .news-headline{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(24px,3.6vw,36px);line-height:1.12;letter-spacing:-0.015em;}\n#cm-onb .news-lede{color:var(--muted);font-size:14.5px;line-height:1.65;margin-top:16px;}\n#cm-onb .news-lede b{color:var(--ink);font-weight:600;}\n#cm-onb .news-foot{display:flex;align-items:center;gap:14px;padding:18px 30px 24px;border-top:1px solid var(--line);flex-wrap:wrap;}\n#cm-onb .news-foot .byline{color:var(--muted);font-size:11.5px;font-family:'JetBrains Mono',monospace;}\n#cm-onb .outlet-pager{display:inline-flex;align-items:center;gap:10px;}\n#cm-onb .pager-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s;}\n#cm-onb .pager-btn:hover{background:rgba(255,255,255,.08);border-color:var(--indigo);}\n#cm-onb .pager-btn:active{transform:scale(.94);}\n#cm-onb .pager-count{font-size:12.5px;color:var(--muted);min-width:30px;text-align:center;}\n#cm-onb .news-foot .spacer{flex:1;}\n#cm-onb /* =========================================================\n   5) HANDOFF\n   ========================================================= */\n#s-handoff .stage{align-items:center;justify-content:center;text-align:center;padding:32px;}\n#cm-onb .handoff-badge{width:96px;height:96px;border-radius:26px;display:flex;align-items:center;justify-content:center;font-size:44px;background:linear-gradient(150deg,var(--team-1),var(--team-2));box-shadow:0 20px 46px color-mix(in srgb,var(--team-1) 40%,transparent);margin-bottom:24px;animation:onb-floaty 5s ease-in-out infinite;}\n#cm-onb #s-handoff h2{font-size:clamp(26px,4vw,40px);}\n#cm-onb #s-handoff p{color:var(--muted);font-size:15px;margin-top:12px;max-width:440px;}\n#cm-onb .handoff-summary{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap;justify-content:center;}\n#cm-onb .handoff-summary .kv{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 16px;text-align:left;}\n#cm-onb .handoff-summary .kv .k{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-family:'JetBrains Mono',monospace;}\n#cm-onb .handoff-summary .kv .v{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;margin-top:2px;}\n#cm-onb .handoff-summary .kv .v.with-img{display:flex;align-items:center;gap:9px;margin-top:6px;}\n#cm-onb .handoff-summary .kv .v .crest.mini{width:26px;height:26px;border-radius:7px;}\n#cm-onb .handoff-summary .kv .v .crest.mini .code{font-size:8px;}\n#cm-onb .handoff-summary .kv .v .mini-photo{width:26px;height:26px;border-radius:7px;overflow:hidden;background:var(--surface-2);flex-shrink:0;display:inline-block;}\n#cm-onb .handoff-summary .kv .v .mini-photo img{width:100%;height:100%;object-fit:cover;display:block;}\n#cm-onb /* ---------- Animaciones ---------- */\n@keyframes onb-screenIn{from{opacity:0;transform:translateY(14px) scale(.995);}to{opacity:1;transform:none;}}\n\n@keyframes onb-floaty{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}\n\n@keyframes onb-drift1{from{transform:translate(0,0) scale(1);}to{transform:translate(6vmax,4vmax) scale(1.12);}}\n\n@keyframes onb-drift2{from{transform:translate(0,0) scale(1);}to{transform:translate(-5vmax,-3vmax) scale(1.1);}}\n\n\n@media (max-width:680px){\n#cm-onb .coach-grid{grid-template-columns:1fr;}\n#cm-onb .form-grid{grid-template-columns:1fr;}\n#cm-onb .pick-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));}\n#cm-onb .pick-bar{flex-wrap:wrap;}\n#cm-onb .pick-bar .chip{flex:1;}\n}\n\n@media (prefers-reduced-motion:reduce){\n#cm-onb, #cm-onb *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.05ms !important;}\n}";

let DATA = { teams:[], media:[] };
let APP_CREST = "";
let FLAGS = {};            // en la app real usamos flagSrc (carpeta banderas/), no banderas embebidas
let PERSON_DEFAULT = "";   // foto genérica masculina del juego (PLAYER_PHOTO_DEFAULT)
let PERSON_DEFAULT_F = ""; // foto genérica femenina del juego (PLAYER_PHOTO_DEFAULT_F)
// Por ahora NO se guarda ninguna partida: ni el entrenador creado ni persist().
// El flujo visual funciona igual, pero al cerrar no se toca el DB ni el JSON: cada apertura empieza de cero.
// Cuando exista el sistema de guardado (fuera del JSON) se pondrá en true.
const SAVE_ENABLED = false;

// Estilos propios de las pantallas Táctica, Convocatoria y Noticia final.
// Se concatena a ONB_CSS en injectStyles(). Sin comentarios CSS para evitar
// secuencias de cierre de bloque dentro del string.
const ONB_CSS2 = [
"#cm-onb .team-tile{content-visibility:auto;contain-intrinsic-size:auto 128px;}",
"#cm-onb .atmosphere::before,#cm-onb .atmosphere::after{filter:blur(46px)!important;animation:none!important;will-change:auto!important;}",
"#cm-onb .btn.ghost{backdrop-filter:none!important;}",
"#cm-onb .section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;}",
"#cm-onb .section-title h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;margin:0;letter-spacing:-0.01em;}",
"#cm-onb .list-subhead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:16px 4px 8px;}",
"#cm-onb .list-subhead h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;margin:0;}",
"#cm-onb .list-subhead .hint{font-size:12px;color:var(--muted);font-weight:500;}",
"#cm-onb .pos-chip{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:30px;font-family:'Inter',sans-serif;font-size:10px;font-weight:700;line-height:1;padding:3px 6px;border-radius:6px;color:#fff;}",
"#cm-onb .pos-GK{background:#C9A227;} #cm-onb .pos-DF{background:#2E6FE0;} #cm-onb .pos-MF{background:#19A463;} #cm-onb .pos-FW{background:#E1473A;}",
"#cm-onb .num-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;background:var(--indigo);color:#fff;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;flex-shrink:0;}",
"#cm-onb .num-badge.ghost{background:transparent;border:1px dashed var(--line);color:var(--muted);}",
"#cm-onb .tac-stage{flex:1;overflow-y:auto;padding:8px clamp(20px,4vw,54px) 96px;}",
"#cm-onb .tac-grid{display:grid;grid-template-columns:minmax(0,0.95fr) minmax(0,1.05fr);gap:30px;max-width:1080px;margin:6px auto 0;align-items:start;}",
"#cm-onb .tac-board{display:flex;justify-content:center;position:sticky;top:6px;}",
"#cm-onb .tac-pitch{position:relative;width:100%;max-width:410px;aspect-ratio:3/4;}",
"#cm-onb .tac-field{position:absolute;inset:0;background-size:contain;background-position:center;background-repeat:no-repeat;filter:drop-shadow(0 14px 28px rgba(0,0,0,.42));}",
"#cm-onb .lu-layer{position:absolute;inset:0;z-index:2;}",
"#cm-onb .lu-slot{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:0;width:clamp(46px,13.5%,66px);}",
"#cm-onb .lu-jersey{position:relative;width:clamp(40px,11vw,56px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;}",
"#cm-onb .lu-jersey img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45));}",
"#cm-onb .lu-jersey.empty{border:1px dashed rgba(255,255,255,.25);border-radius:10px;background:rgba(255,255,255,.04);}",
"#cm-onb .lu-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.6);}",
"#cm-onb .lu-slot .pos-chip{margin-top:3px;min-width:28px;padding:2px 6px;font-size:9.5px;position:relative;z-index:3;box-shadow:0 3px 8px rgba(0,0,0,.45);}",
"#cm-onb .tac-controls{display:flex;flex-direction:column;gap:14px;}",
"#cm-onb .tac-forms{max-height:440px;overflow-y:auto;padding:2px;display:flex;flex-direction:column;gap:14px;}",
"#cm-onb .tac-fgroup{display:flex;flex-direction:column;gap:7px;}",
"#cm-onb .tac-fgroup-h{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:12px;color:var(--muted);}",
"#cm-onb .tac-fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;}",
"#cm-onb .tac-fchip{height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:4px 6px;color:var(--ink);cursor:pointer;text-align:center;transition:transform .1s,border-color .16s,box-shadow .16s;}",
"#cm-onb .tac-fchip .fl1{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12.5px;line-height:1.1;}",
"#cm-onb .tac-fchip .fl2{font-size:10px;color:var(--muted);line-height:1.1;}",
"#cm-onb .tac-fchip:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--indigo) 55%,var(--line));}",
"#cm-onb .tac-fchip.on{border-color:var(--indigo);box-shadow:0 0 0 1px var(--indigo),0 8px 18px rgba(109,99,245,.26);color:var(--indigo-bright);background:color-mix(in srgb,var(--indigo) 12%,var(--surface));}",
"#cm-onb .tac-fchip.on .fl2{color:var(--indigo-bright);opacity:.85;}",
"#cm-onb .tac-hint{color:var(--muted);font-size:12.5px;line-height:1.5;margin:6px 2px 0;min-height:20px;}",
"#cm-onb .cv-stage{flex:1;overflow-y:auto;display:flex;padding:8px clamp(20px,4vw,54px) 96px;}",
"#cm-onb .cv-grid{display:grid;grid-template-columns:minmax(0,620px) minmax(0,380px);justify-content:center;gap:40px;width:100%;margin:0 auto;align-items:start;}",
"#cm-onb .cv-list-wrap{display:flex;flex-direction:column;min-width:0;}",
"#cm-onb .cv-list-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap;}",
"#cm-onb .cv-counter{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:var(--ink);letter-spacing:-0.01em;}",
"#cm-onb .cv-counter b{font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--indigo-bright);margin-left:4px;}",
"#cm-onb .cv-counter b.ok{color:var(--success);}",
"#cm-onb .cv-tools{display:flex;gap:8px;flex-wrap:wrap;}",
"#cm-onb .cv-cols{display:grid;grid-template-columns:36px 40px 26px minmax(0,1fr) 42px 60px 46px 64px;gap:8px;align-items:center;padding:0 12px 5px;font-family:'Inter',sans-serif;font-size:10px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--muted);}",
"#cm-onb .cv-cols span{text-align:center;}",
"#cm-onb .cv-cols span.l{text-align:left;}",
"#cm-onb .cv-list{display:flex;flex-direction:column;gap:4px;}",
"#cm-onb .cv-row{display:grid;grid-template-columns:36px 40px 26px minmax(0,1fr) 42px 60px 46px 64px;gap:8px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:4px 12px;}",
"#cm-onb .cv-row.empty{background:transparent;border-style:dashed;}",
"#cm-onb .cv-row.noconv{background:var(--surface-2);cursor:pointer;}",
"#cm-onb .cv-row.open{position:relative;z-index:60;}",
"#cm-onb .cv-num-wrap{position:relative;display:flex;align-items:center;justify-content:center;}",
"#cm-onb .cv-numbtn{border:none;cursor:pointer;transition:box-shadow .14s,transform .08s;}",
"#cm-onb .cv-row[data-act]{cursor:pointer;}",
"#cm-onb .cv-row:hover .cv-numbtn{box-shadow:0 0 0 2px var(--indigo-bright);}",
"#cm-onb .cv-row .pos-chip{justify-self:center;}",
"#cm-onb .cv-photo{width:26px;height:26px;border-radius:7px;overflow:hidden;background:var(--surface-2);flex-shrink:0;justify-self:center;}",
"#cm-onb .cv-photo img{width:100%;height:100%;object-fit:cover;display:block;}",
"#cm-onb .cv-name{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
"#cm-onb .cv-c{text-align:center;font-family:'Inter',sans-serif;font-size:12px;color:var(--ink);}",
"#cm-onb .cv-libre{grid-column:2 / -1;color:var(--muted);font-size:12px;}",
"#cm-onb .cv-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:70;width:250px;max-height:280px;overflow-y:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.5);padding:5px;}",
"#cm-onb .cv-menu-head{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);padding:5px 8px 6px;}",
"#cm-onb .cv-menu-list{display:flex;flex-direction:column;gap:1px;}",
"#cm-onb .cv-menu-item{display:grid;grid-template-columns:22px 30px 1fr;gap:8px;align-items:center;width:100%;text-align:left;background:transparent;border:none;border-radius:7px;padding:4px 8px;color:var(--ink);font-family:'Inter',sans-serif;font-size:12px;cursor:pointer;}",
"#cm-onb .cv-menu-item:hover{background:var(--surface-2);}",
"#cm-onb .cv-menu-item.sel{background:color-mix(in srgb,var(--indigo) 20%,transparent);}",
"#cm-onb .cv-menu-num{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--muted);text-align:center;}",
"#cm-onb .cv-menu-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
"#cm-onb .cv-menu-item.free{display:block;text-align:center;margin-top:3px;border-top:1px solid var(--line);border-radius:0 0 7px 7px;color:var(--muted);font-size:12px;padding-top:8px;}",
"#cm-onb .cv-menu-item.free:hover{color:var(--danger);background:transparent;}",
"#cm-onb .cv-menu-backdrop{position:fixed;inset:0;z-index:40;background:transparent;}",
"#cm-onb .cv-menu.up{top:auto;bottom:calc(100% + 6px);}",
"#cm-onb .cv-side{display:flex;flex-direction:column;min-width:0;align-items:stretch;}",
"#cm-onb .cv-side .section-title{width:100%;justify-content:center;}",
"#cm-onb .st-table{display:flex;flex-direction:column;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;width:100%;margin:0;}",
"#cm-onb .st-group{display:flex;flex-direction:column;gap:6px;}",
"#cm-onb .st-group-head{display:flex;align-items:center;gap:8px;}",
"#cm-onb .st-group-head span{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:12px;color:var(--ink);}",
"#cm-onb .st-group-head b{margin-left:auto;font-size:11px;color:var(--muted);}",
"#cm-onb .st-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;}",
"#cm-onb .st-chip{display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:4px 8px;min-width:0;}",
"#cm-onb .st-chip .num-badge{width:22px;height:22px;border-radius:6px;font-size:10.5px;}",
"#cm-onb .st-name{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
"#cm-onb .st-empty{color:var(--muted);font-size:12px;text-align:center;padding:14px 8px;}",
"#cm-onb .news-paper{max-width:660px;width:100%;margin:0 auto;}",
"#cm-onb .news-masthead{background:var(--outlet-1,var(--indigo));border-bottom:none;padding:12px 22px;gap:14px;align-items:center;}",
"#cm-onb .news-logo{width:auto;min-width:0;height:40px;border-radius:0;background:transparent;box-shadow:none;overflow:visible;justify-content:flex-start;}",
"#cm-onb .news-logo img{width:auto;height:100%;max-width:220px;object-fit:contain;display:block;}",
"#cm-onb .news-wordmark{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:22px;line-height:1;color:var(--outlet-3,#fff);white-space:nowrap;letter-spacing:-0.01em;}",
"#cm-onb .news-masthead .news-live{color:var(--outlet-1,var(--indigo));background:var(--outlet-3,#fff);border:none;font-weight:800;}",
"#cm-onb .news-headline{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;}",
"#cm-onb .news-lede{display:-webkit-box;-webkit-line-clamp:8;-webkit-box-orient:vertical;overflow:hidden;}",
"#cm-onb .news-body{min-height:430px;box-sizing:border-box;}",
"#cm-onb .onb-screens{position:absolute;inset:0;z-index:1;}",
"#cm-onb .news-list{display:flex;flex-direction:column;gap:20px;width:100%;max-width:760px;margin:0 auto;}",
"#cm-onb .flow-foot{position:fixed;right:clamp(16px,4vw,54px);bottom:20px;z-index:40;display:flex;align-items:stretch;gap:12px;}",
"#cm-onb .flow-foot .btn.flow-back{padding:16px 22px;font-size:14px;border-radius:14px;display:flex;align-items:center;}",
"#cm-onb .flow-foot .btn.big{box-shadow:0 10px 30px rgba(109,99,245,.4);}",
"#cm-onb .news-stage{align-items:flex-start;padding-bottom:96px;}",
"#cm-onb .coach-stage{padding-bottom:96px;}",
"@media (max-width:900px){#cm-onb .tac-grid{grid-template-columns:1fr;gap:20px;}#cm-onb .cv-grid{grid-template-columns:1fr;}#cm-onb .cv-side{margin-top:8px;}#cm-onb .st-table{max-width:none;}}"
].join("\n");

function injectStyles(){
  if(document.getElementById("cm-onb-styles")) return;
  const st = document.createElement("style");
  st.id = "cm-onb-styles";
  st.textContent = ONB_CSS
    + "\n#cm-onb{position:fixed;inset:0;z-index:99999;}"
    // Escudo: fondo neutro y logo/escudo genérico contenido (sin cuadro de color)
    + "\n#cm-onb .crest{background:var(--surface-2)!important;}"
    + "\n#cm-onb .crest::before{display:none!important;}"
    + "\n#cm-onb .crest img{object-fit:contain!important;padding:4px;background:transparent;}"
    // Botón temporal fijo (esquina inferior derecha del simulador) para volver a la bienvenida
    + "\n#cm-onb-reopen{position:fixed;right:16px;bottom:16px;z-index:9998;font-family:'Inter',sans-serif;"
    + "font-size:12.5px;font-weight:600;letter-spacing:.02em;color:#F5C842;background:rgba(20,20,26,.92);"
    + "border:1px dashed rgba(245,200,66,.55);border-radius:10px;padding:9px 14px;cursor:pointer;"
    + "box-shadow:0 6px 20px rgba(0,0,0,.4);}"
    + "\n#cm-onb-reopen:hover{background:rgba(40,36,20,.96);}"
    // Vista "Por grupos": bloques con encabezado + cuadrícula de 4 en 4 (estilo pestaña del evento)
    + "\n#cm-onb .pick-grid.grouped{display:block;grid-template-columns:none;}"
    + "\n#cm-onb .pick-group{margin-bottom:26px;}"
    + "\n#cm-onb .pick-group-head{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;}"
    + "\n#cm-onb .pick-group-head .tag{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.04em;color:#fff;background:linear-gradient(150deg,var(--indigo),var(--indigo-bright));padding:4px 11px;border-radius:8px;}"
    + "\n#cm-onb .pick-group-head .cnt{font-size:12px;color:var(--muted);font-weight:600;}"
    + "\n#cm-onb .pick-group-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;}"
    + "\n@media (max-width:900px){#cm-onb .pick-group-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}"
    + "\n@media (max-width:520px){#cm-onb .pick-group-grid{grid-template-columns:1fr;}}"
    // Rectángulo de selección (nuevo layout): 1ª línea bandera+nombre; abajo logo a la izq.,
    // ratings arriba-derecha y badges (confederación + FIFA) en una línea abajo-derecha.
    + "\n#cm-onb .team-tile{gap:12px;}"
    + "\n#cm-onb .team-tile .tile-head{display:flex;align-items:center;gap:9px;min-width:0;}"
    + "\n#cm-onb .team-tile .tile-head .badge.flag{padding:0;flex-shrink:0;background:transparent;}"
    + "\n#cm-onb .team-tile .tile-head .badge.flag img{width:26px;height:18px;border-radius:3px;}"
    + "\n#cm-onb .team-tile .tile-head .tile-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}"
    + "\n#cm-onb .team-tile .tile-body{display:flex;gap:14px;align-items:stretch;}"
    + "\n#cm-onb .team-tile .tile-crest{flex:0 0 140px;display:flex;align-items:center;justify-content:center;}"
    + "\n#cm-onb .team-tile .tile-crest .crest{width:140px;height:140px;border-radius:0;background:transparent!important;box-shadow:none!important;}"
    + "\n#cm-onb .team-tile .tile-crest .crest img{padding:0!important;}"
    + "\n#cm-onb .team-tile .tile-right{flex:1;min-width:0;min-height:140px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating{text-align:right;min-width:0;align-self:auto;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating .rb-big{font-size:34px;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating .rb-cap{margin-bottom:8px;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating .rb-grid{grid-template-columns:auto auto;justify-content:end;gap:3px 14px;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating .rb-l{text-align:left;}"
    + "\n#cm-onb .team-tile .tile-right .tile-rating .rb-v{text-align:right;}"
    + "\n#cm-onb .team-tile .tile-badges{display:flex;gap:8px;justify-content:flex-end;flex-wrap:nowrap;}"
    + "\n#cm-onb .team-tile .tile-badges .badge{white-space:nowrap;}"
    + "\n#cm-onb .tac-field{background-image:url(\"" + PITCH_IMG + "\");}"
    + "\n" + ONB_CSS2;
  document.head.appendChild(st);
}
function ensureOverlay(){
  let ov = document.getElementById(OVERLAY_ID);
  if(!ov){ ov = document.createElement("div"); ov.id = OVERLAY_ID; document.body.appendChild(ov); }
  return ov;
}
function closeOverlay(){ const ov = document.getElementById(OVERLAY_ID); if(ov) ov.remove(); }

/* ---- Datos EN VIVO desde el DB ---- */
function isoFromFlagSrc(x){
  try{ const s = (typeof flagSrc==="function") ? flagSrc(x) : null; if(!s) return null;
       const m = s.match(/([a-z]{2,3})\.png$/i); return m ? m[1] : null; }catch(e){ return null; }
}
// Fuente DEFINITIVA de la bandera tal como la resuelve el juego: puede ser una ruta banderas/xx.png
// o un data URI embebido (caso de EE. UU., Inglaterra, Escocia…). Usamos esto directamente para que
// SIEMPRE se muestre la bandera correcta, en vez de reconstruirla por iso (que falla con data URIs).
function flagSrcOf(x){
  try{ return (typeof flagSrc==="function") ? (flagSrc(x)||null) : null; }catch(e){ return null; }
}
function demonymOfCoach(coach, natCo){
  try{ if(typeof personDemonym==="function"){ const d = personDemonym(coach); if(d) return d; } }catch(e){}
  if(natCo){ const g = natCo.gentilicioM || natCo.gentilicioF || null; if(g) return g.charAt(0).toUpperCase()+g.slice(1); return natCo.commonName||null; }
  return null;
}
function headCoachOf(t){
  const cs = t.coaches || []; if(!cs.length) return null;
  const main = cs.find(c=>String(c.contractRole||"").toLowerCase().indexOf("entrenador del primer equipo")===0) || cs[0];
  const natCo = (DB.countries||[]).find(c=>c.id === ((main.nationalityIds||[])[0])) || null;
  const disp = (typeof playerDisplayName==="function") ? playerDisplayName(main)
             : ((main.commonName||"").trim() || ((main.firstName||"")+" "+(main.lastName||"")).trim() || "Entrenador");
  return {
    id: main.id, displayName: disp, birthDate: main.birthDate||null,
    rating: (main.rating!=null?main.rating:null),
    photo: (typeof main.photo==="string" && main.photo.indexOf("data:")===0) ? main.photo : null,
    natCountry: natCo?natCo.commonName:null,
    natIso: natCo?isoFromFlagSrc(natCo):null,
    natFlag: natCo?flagSrcOf(natCo):null,
    natDemonym: demonymOfCoach(main, natCo),
    gender: main.gender || "Masculino"
  };
}
function buildData(){
  const ranks = (typeof computeFifaRanks==="function") ? computeFifaRanks() : {};
  const all = DB.teams || [];
  const order = new Map(); all.forEach((t,i)=>order.set(t.id,i));
  const wc = all.filter(t=>/^[A-L]$/.test(t.group||""));
  const teams = wc.map(t=>{
    const r = (typeof teamRatings==="function") ? teamRatings(t) : {};
    return {
      id:t.id, name:t.commonName, officialName:t.officialName||t.name||t.commonName,
      code:t.fifaCode||"", conf:t.conf||"", group:t.group||"", host:!!t.host,
      iso: isoFromFlagSrc(t),
      flag: flagSrcOf(t),   // bandera definitiva (ruta o data URI) — arregla EE. UU./Inglaterra/Escocia
      color1:t.color1||"#1e293b", color2:t.color2||"#e2e8f0", color3:t.color3||"#FFFFFF",
      logoImg: (typeof t.logoImg==="string"&&t.logoImg.indexOf("data:")===0)?t.logoImg:null,
      rating: (r.overall!=null?r.overall:60),
      ratings: { overall:(r.overall!=null?r.overall:60), att:r.ataque, mid:r.medio, def:r.defensa },
      fifaRank: ranks[t.id]||null,
      slotIdx: (typeof groupSlotIndex==="function") ? groupSlotIndex(t) : 99,  // posición real de sorteo dentro del grupo (A1→A4)
      _ord: order.get(t.id),
      coach: headCoachOf(t)
    };
  });
  teams.sort((a,b)=> a.group.localeCompare(b.group) || (a.slotIdx-b.slotIdx) || a._ord-b._ord);
  const seen={}; teams.forEach(t=>{ seen[t.group]=(seen[t.group]||0)+1; t.slot=t.group+seen[t.group]; });
  const media = (DB.media||[]).map(m=>({ id:m.id, name:m.name, type:m.type, country:m.country, reach:m.reach,
    color1:m.color1||"#4F46E5", color2:m.color2||"#15161D", color3:m.color3||"#FFFFFF",
    logoImg:(typeof m.logoImg==="string"&&m.logoImg.indexOf("data:")===0)?m.logoImg:null }));
  return { teams, media };
}

/* ---- Al terminar: el manager creado se vuelve DT del país; el DT real pasa a AGENTE LIBRE ---- */
function goInicio(){
  try{
    if(typeof navigateTo==="function"){ navigateTo("inicio"); return; }
  }catch(e){}
  try{ if(typeof window.render==="function") window.render(); }catch(e){}
}
function applyResultAndClose(result){
  try{
    // Mientras SAVE_ENABLED sea false: NO se toca el DB ni se persiste nada.
    // El manager creado NO queda guardado (ni en el JSON) y cada apertura empieza de cero.
    // El flujo visual sigue igual: solo se cierra el overlay y se entra a Inicio.
    if(SAVE_ENABLED && result && result.coachMode==="custom" && result.coach){
      const team = (typeof getTeam==="function") ? getTeam(result.teamId) : (DB.teams||[]).find(t=>t.id===result.teamId);
      if(team){
        const cc = result.coach;
        const nl = s => String(s||"").toLowerCase();
        const teamCountry = (DB.countries||[]).find(c=>c.teamLinks && c.teamLinks.absoluta===team.id) || null;
        const natCountry = cc.natCountry ? (DB.countries||[]).find(c=>nl(c.commonName)===nl(cc.natCountry)) : null;
        const first=(cc.firstName||"").trim(), last=(cc.lastName||"").trim();
        const disp=(cc.displayName||"").trim();
        const fl=(first+" "+last).trim();
        const commonName = (disp && disp!==fl) ? disp : "";
        const newCoach = {
          id: (typeof uid==="function")?uid():("p"+Date.now()),
          firstName:first, lastName:last, commonName:commonName, fullName: fl||disp,
          birthDate: cc.birthDate||null, rating:70, ratingPotential:null,
          nationalityIds: natCountry?[natCountry.id]:(teamCountry?[teamCountry.id]:[]),
          photo: cc.photo||null, fullNameLinked: !fl,
          contractCountryId: teamCountry?teamCountry.id:null, contractClub:"",
          contractRole:"Entrenador del primer equipo", gender: cc.gender || "Masculino"
        };
        team.coaches = team.coaches || [];
        // 1) El DT real actual pasa a AGENTE LIBRE (equipo oculto), no se elimina.
        const idx = team.coaches.findIndex(c=>String(c.contractRole||"").toLowerCase().indexOf("entrenador del primer equipo")===0);
        if(idx>=0){
          const old = team.coaches[idx];
          old.contractCountryId = null; old.contractClub = ""; old.contractRole = "";
          team.coaches.splice(idx,1);
          try{ if(typeof freeAgentTeam==="function") freeAgentTeam().coaches.push(old); }catch(e){ console.error(e); }
        }
        // 2) El manager creado se registra como DT del país seleccionado.
        team.coaches.unshift(newCoach);
        if(typeof persist==="function") persist(true);
      }
    }
  }catch(e){ console.error("[Onboarding] applyResult:", e); }
  closeOverlay();
  goInicio();
}

function boot(){
  if(typeof DB==="undefined" || !DB){ return; }
  injectStyles();
  mountReopenButton();
  setReopenVisible(false);           // oculto mientras el overlay está abierto
  root = ensureOverlay();
  APP_CREST = (function(){ const c=document.querySelector(".brand .crest"); return (c&&c.src)||""; })();
  PERSON_DEFAULT = (typeof PLAYER_PHOTO_DEFAULT!=="undefined") ? PLAYER_PHOTO_DEFAULT : "";
  PERSON_DEFAULT_F = (typeof PLAYER_PHOTO_DEFAULT_F!=="undefined") ? PLAYER_PHOTO_DEFAULT_F : PERSON_DEFAULT;
  FLAGS = {};
  const data = buildData();
  window.CopaOnboarding.start({
    teams: data.teams, media: data.media,
    onComplete: function(res){ applyResultAndClose(res); setReopenVisible(true); },
    onSkip: function(){ closeOverlay(); goInicio(); setReopenVisible(true); }
  });
  // Reduce en segundo plano las imágenes pesadas del JSON mientras se ve el splash,
  // para que la selección de equipo/entrenador cargue ya con imágenes ligeras.
  if(typeof requestAnimationFrame==="function") requestAnimationFrame(warmImages); else warmImages();
}

/* ---- Botón TEMPORAL (esquina inferior derecha del simulador) para volver a la bienvenida ----
   Pensado para cargar un JSON en el juego y luego regresar al onboarding con los datos nuevos. */
function mountReopenButton(){
  if(document.getElementById("cm-onb-reopen")) return;
  const b = document.createElement("button");
  b.id = "cm-onb-reopen";
  b.type = "button";
  b.title = "Botón temporal — volver a la pantalla de bienvenida";
  b.textContent = "⟲ Bienvenida (temporal)";
  b.addEventListener("click", function(){ boot(); });
  document.body.appendChild(b);
}
function setReopenVisible(v){
  const b = document.getElementById("cm-onb-reopen");
  if(b) b.style.display = v ? "" : "none";
}
window.Onboarding = { boot: boot, _rootId: OVERLAY_ID };

/* ============================================================
   Lógica de pantallas (reusada del prototipo validado)
   ============================================================ */

/* ============================================================
   DATOS (foto del seed real). Se inyecta en el marcador de abajo.
   ============================================================ */

/* ============================================================
   CONFIG
   ============================================================ */
const ASSET_BASE = "";                    // p.ej. "" si está en la raíz del repo; "https://.../" si sirves remoto
const CM26_ONBOARDING_KEY = "cm26_onboarding_v1";
const SQUAD_MAX = 26;                      // lista del Mundial 2026

/* ============================================================
   UTILIDADES
   ============================================================ */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
let root = null;
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function normLoose(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim(); }
function computeAge(iso){
  if(!iso) return null;
  const d = new Date(iso); if(isNaN(d)) return null;
  const now = new Date(); let a = now.getFullYear()-d.getFullYear();
  const m = now.getMonth()-d.getMonth();
  if(m<0 || (m===0 && now.getDate()<d.getDate())) a--;
  return (a>=0 && a<130) ? a : null;
}
function ageText(iso){ const a=computeAge(iso); return a!=null?a+" años":"Edad s/d"; }
function fmtDate(d){
  return d.toLocaleDateString("es-ES", {day:"numeric", month:"long", year:"numeric"});
}
// Foto de persona: la asignada, o la foto genérica del juego (jugadores/entrenadores/árbitros).
// Silueta genérica según el género (femenina si "Femenino", masculina en cualquier otro caso).
function defaultPhotoFor(gender){
  return normLoose(gender)==="femenino" ? (PERSON_DEFAULT_F || PERSON_DEFAULT) : PERSON_DEFAULT;
}
// Caché global de imágenes reducidas del JSON (logos y fotos). Los base64 grandes se decodifican
// UNA sola vez y se reducen; el trabajo corre en segundo plano durante el splash, así la selección
// de equipo/entrenador pinta ya con imágenes ligeras (y reentrar es instantáneo). Igual que el
// simulador, que muestra imágenes ya optimizadas.
const _imgCache = (typeof window!=="undefined") ? (window.__cmImgSmall || (window.__cmImgSmall={})) : {};
function smallImg(src){ return (src && _imgCache[src]) ? _imgCache[src] : (src||null); }
function warmImages(){
  if(typeof document==="undefined" || typeof Image==="undefined") return;
  const srcs = [];
  (DATA.teams||[]).forEach(t=>{
    if(typeof t.logoImg==="string" && t.logoImg.indexOf("data:")===0) srcs.push(t.logoImg);
    if(t.coach && typeof t.coach.photo==="string" && t.coach.photo.indexOf("data:")===0) srcs.push(t.coach.photo);
  });
  const list = srcs.filter((s,i)=> srcs.indexOf(s)===i && !_imgCache[s]);
  let i=0, busy=0; const MAX=2, MAXDIM=180;
  const pump=()=>{
    while(busy<MAX && i<list.length){
      const src=list[i++]; busy++;
      const im=new Image(); im.decoding="async";
      im.onload=function(){
        try{
          let w=im.naturalWidth||im.width, h=im.naturalHeight||im.height;
          const r=Math.min(1, MAXDIM/Math.max(w,h)); w=Math.max(1,Math.round(w*r)); h=Math.max(1,Math.round(h*r));
          const c=document.createElement("canvas"); c.width=w; c.height=h;
          c.getContext("2d").drawImage(im,0,0,w,h);
          _imgCache[src]=c.toDataURL("image/png");
        }catch(e){ _imgCache[src]=src; }
        busy--; pump();
      };
      im.onerror=function(){ _imgCache[src]=src; busy--; pump(); };
      im.src=src;
    }
  };
  pump();
}
function personPhotoHTML(url, gender){
  return `<img src="${smallImg(url) || defaultPhotoFor(gender)}" alt="" loading="lazy" decoding="async">`;
}
function avatarSVG(gender){ return personPhotoHTML(null, gender); }

// Escudo de la selección: logo real si existe; si no, cuadro con gradiente de sus colores + código FIFA.
function crestHTML(team, cls){
  // Logo asignado; si no, el escudo genérico del juego (DEFAULT_CREST_SRC). Nunca el cuadro de color.
  const src = smallImg(team.logoImg) || (typeof DEFAULT_CREST_SRC!=="undefined" ? DEFAULT_CREST_SRC : null);
  if(src){
    return `<span class="crest ${cls||''}"><img src="${src}" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'"></span>`;
  }
  return `<span class="crest ${cls||''}"><span class="code">${esc(team.code||team.name.slice(0,3).toUpperCase())}</span></span>`;
}
// Fuente de bandera: primero la embebida (data URI, funciona en cualquier lado),
// si no, la ruta banderas/<iso>.png (resuelve al colocar el módulo en el repo).
function flagUri(iso){
  if(!iso) return null;
  return (typeof FLAGS!=="undefined" && FLAGS[iso]) ? FLAGS[iso] : (FLAG_BASE + iso + ".png");
}
function flagBadgeHTML(team){
  const src = team.flag || flagUri(team.iso);   // preferimos la bandera resuelta por el juego (ruta o data URI)
  if(!src) return "";
  return `<span class="badge flag"><img src="${src}" alt="${esc(team.name)}" loading="lazy" onerror="this.parentElement.style.display='none'"></span>`;
}
// Recibe la fuente YA resuelta (ruta o data URI). Si le pasan un iso corto, lo resuelve por compatibilidad.
function flagImgHTML(src, alt){
  if(src && typeof src==="string" && src.indexOf("data:")!==0 && src.indexOf("/")<0) src = flagUri(src);
  if(!src) return "";
  return `<img src="${src}" alt="${esc(alt||'')}" loading="lazy" onerror="this.style.display='none'">`;
}

/* ============================================================
   ESTADO
   ============================================================ */
const state = {
  screen: "splash",
  teamId: null,
  coachMode: null,      // 'real' | 'custom'
  customCoach: null,    // {firstName,lastName,displayName,birthDate,natCountry,natIso,photo,rating}
  mediaId: null,
  outletCycle: 0,
  formation: "4-4-2",   // formación elegida en la pantalla de Táctica
  style: null,          // "Ofensivo" | "Defensivo" | "Posesión"
  conv: null,           // {slots:{1..26:playerId|null}}
  convTeamId: null,     // selección para la que se construyó `conv` (se rearma al cambiar de equipo)
  convMenu: null        // dorsal (1..26) con el menú de asignación abierto, o null
};
function team(){ return DATA.teams.find(t=>t.id===state.teamId) || null; }

// Los fondos se mantienen SIEMPRE en negro+morado de la interfaz (no se recolorean por
// selección). Esta función se conserva como no-op para no romper las llamadas del flujo.
function applyTeamTheme(){ /* intencionalmente vacío: identidad visual fija indigo/morado */ }

/* ============================================================
   GÉNERO DEL ENTRENADOR + DATOS DE PLANTILLA
   ============================================================ */
// Datos unificados del entrenador activo (real o creado), incluido su género,
// para redactar las noticias con concordancia (entrenador/entrenadora, el/la…).
function coachInfo(){
  const t = team();
  if(state.coachMode==="custom"){
    const c = state.customCoach || {};
    return { name: c.displayName || "Tu manager", gender: c.gender || "Masculino", photo: c.photo || null };
  }
  const c = (t && t.coach) || null;
  return { name: c ? c.displayName : "El entrenador", gender: (c && c.gender) || "Masculino", photo: c ? c.photo : null };
}
// Selector de concordancia: devuelve la forma femenina si el entrenador es mujer, la masculina si no.
function G(masc, fem){ return normLoose(coachInfo().gender)==="femenino" ? fem : masc; }

// Metadatos por posición básica (etiqueta ES, abreviatura y color de acento).
const POS_META = {
  GK:{ es:"Portero",       ab:"POR", col:"#F5C842" },
  DF:{ es:"Defensa",       ab:"DEF", col:"#34D399" },
  MF:{ es:"Mediocampista", ab:"MED", col:"#8B82FF" },
  FW:{ es:"Delantero",     ab:"DEL", col:"#FF6B4D" }
};
const POS_SEQ = ["GK","DF","MF","FW"];

// Jugadores REALES de la selección elegida, leídos en vivo del DB (mismo id que buildData).
// Respaldo: los que vinieran embebidos en el objeto mapeado (modo prototipo).
function teamPlayersRaw(){
  try{
    if(typeof DB!=="undefined" && DB && Array.isArray(DB.teams)){
      const dbt = DB.teams.find(t=>t.id===state.teamId);
      if(dbt && Array.isArray(dbt.players)) return dbt.players.slice();
    }
  }catch(e){}
  const t = team();
  return (t && Array.isArray(t.players)) ? t.players.slice() : [];
}
// Nombre a mostrar de un jugador (usa el helper global del juego si está disponible).
function pName(p){
  try{ if(typeof playerDisplayName==="function") return playerDisplayName(p); }catch(e){}
  const common = (p.commonName||"").trim();
  if(common) return common;
  const full = `${p.firstName||""} ${p.lastName||""}`.trim();
  return full || p.name || "Jugador";
}
// Apellido/etiqueta corta para las fichas de la cancha (última palabra del nombre a mostrar).
function pShort(p){
  const common = (p.commonName||"").trim();
  if(common) return common;
  const last = (p.lastName||"").trim();
  if(last) return last.split(/\s+/).pop();
  return pName(p).split(/\s+/).pop();
}
// Números favoritos de selección, separados por comas (hoy suelen venir vacíos → "—").
function favNumbersText(p){
  const arr = Array.isArray(p.favNumbersTeam) ? p.favNumbersTeam.filter(n=>n!=null && n!=="") : [];
  return arr.length ? arr.join(", ") : "—";
}
// Orden de preferencia dentro de la selección: más participaciones (caps) primero,
// luego mayor rating, luego mayor potencial. Las estrellas/veteranos quedan arriba.
function prefSort(a,b){
  return (b.caps||0)-(a.caps||0) || (b.rating||0)-(a.rating||0) || (b.ratingPotential||0)-(a.ratingPotential||0);
}

/* ============================================================
   PERSISTENCIA (solo simula "Cargar Partida" en el prototipo)
   ============================================================ */
function hasSavedGame(){ try{ return !!localStorage.getItem(CM26_ONBOARDING_KEY); }catch(e){ return false; } }
function readSavedGame(){ try{ return JSON.parse(localStorage.getItem(CM26_ONBOARDING_KEY)||"null"); }catch(e){ return null; } }
function saveGame(){
  const t = team(); if(!t) return;
  const rec = { teamId:t.id, teamName:t.name, coachMode:state.coachMode,
    coachName: state.coachMode==="custom" ? (state.customCoach&&state.customCoach.displayName) : (t.coach&&t.coach.displayName),
    mediaId: state.mediaId, savedAt: new Date().toISOString() };
  try{ localStorage.setItem(CM26_ONBOARDING_KEY, JSON.stringify(rec)); }catch(e){}
}
function clearGame(){ try{ localStorage.removeItem(CM26_ONBOARDING_KEY); }catch(e){} }

/* ============================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================================================ */
function go(screen){
  state.screen = screen;
  render();
}

function render(){
  let html = "";
  switch(state.screen){
    case "splash":   html = screenSplash(); break;
    case "pick":     html = screenPick(); break;
    case "coach":    html = screenCoach(); break;
    case "news":     html = screenNews(); break;
    case "tactics":  html = screenTactics(); break;
    case "squad":    html = screenSquad(); break;
    case "news2":    html = screenNews2(); break;
    case "handoff":  html = screenHandoff(); break;
  }
  // La atmósfera (blur pesado) vive una sola vez en el overlay y NO se recrea por pantalla:
  // esto abarata mucho las transiciones. Las pantallas se pintan en un contenedor aparte.
  if(!root.querySelector(".onb-screens")){
    root.innerHTML = `<div class="atmosphere"><div class="grain"></div></div><div class="onb-screens"></div>`;
  }
  const scr = root.querySelector(".onb-screens");
  // Preservar la posición de scroll de la lista de convocatoria (evita el "salto" al abrir menús).
  const prevSquad = (state.screen==="squad") ? (function(){ const e=scr.querySelector(".cv-stage"); return e?e.scrollTop:null; })() : null;
  scr.innerHTML = html;
  if(prevSquad!=null){ const e=scr.querySelector(".cv-stage"); if(e) e.scrollTop = prevSquad; }
  // Si hay un menú de dorsal abierto, posiciónalo en el número correspondiente (ej. dorsal 19 → desde el 19).
  if(state.screen==="squad" && state.convMenu){
    const menu = scr.querySelector(".cv-menu");
    if(menu){
      // Dirección dinámica: si abierto hacia abajo se sale de la pantalla, ábrelo hacia arriba (y viceversa).
      try{
        const vh = (typeof window!=="undefined" && window.innerHeight) ? window.innerHeight : 0;
        const r = menu.getBoundingClientRect ? menu.getBoundingClientRect() : {top:0,bottom:0};
        if(vh && (r.top || r.bottom)){
          if(!menu.classList.contains("up") && r.bottom > vh-12) menu.classList.add("up");
          else if(menu.classList.contains("up") && r.top < 12) menu.classList.remove("up");
        }
      }catch(e){}
      let it = menu.querySelector(".cv-menu-item.sel");
      if(!it){
        const wanted = state.convMenu;
        const list = [...menu.querySelectorAll(".cv-menu-item[data-num]")];
        it = list.find(x=>parseInt(x.dataset.num,10)>=wanted) || list[0];
      }
      if(it){ const head = menu.querySelector(".cv-menu-head"); const off = head?head.offsetHeight:0; menu.scrollTop = Math.max(0, it.offsetTop - off); }
    }
  }
  wire();
  const active = $(".screen");
  if(active){ active.classList.add("active","enter"); }
  if(state.screen==="tactics"){ fillJerseys(); }
}

// Caché de playeras (dorso local real) por jugador para no recomputar el canvas en cada
// cambio de formación/estilo. Se reconstruye si cambia la selección.
let _jerseyCache = {};
let _jerseyCacheTeam = null;
// Precalienta la caché de playeras del once probable (mejores por posición para 4-4-2 y 4-3-3),
// en segundo plano y una por frame, para que "Define tu táctica" abra con las playeras ya listas.
function prefetchJerseys(){
  if(typeof buildPlayerNumberBadgeDataURL!=="function" || typeof getPlayerWithTeam!=="function") return;
  if(_jerseyCacheTeam!==state.teamId){ _jerseyCache = {}; _jerseyCacheTeam = state.teamId; }
  const need = {};
  ["4-4-2","4-3-3"].forEach(fid=>{
    const f = FORMATIONS[fid]; if(!f) return;
    const byCat = {};
    (f.slots||[]).forEach(s=>{ byCat[s.cat] = (byCat[s.cat]||0)+1; });
    Object.keys(byCat).forEach(cat=>{
      bestByPosition(cat, byCat[cat]).forEach(p=>{ if(p && !_jerseyCache[p.id]) need[p.id]=1; });
    });
  });
  const ids = Object.keys(need);
  let i = 0;
  const schedule = ()=> (typeof requestAnimationFrame==="function" ? requestAnimationFrame(step) : setTimeout(step,0));
  function step(){
    if(i>=ids.length) return;
    const pid = ids[i++];
    if(_jerseyCache[pid]){ schedule(); return; }
    Promise.resolve().then(async ()=>{
      try{ const { player, team } = getPlayerWithTeam(pid); if(player){ const url = await buildPlayerNumberBadgeDataURL(player, team, 420); if(url) _jerseyCache[pid]=url; } }catch(e){}
      schedule();
    });
  }
  schedule();
}
function fillJerseys(){
  if(typeof buildPlayerNumberBadgeDataURL!=="function" || typeof getPlayerWithTeam!=="function") return;
  if(_jerseyCacheTeam!==state.teamId){ _jerseyCache = {}; _jerseyCacheTeam = state.teamId; }
  const els = [...document.querySelectorAll("#cm-onb .lu-jersey[data-pending][data-player-id]")];
  let i = 0;
  const schedule = ()=> (typeof requestAnimationFrame==="function" ? requestAnimationFrame(step) : setTimeout(step,0));
  function step(){
    if(state.screen!=="tactics") return;      // la pantalla cambió: abortar
    if(i>=els.length) return;
    const el = els[i++]; el.removeAttribute("data-pending");
    const pid = el.dataset.playerId;
    if(_jerseyCache[pid]){ el.innerHTML = `<img src="${_jerseyCache[pid]}" alt="">`; schedule(); return; }
    Promise.resolve().then(async ()=>{
      try{
        const { player, team } = getPlayerWithTeam(pid);
        if(player){
          const url = await buildPlayerNumberBadgeDataURL(player, team, 420);
          if(url){ _jerseyCache[pid] = url; el.innerHTML = `<img src="${url}" alt="">`; }
          else el.style.display = "none";
        }
      }catch(e){ el.style.display = "none"; }
      schedule();   // siguiente playera en el próximo frame (no bloquea)
    });
  }
  schedule();
}

// Envuelve una pantalla (la atmósfera ya está en el overlay, no aquí).
function shell(id, inner){
  return `<section class="screen active" id="${id}">
    <div class="stage">${inner}</div>
  </section>`;
}
function stepper(now){
  const steps = ["pick","coach","news","tactics","squad"];
  return `<div class="stepper">${steps.map(s=>{
    const i = steps.indexOf(s), n = steps.indexOf(now);
    const cls = i<n ? "done" : (i===n ? "now" : "");
    return `<span class="pip ${cls}"></span>`;
  }).join("")}</div>`;
}
// Pie flotante común: SIEMPRE abajo a la derecha. Volver pequeño/gris, Continuar grande/morado.
function flowFooter(back, next){
  return `<div class="flow-foot">
    ${back?`<button class="btn ghost flow-back" data-act="${back.act}">← Volver</button>`:""}
    ${next?`<button class="btn big" id="flow-next" data-act="${next.act}" ${next.disabled?"disabled":""}>${esc(next.label||"Continuar")} →</button>`:""}
  </div>`;
}

/* ============================================================
   1) SPLASH
   ============================================================ */
function screenSplash(){
  const saved = readSavedGame();
  const savedPill = saved ? `<div class="saved-pill"><span class="dot"></span>Partida guardada · ${esc(saved.teamName)}${saved.coachName?` · ${esc(saved.coachName)}`:""}</div>` : "";
  return shell("s-splash", `
    <img class="splash-crest" src="${APP_CREST}" alt="Copa Manager 2026">
    <h1 class="splash-title">COPA MANAGER <span class="yr">2026</span></h1>
    <p class="splash-sub">Toma el mando de una selección rumbo al Mundial. Arma tu lista, juega a tu manera y cambia la historia.</p>
    ${savedPill}
    <div class="splash-actions">
      <button class="btn big" data-act="start">Iniciar Partida</button>
      <button class="btn ghost big" data-act="load">Cargar Partida</button>
    </div>
    <button class="temp-skip" data-act="skip-to-sim" title="Botón temporal — se eliminará">⏭ Ir al simulador (temporal)</button>
    <div class="splash-foot">Prototipo de pantallas iniciales · para integrar</div>
  `);
}

/* ============================================================
   2) SELECCIÓN
   ============================================================ */
let pickQuery = "";
let pickSort = "grupos"; // "grupos" (orden de sorteo A1,A2…) | "alfabetico"
function screenPick(){
  return shell("s-pick", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 1 de 3</div>
        <h2>Elige tu selección</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("pick")}
    </div>
    <div class="pick-toolbar">
      <div class="pick-search">
        <span class="ic">🔎</span>
        <input id="pick-q" type="text" placeholder="Buscar por nombre o código…" autocomplete="off" spellcheck="false" value="${esc(pickQuery)}">
      </div>
      <div class="seg" role="tablist" aria-label="Ordenar selecciones">
        <button class="seg-btn ${pickSort==='grupos'?'on':''}" data-act="sort-grupos" role="tab">Por grupos</button>
        <button class="seg-btn ${pickSort==='alfabetico'?'on':''}" data-act="sort-alfabetico" role="tab">A–Z</button>
      </div>
      <span class="pick-count" id="pick-count"></span>
    </div>
    <div class="pick-scroll">
      <div class="pick-grid" id="pick-grid"></div>
    </div>
    ${flowFooter({act:"to-splash", label:"Inicio"}, {act:"to-coach", disabled:!state.teamId})}
  `);
}
function tileRatingBlock(r){
  r = r || {};
  const num = v => (v!=null ? String(v) : "-");
  const row = (label, v) => `<div class="rb-l">${label}</div><div class="rb-v">${num(v)}</div>`;
  return `<div class="tile-rating">
    <div class="rb-big">${num(r.overall)}</div>
    <div class="rb-cap">Rating</div>
    <div class="rb-grid">${row("ATT", r.att)}${row("MID", r.mid)}${row("DEF", r.def)}</div>
  </div>`;
}
function tileHTML(t){
  const sel = t.id===state.teamId ? "selected" : "";
  return `<button class="team-tile ${sel}" data-tile="${t.id}" style="--t1:${t.color1};--t2:${t.color2}">
    <div class="tile-head">
      ${flagBadgeHTML(t)}
      <span class="tile-name">${esc(t.name)}</span>
    </div>
    <div class="tile-body">
      <div class="tile-crest">${crestHTML(t)}</div>
      <div class="tile-right">
        ${tileRatingBlock(t.ratings)}
        <div class="tile-badges">
          <span class="badge">${esc(t.conf)}</span>
          ${t.fifaRank?`<span class="badge">FIFA #${t.fifaRank}</span>`:""}
        </div>
      </div>
    </div>
  </button>`;
}
// Rellena banderas y escudos de forma PEREZOSA: solo cuando el tile entra (o está por entrar)
// en pantalla. Así, aunque el JSON traiga logos base64 pesados, no se decodifican los 48 de golpe
// y la transición es instantánea. El src se asigna por propiedad, nunca dentro del HTML.
// Nota de rendimiento: los logos/banderas se pintan con <img src> DIRECTO dentro del HTML del tile
// (exactamente como el simulador con 200+ equipos, que carga al instante). No hacemos canvas,
// toDataURL, IntersectionObserver ni miniaturas: ese trabajo extra era justo lo que ralentizaba.
function renderPickGrid(){
  const q = normLoose(pickQuery);
  let list = DATA.teams.filter(t=> !q || normLoose(t.name).includes(q) || normLoose(t.code).includes(q) || normLoose(t.conf).includes(q));
  const grid = $("#pick-grid");
  const emptyMsg = `<div style="color:var(--muted);padding:30px;text-align:center;">Ninguna selección coincide con “${esc(pickQuery)}”.</div>`;
  if(grid){
    if(pickSort==="alfabetico"){
      // A–Z: mismo formato de 4 por fila, pero en orden alfabético y sin encabezados de grupo.
      list = list.slice().sort((a,b)=> a.name.localeCompare(b.name,"es"));
      grid.className = "pick-grid grouped";
      grid.innerHTML = list.length ? `<div class="pick-group-grid">${list.map(tileHTML).join("")}</div>` : emptyMsg;
    } else {
      // Por grupos: 4 tiles por fila en el orden real de sorteo (A1, A2, A3, A4; B1…) con encabezado.
      list = list.slice().sort((a,b)=> a.group.localeCompare(b.group) || (a.slotIdx-b.slotIdx) || a.name.localeCompare(b.name,"es"));
      const groups = {}; list.forEach(t=>{ (groups[t.group]=groups[t.group]||[]).push(t); });
      const letters = Object.keys(groups).sort();
      grid.className = "pick-grid grouped";
      grid.innerHTML = letters.length ? letters.map(g=>`
        <section class="pick-group">
          <h3 class="pick-group-head"><span class="tag">Grupo ${esc(g)}</span></h3>
          <div class="pick-group-grid">${groups[g].map(tileHTML).join("")}</div>
        </section>`).join("") : emptyMsg;
    }
  }
  const cnt = $("#pick-count"); if(cnt) cnt.textContent = `${list.length} / ${DATA.teams.length}`;
  const nx = $("#flow-next"); if(nx) nx.disabled = !state.teamId;
}
function renderPickBar(){ /* obsoleto: la confirmación ahora vive en el pie flotante */ }

/* ============================================================
   3) ENTRENADOR
   ============================================================ */
let managerFormOpen = false;
function screenCoach(){
  const t = team();
  return shell("s-coach", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 2 de 3 · ${esc(t.name)}</div>
        <h2>¿Quién dirige a ${esc(t.name)}?</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("coach")}
    </div>
    <div class="coach-stage" id="coach-stage">
      ${managerFormOpen ? managerFormHTML(t) : coachChoiceHTML(t)}
    </div>
  `);
}
function coachChoiceHTML(t){
  const c = t.coach;
  const created = !!(state.customCoach && state.customCoach.displayName);
  const realSel = state.coachMode==="real" ? "selected" : "";
  const custSel = state.coachMode==="custom" ? "selected" : "";
  const realPhoto = personPhotoHTML(c && c.photo, c && c.gender);
  const cc = state.customCoach || {};

  // Segunda tarjeta: si ya se creó un manager, muestra su foto + nombre; si no, la invitación a crearlo.
  const customCard = created ? `
      <div class="coach-card ${custSel}" data-act="pick-custom" role="button" tabindex="0">
        <div class="kicker">Tu manager</div>
        <div class="coach-person">
          <div class="coach-photo">${personPhotoHTML(cc.photo, cc.gender)}</div>
          <div class="coach-meta">
            <div class="nm">${esc(cc.displayName)}</div>
            <div class="role">Al mando de ${esc(t.name)}</div>
            <div class="sub">${flagImgHTML(cc.natFlag||cc.natIso, cc.natCountry)}${esc(cc.natDemonym||cc.natCountry||"Sin nacionalidad")}${cc.birthDate?` · ${esc(ageText(cc.birthDate))}`:""}</div>
          </div>
        </div>
        <div style="margin-top:auto;"><button type="button" class="link-btn" data-act="open-manager" style="padding-left:0;">Editar manager</button></div>
      </div>` : `
      <button class="coach-card create ${custSel}" data-act="open-manager">
        <div class="kicker">Tu carrera</div>
        <div class="create-icon">✎</div>
        <div class="create-copy">
          <h3>Crea tu manager</h3>
          <p>Diseña tu propio entrenador y reemplaza a ${esc(c?c.displayName:"el DT")} al frente de ${esc(t.name)}.</p>
        </div>
      </button>`;

  return `
    <div class="coach-grid">
      <button class="coach-card ${realSel}" data-act="pick-real">
        <div class="kicker">Entrenador real</div>
        <div class="coach-person">
          <div class="coach-photo">${realPhoto}</div>
          <div class="coach-meta">
            <div class="nm">${esc(c?c.displayName:"—")}</div>
            <div class="role">Juega como ${esc(c?c.displayName:"el DT")}</div>
            <div class="sub">${flagImgHTML(c&&(c.natFlag||c.natIso), c&&c.natCountry)}${esc(c?(c.natDemonym||c.natCountry||""):"")} · ${esc(c?ageText(c.birthDate):"")}</div>
          </div>
        </div>
        <div class="coach-rating"><span class="n">${c&&c.rating!=null?c.rating:"—"}</span><span class="l">Rating</span></div>
      </button>

      ${customCard}
    </div>
    ${flowFooter({act:"to-pick", label:"Cambiar selección"}, {act:"to-news", disabled:!state.coachMode})}
  `;
}
function managerFormHTML(t){
  const c = state.customCoach || {};
  const genders = (typeof PERSON_GENDERS!=="undefined" && PERSON_GENDERS.length) ? PERSON_GENDERS : ["Masculino","Femenino"];
  const photo = c.photo ? `<img src="${c.photo}" alt="">` : avatarSVG(c.gender);
  // Todas las nacionalidades válidas del juego (no solo las 48 mundialistas).
  const countrySrc = (typeof DB!=="undefined" && DB && Array.isArray(DB.countries) && DB.countries.length) ? DB.countries : [];
  let opts;
  if(countrySrc.length){
    opts = countrySrc.filter(x=>x && (x.commonName||x.name)).map(x=>({
      name: (x.commonName||x.name),
      flag: flagSrcOf(x) || x.flag || x.iso || null
    }));
  } else {
    opts = DATA.teams.map(x=>({name:x.name, flag:x.flag||x.iso}));
  }
  const seenNat = new Set();
  opts = opts.filter(o=>{ const k=normLoose(o.name); if(!k||seenNat.has(k)) return false; seenNat.add(k); return true; })
    .sort((a,b)=>a.name.localeCompare(b.name,"es"));
  return `
    <form class="manager-form" id="manager-form" autocomplete="off">
      <h3>Crea tu manager</h3>
      <div class="hint">Reemplazará a ${esc(t.coach?t.coach.displayName:"el entrenador")} en la selección de ${esc(t.name)}.</div>
      <div class="form-grid">
        <label class="field">Nombre
          <input id="m-first" value="${esc(c.firstName||"")}" placeholder="p. ej. Jonathan">
        </label>
        <label class="field">Apellido
          <input id="m-last" value="${esc(c.lastName||"")}" placeholder="p. ej. Herrera">
        </label>
        <label class="field full">Nombre a mostrar
          <input id="m-disp" value="${esc(c.displayName||"")}" placeholder="Se completa solo con Nombre + Apellido">
          <span class="echo" id="m-disp-echo"></span>
        </label>
        <label class="field">Nacionalidad
          <select id="m-nat">
            <option value="">—</option>
            ${opts.map(o=>`<option value="${esc(o.name)}" data-flag="${esc(o.flag||"")}" ${normLoose(o.name)===normLoose(c.natCountry||"")?"selected":""}>${esc(o.name)}</option>`).join("")}
          </select>
        </label>
        <label class="field">Género
          <select id="m-gender">
            ${genders.map(g=>`<option value="${esc(g)}" ${normLoose(g)===normLoose(c.gender||"Masculino")?"selected":""}>${esc(g)}</option>`).join("")}
          </select>
        </label>
        <label class="field">Fecha de nacimiento
          <input id="m-birth" type="date" value="${esc(c.birthDate||"")}" max="2010-01-01">
          <span class="echo" id="m-age-echo"></span>
        </label>
        <div class="avatar-row">
          <div class="avatar-prev" id="m-avatar">${photo}</div>
          <div>
            <label class="field" style="gap:8px;">Foto (opcional)
              <input id="m-photo" type="file" accept="image/*" style="font-size:12px;padding:7px;">
            </label>
          </div>
        </div>
      </div>
      <div class="manager-foot">
        <button type="button" class="link-btn" data-act="cancel-manager">← Volver a las opciones</button>
        <button type="button" class="btn" data-act="save-manager">Guardar y continuar →</button>
      </div>
    </form>
  `;
}

/* ============================================================
   4) NOTICIA
   ============================================================ */
// Alias país→medio para emparejar selecciones con medios locales.
const COUNTRY_MEDIA_ALIAS = {
  "inglaterra":"reino unido", "escocia":"reino unido",
  "estados unidos":"estados unidos", "eeuu":"estados unidos",
  "corea del sur":"corea del sur", "arabia saudita":"medio oriente",
  "catar":"medio oriente", "jordania":"medio oriente", "iran":"medio oriente", "irak":"medio oriente"
};
// Devuelve la lista ordenada de medios candidatos para una selección: locales primero, luego internacionales.
function outletsFor(t){
  const target = new Set([normLoose(t.name), normLoose(t.officialName)]);
  const alias = COUNTRY_MEDIA_ALIAS[normLoose(t.name)];
  if(alias) target.add(normLoose(alias));
  const local = [], intl = [];
  DATA.media.forEach(m=>{
    const mc = normLoose(m.country);
    if(target.has(mc)) local.push(m);
    else if(mc==="internacional" || mc==="") intl.push(m);
  });
  // Ordenar por alcance descendente dentro de cada grupo.
  local.sort((a,b)=>b.reach-a.reach); intl.sort((a,b)=>b.reach-a.reach);
  const rest = DATA.media.filter(m=>!local.includes(m)&&!intl.includes(m)).sort((a,b)=>b.reach-a.reach);
  const ordered = [...local, ...intl, ...rest];
  return (ordered.length ? ordered : DATA.media.slice()).slice(0, 5); // máximo 5 medios
}
const NEWS_DATE = "1 de junio de 2026";
function currentOutlet(t){
  const list = outletsFor(t);
  const i = ((state.outletCycle % list.length)+list.length)%list.length;
  const m = list[i];
  state.mediaId = m.id;
  return m;
}
function headlineFor(t, i){
  i = ((i % 3)+3)%3;
  const c = t.coach;
  if(state.coachMode==="custom"){
    const nm = (state.customCoach && state.customCoach.displayName) || "Tu manager";
    const V = [
      `${nm} toma el mando de la selección de ${t.name} a pocos días del Mundial`,
      `${nm} es ${G('el nuevo entrenador','la nueva entrenadora')} de ${t.name} a las puertas del Mundial`,
      `${nm} llega al banquillo de ${t.name} para el Mundial 2026`
    ];
    return V[i];
  }
  const nm = c ? c.displayName : "El entrenador";
  const V = [
    `${nm} listo para dar su lista de ${SQUAD_MAX} jugadores`,
    `${nm} define a los ${SQUAD_MAX} elegidos de ${t.name}`,
    `${nm} afina la convocatoria: ${SQUAD_MAX} nombres para el Mundial`
  ];
  return V[i];
}
function ledeFor(t, i){
  i = ((i % 3)+3)%3;
  if(state.coachMode==="custom"){
    const nm = (state.customCoach && state.customCoach.displayName) || G("el nuevo técnico","la nueva técnica");
    const V = [
      `A pocos días del arranque del Mundial 2026, <b>${esc(nm)}</b> asume la conducción de <b>${esc(t.name)}</b>. La afición aguarda sus primeras decisiones: convocatoria, once base e identidad del equipo quedan en sus manos.`,
      `Comienza una nueva era en <b>${esc(t.name)}</b>: <b>${esc(nm)}</b> toma las riendas con el Mundial 2026 a la vuelta de la esquina. Todos los focos apuntan ahora a su lista de convocados.`,
      `<b>${esc(nm)}</b> llega al banquillo de <b>${esc(t.name)}</b> en la recta final rumbo al Mundial 2026. Su primer reto: definir el grupo que peleará por la gloria.`
    ];
    return V[i];
  }
  const nm = t.coach ? t.coach.displayName : "el entrenador";
  const V = [
    `<b>${esc(nm)}</b> ultima los detalles antes de anunciar los <b>${SQUAD_MAX}</b> convocados de <b>${esc(t.name)}</b>. La expectativa crece: cada nombre puede cambiar el rumbo en el Mundial 2026.`,
    `Cuenta regresiva en <b>${esc(t.name)}</b>: <b>${esc(nm)}</b> afina la lista de <b>${SQUAD_MAX}</b> jugadores que buscarán la gloria en el Mundial 2026.`,
    `Todo listo en el cuerpo técnico. <b>${esc(nm)}</b> prepara el anuncio de los <b>${SQUAD_MAX}</b> elegidos de <b>${esc(t.name)}</b> para la cita mundialista.`
  ];
  return V[i];
}
// Tarjeta de noticia reutilizable (un medio + su titular/cuerpo), con paginador opcional.
function newsCardHTML(t, m, headline, lede, pager){
  const pagerHTML = (pager && pager.total>1) ? `<div class="outlet-pager">
    <button class="pager-btn" data-act="outlet-prev" aria-label="Medio anterior">‹</button>
    <span class="pager-count mono">${pager.idx+1}/${pager.total}</span>
    <button class="pager-btn" data-act="outlet-next" aria-label="Medio siguiente">›</button>
  </div>` : "";
  return `<article class="news-paper" style="--outlet-1:${m.color1};--outlet-2:${m.color2};--outlet-3:${m.color3||'#fff'}">
    <header class="news-masthead">
      <div class="news-logo">${m.logoImg?`<img src="${m.logoImg}" alt="${esc(m.name)}">`:`<span class="news-wordmark">${esc(m.name)}</span>`}</div>
      <div class="spacer"></div>
      <span class="news-live">Última hora</span>
    </header>
    <div class="news-body">
      <div class="news-kicker">${flagImgHTML(t.flag||t.iso, t.name)} Selección de ${esc(t.name)}</div>
      <h1 class="news-headline">${esc(headline)}.</h1>
      <p class="news-lede">${lede}</p>
    </div>
    <footer class="news-foot"><span class="byline">${esc(NEWS_DATE)}</span><div class="spacer"></div>${pagerHTML}</footer>
  </article>`;
}
// Hasta 3 medios distintos para el carrusel de noticias.
function newsOutlets(t){ return outletsFor(t).slice(0,3); }
function screenNews(){
  const t = team();
  const outlets = newsOutlets(t);
  const total = outlets.length || 1;
  const idx = ((state.outletCycle % total)+total)%total;
  const m = outlets[idx] || outlets[0];
  if(m) state.mediaId = m.id;
  return shell("s-news", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 3 de 5 · ${esc(t.name)}</div>
        <h2>La prensa reacciona</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("news")}
    </div>
    <div class="news-stage">
      ${m ? newsCardHTML(t, m, headlineFor(t,idx), ledeFor(t,idx), {idx,total}) : ""}
    </div>
    ${flowFooter({act:"to-coach"}, {act:"to-tactics"})}
  `);
}

/* ============================================================
   4b) TÁCTICA — formación + estilo de juego sobre la cancha
   ============================================================ */
const VALID_POS_SET = new Set(["GK","DF","MF","FW"]);
// Icono de posición idéntico al de la Convocatoria/perfil (clases .pos-chip .pos-XX).
function posChipHTML(pos){
  const p = VALID_POS_SET.has(pos) ? pos : "MF";
  return `<span class="pos-chip pos-${p}">${p}</span>`;
}

// Formaciones: cada línea cae en el centro de una franja (y en %), equidistantes
// entre portero, defensas, mediocampistas y delanteros. x en % (banda izquierda→derecha).
// Rejilla del Excel de formaciones: 12 columnas (A–L) x 11 filas (1–11) sobre la cancha.
// Cada slot trae su columna/fila; la posición en % se calcula sobre el rectángulo jugable
// (ajustable en FIELD) para que TODO quede centrado y alineado como en el mapa.
const GRID_COLS = 12, GRID_ROWS = 11;
const FIELD = { x0:11, x1:89, y0:6, y1:94 };
function cellX(c){ return FIELD.x0 + (c-0.5)/GRID_COLS*(FIELD.x1-FIELD.x0); }
function cellY(r){ return FIELD.y0 + (r-0.5)/GRID_ROWS*(FIELD.y1-FIELD.y0); }
const FORMATIONS = {
  "3-1-4-2":{label:"3-1-4-2",desc:"Formación 3-1-4-2. Ataque · Balance.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:6.5,r:5.5},{p:"CB",cat:"DF",c:3.5,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "3-4-1-2":{label:"3-4-1-2",desc:"Formación 3-4-1-2. Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:4.0},{p:"LM",cat:"MF",c:2.0,r:4.5},{p:"RM",cat:"MF",c:11.0,r:4.5},{p:"CM",cat:"MF",c:4.5,r:5.5},{p:"CM",cat:"MF",c:8.5,r:5.5},{p:"CB",cat:"DF",c:3.5,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "3-4-2-1":{label:"3-4-2-1",desc:"Formación 3-4-2-1. Ataque.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"CAM",cat:"MF",c:4.0,r:3.0},{p:"CAM",cat:"MF",c:9.0,r:3.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CM",cat:"MF",c:5.0,r:6.0},{p:"CM",cat:"MF",c:8.0,r:6.0},{p:"CB",cat:"DF",c:3.5,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "3-4-3":{label:"3-4-3",desc:"Formación 3-4-3. Ataque.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LW",cat:"FW",c:3.0,r:3.0},{p:"RW",cat:"FW",c:10.0,r:3.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"CM",cat:"MF",c:5.0,r:5.0},{p:"CM",cat:"MF",c:8.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CB",cat:"DF",c:3.5,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "3-5-2":{label:"3-5-2",desc:"Formación 3-5-2. Balance · Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:4.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:4.5,r:6.0},{p:"CDM",cat:"MF",c:8.5,r:6.0},{p:"CB",cat:"DF",c:3.5,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-1-2-1-2 (Narrow)":{label:"4-1-2-1-2 (Narrow)",desc:"Formación 4-1-2-1-2 (Narrow). Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:4.0},{p:"CM",cat:"MF",c:4.0,r:5.5},{p:"CM",cat:"MF",c:9.0,r:5.5},{p:"CDM",cat:"MF",c:6.5,r:7.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-1-2-1-2 (Wide)":{label:"4-1-2-1-2 (Wide)",desc:"Formación 4-1-2-1-2 (Wide). Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:4.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:6.5,r:7.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-1-3-2":{label:"4-1-3-2",desc:"Formación 4-1-3-2. Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CM",cat:"MF",c:6.5,r:4.5},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:6.5,r:7.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-1-4-1":{label:"4-1-4-1",desc:"Formación 4-1-4-1. Defensa · Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"CM",cat:"MF",c:5.0,r:5.0},{p:"CM",cat:"MF",c:8.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:6.5,r:6.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-2-2-2":{label:"4-2-2-2",desc:"Formación 4-2-2-2. Ataque · Balance.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:3.5,r:4.5},{p:"CAM",cat:"MF",c:9.5,r:4.5},{p:"CDM",cat:"MF",c:5.5,r:6.0},{p:"CDM",cat:"MF",c:7.5,r:6.0},{p:"LB",cat:"DF",c:2.0,r:8.0},{p:"CB",cat:"DF",c:4.5,r:8.0},{p:"CB",cat:"DF",c:8.5,r:8.0},{p:"RB",cat:"DF",c:11.0,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-2-3-1 (Narrow)":{label:"4-2-3-1 (Narrow)",desc:"Formación 4-2-3-1 (Narrow). Balance · Defensa.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"CAM",cat:"MF",c:4.5,r:3.5},{p:"CAM",cat:"MF",c:8.5,r:3.5},{p:"CAM",cat:"MF",c:6.5,r:5.0},{p:"CDM",cat:"MF",c:4.0,r:6.5},{p:"CDM",cat:"MF",c:9.0,r:6.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-2-3-1 (Wide)":{label:"4-2-3-1 (Wide)",desc:"Formación 4-2-3-1 (Wide). Balance · Defensa.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LM",cat:"MF",c:2.0,r:4.5},{p:"RM",cat:"MF",c:11.0,r:4.5},{p:"CAM",cat:"MF",c:6.5,r:5.0},{p:"CDM",cat:"MF",c:4.0,r:6.5},{p:"CDM",cat:"MF",c:9.0,r:6.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-2-4":{label:"4-2-4",desc:"Formación 4-2-4. Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"LW",cat:"FW",c:3.0,r:3.0},{p:"RW",cat:"FW",c:10.0,r:3.0},{p:"CM",cat:"MF",c:5.0,r:5.0},{p:"CM",cat:"MF",c:8.0,r:5.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-1-2":{label:"4-3-1-2",desc:"Formación 4-3-1-2. Balance · Ataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:3.0},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"CM",cat:"MF",c:6.5,r:6.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-2-1":{label:"4-3-2-1",desc:"Formación 4-3-2-1. Balance · Ataque.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"CAM",cat:"MF",c:5.0,r:2.5},{p:"CAM",cat:"MF",c:8.0,r:2.5},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:6.5,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-3":{label:"4-3-3",desc:"Formación 4-3-3. Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LW",cat:"FW",c:3.0,r:2.5},{p:"RW",cat:"FW",c:10.0,r:2.5},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:6.5,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-3 (Attack)":{label:"4-3-3 (Attack)",desc:"Formación 4-3-3 (Attack). Ataque · Presión alta.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LW",cat:"FW",c:3.0,r:2.5},{p:"RW",cat:"FW",c:10.0,r:2.5},{p:"CAM",cat:"MF",c:6.5,r:4.5},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-3 (Defend)":{label:"4-3-3 (Defend)",desc:"Formación 4-3-3 (Defend). Defensa · Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LW",cat:"FW",c:3.0,r:2.5},{p:"RW",cat:"FW",c:10.0,r:2.5},{p:"CM",cat:"MF",c:6.5,r:5.0},{p:"CDM",cat:"MF",c:4.0,r:6.0},{p:"CDM",cat:"MF",c:9.0,r:6.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-3-3 (Holding)":{label:"4-3-3 (Holding)",desc:"Formación 4-3-3 (Holding). Balance · Defensa.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LW",cat:"FW",c:3.0,r:2.5},{p:"RW",cat:"FW",c:10.0,r:2.5},{p:"CM",cat:"MF",c:4.0,r:5.0},{p:"CM",cat:"MF",c:9.0,r:5.0},{p:"CDM",cat:"MF",c:6.5,r:6.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-4-1-1":{label:"4-4-1-1",desc:"Formación 4-4-1-1. Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"CAM",cat:"MF",c:6.5,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CM",cat:"MF",c:4.0,r:5.5},{p:"CM",cat:"MF",c:9.0,r:5.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-4-2":{label:"4-4-2",desc:"Formación 4-4-2. Balance.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"CM",cat:"MF",c:5.0,r:5.0},{p:"CM",cat:"MF",c:8.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-4-2 (Holding)":{label:"4-4-2 (Holding)",desc:"Formación 4-4-2 (Holding). Balance · Defensa.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CDM",cat:"MF",c:5.0,r:5.5},{p:"CDM",cat:"MF",c:8.0,r:5.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-5-1":{label:"4-5-1",desc:"Formación 4-5-1. Defensa · Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LM",cat:"MF",c:2.0,r:4.5},{p:"RM",cat:"MF",c:11.0,r:4.5},{p:"CM",cat:"MF",c:4.5,r:5.0},{p:"CM",cat:"MF",c:8.5,r:5.0},{p:"CM",cat:"MF",c:6.5,r:5.5},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "4-5-1 (Attack)":{label:"4-5-1 (Attack)",desc:"Formación 4-5-1 (Attack). Ataque · Balance.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"CAM",cat:"MF",c:4.5,r:4.0},{p:"CAM",cat:"MF",c:8.5,r:4.0},{p:"LM",cat:"MF",c:2.0,r:5.0},{p:"RM",cat:"MF",c:11.0,r:5.0},{p:"CM",cat:"MF",c:6.5,r:6.0},{p:"LB",cat:"DF",c:2.5,r:8.0},{p:"CB",cat:"DF",c:5.0,r:8.0},{p:"CB",cat:"DF",c:8.0,r:8.0},{p:"RB",cat:"DF",c:10.5,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "5-2-1-2":{label:"5-2-1-2",desc:"Formación 5-2-1-2. Defensa · Contraataque.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CAM",cat:"MF",c:6.5,r:4.0},{p:"CM",cat:"MF",c:4.5,r:5.0},{p:"CM",cat:"MF",c:8.5,r:5.0},{p:"LB",cat:"DF",c:2.0,r:7.0},{p:"RB",cat:"DF",c:11.0,r:7.0},{p:"CB",cat:"DF",c:4.0,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.0,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "5-3-2":{label:"5-3-2",desc:"Formación 5-3-2. Defensa · Balance.",slots:[{p:"ST",cat:"FW",c:5.0,r:2.0},{p:"ST",cat:"FW",c:8.0,r:2.0},{p:"CM",cat:"MF",c:3.0,r:4.5},{p:"CM",cat:"MF",c:10.0,r:4.5},{p:"CDM",cat:"MF",c:6.5,r:5.0},{p:"LB",cat:"DF",c:2.0,r:7.0},{p:"RB",cat:"DF",c:11.0,r:7.0},{p:"CB",cat:"DF",c:4.0,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.0,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
  "5-4-1":{label:"5-4-1",desc:"Formación 5-4-1. Defensa · Ultradefensa.",slots:[{p:"ST",cat:"FW",c:6.5,r:2.0},{p:"LM",cat:"MF",c:2.0,r:4.0},{p:"RM",cat:"MF",c:11.0,r:4.0},{p:"CM",cat:"MF",c:4.5,r:5.0},{p:"CM",cat:"MF",c:8.5,r:5.0},{p:"LB",cat:"DF",c:2.0,r:7.0},{p:"RB",cat:"DF",c:11.0,r:7.0},{p:"CB",cat:"DF",c:4.0,r:8.0},{p:"CB",cat:"DF",c:6.5,r:8.0},{p:"CB",cat:"DF",c:9.0,r:8.0},{p:"GK",cat:"GK",c:6.5,r:11.0}]},
};
const FORMATION_GROUPS = [{label:"Línea de 3",ids:["3-1-4-2", "3-4-1-2", "3-4-2-1", "3-4-3", "3-5-2"]},{label:"Línea de 4",ids:["4-1-2-1-2 (Narrow)", "4-1-2-1-2 (Wide)", "4-1-3-2", "4-1-4-1", "4-2-2-2", "4-2-3-1 (Narrow)", "4-2-3-1 (Wide)", "4-2-4", "4-3-1-2", "4-3-2-1", "4-3-3", "4-3-3 (Attack)", "4-3-3 (Defend)", "4-3-3 (Holding)", "4-4-1-1", "4-4-2", "4-4-2 (Holding)", "4-5-1", "4-5-1 (Attack)"]},{label:"Línea de 5",ids:["5-2-1-2", "5-3-2", "5-4-1"]}];
const FORMATION_IDS = ["3-1-4-2", "3-4-1-2", "3-4-2-1", "3-4-3", "3-5-2", "4-1-2-1-2 (Narrow)", "4-1-2-1-2 (Wide)", "4-1-3-2", "4-1-4-1", "4-2-2-2", "4-2-3-1 (Narrow)", "4-2-3-1 (Wide)", "4-2-4", "4-3-1-2", "4-3-2-1", "4-3-3", "4-3-3 (Attack)", "4-3-3 (Defend)", "4-3-3 (Holding)", "4-4-1-1", "4-4-2", "4-4-2 (Holding)", "4-5-1", "4-5-1 (Attack)", "5-2-1-2", "5-3-2", "5-4-1"];

// Imagen de cancha compartida por el usuario (cancha_01), optimizada y embebida (una sola imagen).
const PITCH_IMG = "data:image/png;base64,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";
// Cancha vertical estilo cancha_01: marco redondeado, franjas horizontales y todas las marcas.
function pitchImageHTML(){
  return `<div class="tac-field"></div>`;
}
// Mejores jugadores por posición (SOLO los que tienen dorsal en el DB) para armar el once.
function bestByPosition(pos, count){
  return teamPlayersRaw().filter(p=>p.pos===pos && p.number!=null)
    .sort((a,b)=> (b.rating||0)-(a.rating||0) || (b.caps||0)-(a.caps||0) || (b.ratingPotential||0)-(a.ratingPotential||0))
    .slice(0, count);
}

// Once titular sobre la cancha: coloca cada slot en el centro de su celda de la rejilla del Excel,
// con el dorso real de la playera (caché compartido) y el icono de categoría (GK/DF/MF/FW) debajo.
function lineupHTML(fid){
  const f = FORMATIONS[fid] || FORMATIONS["4-4-2"];
  const byCat = { GK:[], DF:[], MF:[], FW:[] };
  f.slots.forEach(s=>{ (byCat[s.cat] || (byCat[s.cat]=[])).push(s); });
  const picks = {}; ["GK","DF","MF","FW"].forEach(cat=>{ picks[cat] = bestByPosition(cat, (byCat[cat]||[]).length); });
  const idx = { GK:0, DF:0, MF:0, FW:0 };
  // Centrado horizontal: el mapa del Excel puede quedar medio corrido; desplazamos toda la
  // formación para que su centro caiga en la mitad de la cancha (respetando el ancho relativo).
  const cols = f.slots.map(s=>s.c);
  const mid = (Math.min.apply(null,cols) + Math.max.apply(null,cols)) / 2;
  const shift = (GRID_COLS+1)/2 - mid;   // centro de la rejilla (6.5) menos el centro real
  const slotsHTML = f.slots.map(s=>{
    const p = (picks[s.cat] || [])[idx[s.cat]++];
    const x = cellX(s.c + shift), y = cellY(s.r);
    const jersey = p
      ? `<div class="lu-jersey" data-pending data-player-id="${esc(p.id)}"><span class="lu-fallback mono">${p.number!=null?p.number:""}</span></div>`
      : `<div class="lu-jersey empty"></div>`;
    return `<div class="lu-slot" style="left:${x}%;top:${y}%;">
      ${jersey}
      ${posChipHTML(s.cat)}
    </div>`;
  }).join("");
  return `<div class="tac-pitch">${pitchImageHTML()}<div class="lu-layer">${slotsHTML}</div></div>`;
}

// Etiqueta de formación en dos renglones: parte numérica arriba, cualificador entre paréntesis abajo.
function formationLabelHTML(id){
  const m = String(id).match(/^(.*?)\s*(\(.+\))\s*$/);
  if(m) return `<span class="fl1">${esc(m[1])}</span><span class="fl2">${esc(m[2])}</span>`;
  return `<span class="fl1">${esc(id)}</span>`;
}
function screenTactics(){
  const t = team();
  const fid = FORMATIONS[state.formation] ? state.formation : "4-4-2";
  return shell("s-tactics", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 4 de 5 · ${esc(t.name)}</div>
        <h2>Define tu táctica</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("tactics")}
    </div>
    <div class="tac-stage">
      <div class="tac-grid">
        <div class="tac-board">
          ${lineupHTML(fid)}
        </div>
        <div class="tac-controls">
          <div class="section-title"><h2>Formación</h2></div>
          <div class="tac-forms">
            ${FORMATION_GROUPS.map(g=>`
              <div class="tac-fgroup">
                <div class="tac-fgroup-h">${esc(g.label)}</div>
                <div class="tac-fgrid">
                  ${g.ids.map(id=>`<button class="tac-fchip ${id===fid?'on':''}" data-act="set-formation" data-formation="${esc(id)}">${formationLabelHTML(id)}</button>`).join("")}
                </div>
              </div>`).join("")}
          </div>
          <p class="tac-hint">${esc(FORMATIONS[fid].desc)}</p>
        </div>
      </div>
    </div>
    ${flowFooter({act:"to-news"}, {act:"to-squad"})}
  `);
}

/* ============================================================
   4c) CONVOCATORIA — dorsales fijos 1..26 con menú de asignación
   ============================================================ */
// Modelo: conv.slots = { 1..26: playerId|null }. Un jugador es "convocado" si tiene un
// número; los que no, caen en "No convocados". Nunca se muta el jugador del DB.
// Asignación inicial: EXACTAMENTE los dorsales de la base de datos (1..26; el primero
// por preferencia gana en caso de choque; el resto queda sin dorsal).
function initConv(){
  const roster = teamPlayersRaw().slice().sort(prefSort);
  const slots = {}; for(let n=1;n<=SQUAD_MAX;n++) slots[n]=null;
  roster.forEach(p=>{
    const n = p.number;
    // Regla: el dorsal 1 está reservado a un portero; si el DB asigna el 1 a un no-portero, se omite.
    if(Number.isInteger(n) && n>=1 && n<=SQUAD_MAX && !slots[n] && !(n===1 && p.pos!=="GK")) slots[n]=p.id;
  });
  return { slots };
}
function ensureConv(){
  if(state.conv && state.conv.slots && state.convTeamId===state.teamId) return state.conv;
  state.conv = initConv();
  state.convTeamId = state.teamId;
  state.convMenu = null;
  return state.conv;
}
function convCount(){
  const c = ensureConv();
  return Object.keys(c.slots).filter(n=>c.slots[n]).length;
}
function rosterMap(){
  const m = {}; teamPlayersRaw().forEach(p=>{ m[p.id]=p; }); return m;
}
// Número actualmente asignado a un jugador (o null).
function numberOf(id){
  const c = ensureConv();
  for(let n=1;n<=SQUAD_MAX;n++){ if(c.slots[n]===id) return n; }
  return null;
}
// Edad legible del jugador.
function ageOf(p){ const a = computeAge(p.birthDate); return a!=null ? String(a) : "—"; }
// Nombre con el MISMO formato del perfil de equipos: nombre común (o apellido) en negrita.
function pNameHTML(p){
  if(typeof playerDisplayNameHTML==="function"){ try{ return playerDisplayNameHTML(p); }catch(e){} }
  return esc(pName(p));
}

// Asigna dorsal a los jugadores que aún no tienen: 1º por sus números favoritos si están
// libres; 2º por su posición (pools clásicos); 3º cualquier libre al azar.
const NUMBER_POOLS = { GK:[1,12,13,22,23,26], DF:[2,3,4,5], MF:[6,7,8], FW:[9,10,11] };
function assignMissing(){
  const conv = ensureConv();
  const roster = teamPlayersRaw().slice().sort(prefSort);
  const taken = new Set(); for(let n=1;n<=SQUAD_MAX;n++){ if(conv.slots[n]) taken.add(n); }
  const free = n => n>=1 && n<=SQUAD_MAX && !taken.has(n);
  const has = id => numberOf(id)!=null;
  // El dorsal 1 solo es válido para porteros.
  const okFor = (p,n) => free(n) && !(n===1 && p.pos!=="GK");
  const claim = (id,n)=>{ conv.slots[n]=id; taken.add(n); };
  // Regla: el dorsal 1 se reserva a un portero (el de mayor preferencia disponible).
  if(free(1)){ const gk = roster.find(p=>p.pos==="GK" && !has(p.id)); if(gk) claim(gk.id,1); }
  roster.forEach(p=>{ if(has(p.id)) return; const favs=(p.favNumbersTeam||[]).map(Number).filter(n=>okFor(p,n)); if(favs.length) claim(p.id, favs[0]); });
  roster.forEach(p=>{ if(has(p.id)) return; const pool=(NUMBER_POOLS[p.pos]||[]).filter(n=>okFor(p,n)); if(pool.length) claim(p.id, pool[0]); });
  roster.forEach(p=>{ if(has(p.id)) return; const rest=[]; for(let n=1;n<=SQUAD_MAX;n++) if(okFor(p,n)) rest.push(n); if(rest.length) claim(p.id, rest[Math.floor(Math.random()*rest.length)]); });
}

// Menú desplegable para un dorsal: lista de jugadores "N · Nombre" (N = su número actual, o —).
function dorsalMenuHTML(n, up){
  const conv = ensureConv();
  const current = conv.slots[n];
  // El dorsal 1 está reservado a porteros: el menú solo lista GK.
  let roster = teamPlayersRaw().slice();
  if(n===1) roster = roster.filter(p=>p.pos==="GK");
  roster = roster.sort((a,b)=>{
    const na=numberOf(a.id), nb=numberOf(b.id);
    if(na!=null && nb!=null) return na-nb;
    if(na!=null) return -1; if(nb!=null) return 1;
    return prefSort(a,b);
  });
  const items = roster.map(p=>{
    const num = numberOf(p.id);
    const sel = p.id===current ? " sel" : "";
    return `<button class="cv-menu-item${sel}" data-act="conv-pick" data-n="${n}" data-id="${esc(p.id)}" data-num="${num!=null?num:999}">
      <span class="cv-menu-num mono">${num!=null?num:"—"}</span>
      ${posChipHTML(p.pos)}
      <span class="cv-menu-name">${pNameHTML(p)}</span>
    </button>`;
  }).join("");
  return `<div class="cv-menu${up?' up':''}">
    <div class="cv-menu-head">Dorsal ${n}</div>
    <div class="cv-menu-list">${items}</div>
    <button class="cv-menu-item free" data-act="conv-free" data-n="${n}">Dejar libre</button>
  </div>`;
}

// Fila de un dorsal (ocupado o libre). Toda la fila abre el menú de asignación.
function dorsalRowHTML(n, rmap){
  const conv = ensureConv();
  const open = state.convMenu===n;
  const id = conv.slots[n];
  const p = id ? rmap[id] : null;
  const up = n>13;   // en la mitad inferior el menú se despliega hacia arriba (no se corta)
  const body = p ? `
    ${posChipHTML(p.pos)}
    <span class="cv-photo">${personPhotoHTML(p.photo, p.gender)}</span>
    <span class="cv-name">${pNameHTML(p)}</span>
    <span class="cv-c">${ageOf(p)}</span>
    <span class="cv-c">${p.caps!=null?p.caps:0}</span>
    <span class="cv-c">${p.goalsNational!=null?p.goalsNational:0}</span>
    <span class="cv-c">${esc(favNumbersText(p))}</span>`
  : `<span class="cv-libre">Libre</span>`;
  return `<div class="cv-row${p?'':' empty'}${open?' open':''}" data-act="conv-open-menu" data-n="${n}" role="button" tabindex="0">
    <div class="cv-num-wrap">
      <span class="num-badge cv-numbtn">${n}</span>
      ${open ? dorsalMenuHTML(n, up) : ""}
    </div>
    ${body}
  </div>`;
}

// Fila de un jugador NO convocado (sin número): mismas columnas, sin el rectángulo del dorsal.
// Al tocarla, el jugador vuelve al dorsal libre más bajo disponible.
function unconvRowHTML(p){
  return `<div class="cv-row noconv" data-act="conv-return" data-id="${esc(p.id)}" role="button" tabindex="0" title="Devolver a un dorsal libre">
    <div class="cv-num-wrap"><span class="num-badge">–</span></div>
    ${posChipHTML(p.pos)}
    <span class="cv-photo">${personPhotoHTML(p.photo, p.gender)}</span>
    <span class="cv-name">${pNameHTML(p)}</span>
    <span class="cv-c">${ageOf(p)}</span>
    <span class="cv-c">${p.caps!=null?p.caps:0}</span>
    <span class="cv-c">${p.goalsNational!=null?p.goalsNational:0}</span>
    <span class="cv-c">${esc(favNumbersText(p))}</span>
  </div>`;
}

// Tabla limpia (derecha): AGRUPADA por posición, en rejilla de varias columnas para que quepan
// los 26 sin scroll. Cada ficha: dorsal (morado) + nombre en negrita como en el perfil.
function squadTableHTML(rmap){
  const conv = ensureConv();
  const byPos = { GK:[], DF:[], MF:[], FW:[] };
  for(let n=1;n<=SQUAD_MAX;n++){
    const id = conv.slots[n]; if(!id) continue;
    const p = rmap[id]; if(!p) continue;
    (byPos[p.pos] || (byPos[p.pos]=[])).push({n, p});
  }
  const POS_ES = { GK:"Porteros", DF:"Defensas", MF:"Mediocampistas", FW:"Delanteros" };
  const groups = ["GK","DF","MF","FW"].map(pos=>{
    const arr = (byPos[pos]||[]).sort((a,b)=>a.n-b.n);
    if(!arr.length) return "";
    const chips = arr.map(x=>`<div class="st-chip">
      <span class="num-badge">${x.n}</span>
      <span class="st-name">${pNameHTML(x.p)}</span>
    </div>`).join("");
    return `<div class="st-group">
      <div class="st-group-head">${posChipHTML(pos)}<span>${POS_ES[pos]}</span><b class="mono">${arr.length}</b></div>
      <div class="st-chips">${chips}</div>
    </div>`;
  }).join("");
  return `<div class="st-table">${groups || `<div class="st-empty">Sin jugadores convocados todavía.</div>`}</div>`;
}

function screenSquad(){
  const t = team();
  ensureConv();
  const rmap = rosterMap();
  const rosterSize = teamPlayersRaw().length;
  const target = Math.min(SQUAD_MAX, rosterSize);
  const count = convCount();
  const done = count>=target && target>0;

  const rows = [];
  for(let n=1;n<=SQUAD_MAX;n++) rows.push(dorsalRowHTML(n, rmap));
  const unconv = teamPlayersRaw().filter(p=>numberOf(p.id)==null)
    .sort((a,b)=> pName(a).localeCompare(pName(b),"es"));
  const unconvHTML = unconv.length ? `
    <div class="list-subhead"><h3>No convocados</h3><span class="hint">${unconv.length} sin dorsal</span></div>
    ${unconv.map(unconvRowHTML).join("")}` : "";

  return shell("s-squad", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 5 de 5 · ${esc(t.name)}</div>
        <h2>Arma tu convocatoria</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("squad")}
    </div>
    <div class="cv-stage">
      <div class="cv-grid">
        <section class="cv-list-wrap">
          <div class="cv-list-top">
            <div class="cv-counter">Convocados <b class="${done?'ok':''}">${count}/${target}</b></div>
            <div class="cv-tools">
              <button class="btn ghost sm" data-act="conv-reset">Reestablecer</button>
              <button class="btn ghost sm" data-act="conv-assign-all">Asignar dorsales</button>
              <button class="btn ghost sm" data-act="conv-clear-all">Borrar dorsales</button>
            </div>
          </div>
          <div class="cv-cols">
            <span>#</span><span>Pos</span><span></span><span class="l">Jugador</span>
            <span>Edad</span><span>Partidos</span><span>Goles</span><span>Dorsal fav.</span>
          </div>
          <div class="cv-list">
            ${rows.join("")}
            ${unconvHTML}
          </div>
        </section>
        <aside class="cv-side">
          <div class="section-title"><h2>Convocatoria</h2></div>
          ${squadTableHTML(rmap)}
        </aside>
      </div>
    </div>
    ${flowFooter({act:"to-tactics"}, {act:"to-news2", disabled:!done})}
    ${state.convMenu ? `<div class="cv-menu-backdrop" data-act="conv-close-menu"></div>` : ""}
  `);
}

/* ============================================================
   4d) NOTICIA FINAL — anuncio de los 26 convocados + destacados
   ============================================================ */
// Titular del anuncio de convocatoria (3 variantes, una por medio).
function squadHeadline(t, i){
  const nm = coachInfo().name;
  const V = [
    `${nm} da la lista: estos son los ${SQUAD_MAX} de ${t.name} para el Mundial`,
    `${nm} anuncia a los ${SQUAD_MAX} convocados de ${t.name}`,
    `Ya hay ${SQUAD_MAX}: ${nm} define el grupo de ${t.name} para la cita mundialista`
  ];
  return V[((i % V.length)+V.length)%V.length];
}
// Destacados de la convocatoria, con 3 cuerpos DISTINTOS (uno por medio).
function squadStars(t){
  const conv = ensureConv();
  const rmap = rosterMap();
  const players = Object.keys(conv.slots).map(n=>conv.slots[n]).filter(Boolean).map(id=>rmap[id]).filter(Boolean);
  if(!players.length) return null;
  const byRating = players.slice().sort((a,b)=>(b.rating||0)-(a.rating||0));
  const stars = byRating.slice(0,3);
  const starIds = new Set(stars.map(p=>p.id));
  const promise = players.slice().sort((a,b)=>(b.ratingPotential||0)-(a.ratingPotential||0)).filter(p=>!starIds.has(p.id))[0];
  const starTxt = stars.map(p=>`<b>${esc(pName(p))}</b>`).join(", ").replace(/, ([^,]*)$/, " y $1");
  return { n:players.length, starTxt, promise };
}
function squadLede(t, i){
  i = ((i % 3)+3)%3;
  const nm = coachInfo().name;
  const s = squadStars(t);
  if(!s){
    return `<b>${esc(nm)}</b> ya tiene lista la convocatoria de <b>${esc(t.name)}</b> para el Mundial 2026.`;
  }
  const prom = p => p ? `<b>${esc(pName(p))}</b>` : null;
  const V = [
    `La espera terminó en <b>${esc(t.name)}</b>: con el Mundial 2026 a la vuelta de la esquina, <b>${esc(nm)}</b> ya tiene definidos a sus <b>${esc(String(s.n))}</b> elegidos. Tiran del proyecto ${s.starTxt}, las referencias del vestidor.`
      + (s.promise ? ` Entre los nombres a seguir asoma ${prom(s.promise)}, la carta de futuro del grupo.` : ""),
    `<b>${esc(nm)}</b> despejó las dudas en <b>${esc(t.name)}</b>. Los <b>${esc(String(s.n))}</b> que viajarán al Mundial 2026 ya tienen nombre y apellido, con ${s.starTxt} como columna vertebral del equipo.`
      + (s.promise ? ` La mirada también se posa en ${prom(s.promise)}, la joven perla llamada a dar el salto.` : ""),
    `Es oficial: <b>${esc(t.name)}</b> cierra su lista de <b>${esc(String(s.n))}</b> para el Mundial 2026. <b>${esc(nm)}</b> apuesta por la jerarquía de ${s.starTxt} para comandar al grupo`
      + (s.promise ? `, sin perder de vista a ${prom(s.promise)}, su apuesta de futuro.` : ".")
  ];
  return V[i];
}
function screenNews2(){
  const t = team();
  const outlets = newsOutlets(t);
  const total = outlets.length || 1;
  const idx = ((state.outletCycle % total)+total)%total;
  const m = outlets[idx] || outlets[0];
  if(m) state.mediaId = m.id;
  return shell("s-news2", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Convocatoria oficial · ${esc(t.name)}</div>
        <h2>Se anuncia la lista</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("squad")}
    </div>
    <div class="news-stage">
      ${m ? newsCardHTML(t, m, squadHeadline(t,idx), squadLede(t,idx), {idx,total}) : ""}
    </div>
    ${flowFooter({act:"to-squad"}, {act:"finish", label:"Comenzar el Mundial"})}
  `);
}

/* ============================================================
   5) HANDOFF
   ============================================================ */
function screenHandoff(){
  const t = team();
  const isCustom = state.coachMode==="custom";
  const coachName = isCustom ? (state.customCoach&&state.customCoach.displayName) : (t.coach&&t.coach.displayName);
  const coachPhoto = isCustom ? (state.customCoach&&state.customCoach.photo) : (t.coach&&t.coach.photo);
  const coachGender = isCustom ? (state.customCoach&&state.customCoach.gender) : (t.coach&&t.coach.gender);
  return shell("s-handoff", `
    <img class="splash-crest" src="${APP_CREST}" alt="Copa Manager 2026" style="margin-bottom:22px;">
    <h2>Aquí arranca el juego</h2>
    <p>Este es el punto de entrega: al integrar, esta pantalla cede el control a la app actual con la partida ya configurada.</p>
    <div class="handoff-summary">
      <div class="kv"><div class="k">Selección</div><div class="v with-img">${crestHTML(t, "mini")}<span>${esc(t.name)}</span></div></div>
      <div class="kv"><div class="k">Manager</div><div class="v with-img"><span class="mini-photo">${personPhotoHTML(coachPhoto, coachGender)}</span><span>${esc(coachName||"—")}</span></div></div>
    </div>
    <div class="splash-actions" style="margin-top:32px;">
      <button class="btn big" data-act="dev-console">Ver resultado (consola)</button>
      <button class="btn ghost big" data-act="reset">Reiniciar prototipo</button>
    </div>
  `);
}

/* ============================================================
   CABLEADO DE EVENTOS
   ============================================================ */
// Delegación GLOBAL enganchada UNA sola vez: sobrevive a los re-render parciales
// (renderPickGrid / renderPickBar) que reinyectan HTML sin volver a cablear.
let _delegationReady = false;
function setupDelegation(){
  if(_delegationReady) return; _delegationReady = true;
  document.addEventListener("click", (e)=>{
    if(!e.target.closest || !e.target.closest("#cm-onb")) return;
    const tile = e.target.closest("[data-tile]");
    if(tile){
      state.teamId = tile.dataset.tile;
      applyTeamTheme(team());
      // Actualización PARCIAL: mover la clase .selected sin re-render, para NO destruir/recargar los logos.
      document.querySelectorAll("#cm-onb .team-tile.selected").forEach(t=>t.classList.remove("selected"));
      tile.classList.add("selected");
      const nx = $("#flow-next"); if(nx) nx.disabled = !state.teamId;
      return;
    }
    const act = e.target.closest("[data-act]");
    if(act){ handleAct(act.dataset.act, act, e); }
  });
  document.addEventListener("dblclick", (e)=>{
    if(!e.target.closest || !e.target.closest("#cm-onb")) return;
    if(e.target.closest("[data-tile]") && state.teamId) go("coach");
  });
  // El buscador persiste entre renders parciales; delegamos su input.
  document.addEventListener("input", (e)=>{
    if(!e.target.closest || !e.target.closest("#cm-onb")) return;
    if(e.target.id==="pick-q"){ pickQuery = e.target.value; renderPickGrid(); }
  });
}
function wire(){
  if($("#pick-grid")) renderPickGrid();
  // Los campos del formulario manager se recrean en cada render completo;
  // sus listeners específicos (auto-relleno de nombre/edad/avatar) se enganchan aquí.
  wireManagerForm();
}
function wireManagerForm(){
  const form = $("#manager-form"); if(!form) return;
  const first = $("#m-first"), last = $("#m-last"), disp = $("#m-disp"), dispEcho = $("#m-disp-echo");
  let dispLinked = !(state.customCoach && state.customCoach.dispEdited);
  function refreshDisp(){
    if(dispLinked){ disp.value = `${first.value.trim()} ${last.value.trim()}`.trim(); }
    dispEcho.textContent = disp.value.trim() ? `Se mostrará como “${disp.value.trim()}”` : "";
  }
  first.addEventListener("input", refreshDisp);
  last.addEventListener("input", refreshDisp);
  disp.addEventListener("input", ()=>{ dispLinked=false; dispEcho.textContent = disp.value.trim()?`Se mostrará como “${disp.value.trim()}”`:""; });
  const birth = $("#m-birth"), ageEcho = $("#m-age-echo");
  function refreshAge(){ const a=computeAge(birth.value); ageEcho.textContent = a!=null?`Edad: ${a} años`:""; }
  birth.addEventListener("input", refreshAge);
  const photo = $("#m-photo"), avatar = $("#m-avatar");
  photo.addEventListener("change", ()=>{
    const f = photo.files && photo.files[0]; if(!f) return;
    const rd = new FileReader();
    rd.onload = ()=>{ avatar.innerHTML = `<img src="${rd.result}" alt="">`; avatar.dataset.photo = rd.result; };
    rd.readAsDataURL(f);
  });
  // Al cambiar el género, si NO hay foto subida, la silueta genérica cambia (mujer/hombre) al vuelo.
  const gender = $("#m-gender");
  if(gender){ gender.addEventListener("change", ()=>{ if(!avatar.dataset.photo){ avatar.innerHTML = avatarSVG(gender.value); } }); }
  refreshDisp(); refreshAge();
}

function handleAct(act, el, e){
  const t = team();
  switch(act){
    case "start": go("pick"); break;
    case "skip-to-sim":
      // Botón TEMPORAL: en la app real cierra el onboarding y entra al simulador sin llenar formularios.
      if(window.CopaOnboarding && typeof window.CopaOnboarding._onSkip==="function"){ window.CopaOnboarding._onSkip(); }
      else { root.innerHTML = shell("s-skip", `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;"><div class="handoff-badge" style="background:linear-gradient(150deg,var(--indigo),var(--indigo-bright));">⏭</div><h2>Simulador</h2><p style="color:var(--muted);margin-top:12px;max-width:420px;">Aquí entrarías directo al juego actual (botón temporal para seguir editando sin pasar por el flujo).</p><button class="btn ghost big" style="margin-top:24px;" data-act="to-splash">← Volver al inicio</button></div>`); }
      break;
    case "load": go("pick"); break;
    case "to-splash": go("splash"); break;
    case "to-pick": go("pick"); break;
    case "sort-grupos": if(pickSort!=="grupos"){ pickSort="grupos"; go("pick"); } break;
    case "sort-alfabetico": if(pickSort!=="alfabetico"){ pickSort="alfabetico"; go("pick"); } break;
    case "to-coach":
      if(!state.teamId) return;
      applyTeamTheme(team());
      prefetchJerseys();   // equipo confirmado: adelanta los backs para que Táctica sea instantánea
      go("coach"); break;

    case "pick-real":
      state.coachMode = "real"; managerFormOpen=false; go("coach"); break;
    case "pick-custom":
      state.coachMode = "custom"; managerFormOpen=false; go("coach"); break;
    case "open-manager":
      managerFormOpen = true;
      if(!state.customCoach) state.customCoach = {};
      go("coach"); break;
    case "cancel-manager":
      managerFormOpen = false; go("coach"); break;
    case "save-manager": {
      const first = $("#m-first").value.trim(), last = $("#m-last").value.trim();
      const disp = $("#m-disp").value.trim() || `${first} ${last}`.trim();
      if(!disp){ $("#m-first").focus(); return; }
      const natSel = $("#m-nat");
      const flag = natSel.selectedOptions[0] ? natSel.selectedOptions[0].dataset.flag : "";
      const genderEl = $("#m-gender");
      const gender = genderEl ? genderEl.value : "Masculino";
      const avatar = $("#m-avatar");
      state.customCoach = {
        firstName:first, lastName:last, displayName:disp, dispEdited:true,
        birthDate:$("#m-birth").value || null,
        natCountry:natSel.value || null, natFlag:flag || null,
        gender: gender,
        photo: avatar.dataset.photo || null, rating:null
      };
      state.coachMode = "custom"; managerFormOpen = false; go("coach"); break;
    }
    case "to-news":
      if(!state.coachMode) return;
      state.outletCycle = 0; go("news"); break;
    case "outlet-prev":
      state.outletCycle--; render(); break;
    case "outlet-next":
      state.outletCycle++; render(); break;

    /* ---- Táctica ---- */
    case "to-tactics":
      if(!state.coachMode) return;
      go("tactics"); break;
    case "set-formation":
      if(FORMATIONS[el.dataset.formation]){ state.formation = el.dataset.formation; render(); } break;
    case "set-style": {
      // El estilo no cambia nada de la cancha/playeras: actualiza solo los botones y el "Continuar"
      // (sin re-render) para que las playeras NO se recarguen.
      state.style = el.dataset.style || null;
      document.querySelectorAll('#cm-onb [data-act="set-style"]').forEach(b=>{
        b.classList.toggle("on", b.dataset.style===state.style);
      });
      const nx = $("#flow-next"); if(nx) nx.disabled = !state.style;
      break;
    }

    /* ---- Convocatoria ---- */
    case "to-squad":
      state.convMenu = null; ensureConv(); go("squad"); break;
    case "conv-open-menu":
      state.convMenu = (state.convMenu===parseInt(el.dataset.n,10)) ? null : parseInt(el.dataset.n,10);
      render(); break;
    case "conv-close-menu":
      state.convMenu = null; render(); break;
    case "conv-pick": {
      const conv = ensureConv();
      const n = parseInt(el.dataset.n,10);
      const id = el.dataset.id;
      const prevAtN = conv.slots[n];        // quién tenía este dorsal (o null)
      const prevNumOfX = numberOf(id);      // qué número tenía el elegido (o null)
      if(prevNumOfX!=null){ conv.slots[prevNumOfX] = prevAtN; } // swap: el desplazado hereda el dorsal viejo
      conv.slots[n] = id;
      state.convMenu = null; render(); break;
    }
    case "conv-free": {
      const conv = ensureConv();
      const n = parseInt(el.dataset.n,10);
      conv.slots[n] = null; state.convMenu = null; render(); break;
    }
    case "conv-reset":
      state.conv = initConv(); state.convTeamId = state.teamId; state.convMenu = null; render(); break;
    case "conv-assign-all":
      assignMissing(); state.convMenu = null; render(); break;
    case "conv-clear-all": {
      const conv = ensureConv();
      for(let n=1;n<=SQUAD_MAX;n++) conv.slots[n] = null;
      state.convMenu = null; render(); break;
    }
    case "conv-return": {
      const conv = ensureConv();
      const id = el.dataset.id;
      const p = rosterMap()[id];
      if(numberOf(id)==null){
        for(let n=1;n<=SQUAD_MAX;n++){
          if(!conv.slots[n] && !(n===1 && p && p.pos!=="GK")){ conv.slots[n]=id; break; }
        }
      }
      state.convMenu = null; render(); break;
    }

    /* ---- Noticia final ---- */
    case "to-news2":
      state.outletCycle = 0; go("news2"); break;

    case "finish": {
      saveGame();
      if(window.CopaOnboarding && typeof window.CopaOnboarding._onComplete==="function"){
        try{ window.CopaOnboarding._onComplete(buildResult()); }catch(err){ console.error(err); }
      } else { go("handoff"); }
      break;
    }

    case "dev-console": {
      const res = buildResult();
      console.log("%c[Copa Manager] Resultado del onboarding:", "color:#8B82FF;font-weight:700;", res);
      alert("Resultado enviado a la consola (F12).\n\n"+JSON.stringify(res,null,2));
      break;
    }
    case "reset":
      clearGame();
      Object.assign(state, {screen:"splash",teamId:null,coachMode:null,customCoach:null,mediaId:null,outletCycle:0,formation:"4-4-2",style:null,conv:null,convTeamId:null,convMenu:null});
      managerFormOpen=false; pickQuery=""; applyTeamTheme(null); go("splash"); break;
  }
}

/* ============================================================
   RESULTADO / INTEGRACIÓN
   ============================================================
   Al integrar en la app real, esta función es el "contrato" que se
   entrega al juego. La app puede: fijar la selección activa, reemplazar
   el entrenador principal si es 'custom' y navegar a la vista de juego.
   ------------------------------------------------------------ */
function buildResult(){
  const t = team();
  const conv = ensureConv();
  const squad = [];
  for(let n=1;n<=SQUAD_MAX;n++){ if(conv.slots[n]) squad.push({ number:n, playerId:conv.slots[n] }); }
  return {
    teamId: t.id,
    teamName: t.name,
    coachMode: state.coachMode,            // 'real' | 'custom'
    coach: state.coachMode==="custom" ? state.customCoach : (t.coach||null),
    mediaId: state.mediaId,
    formation: state.formation,            // p. ej. "4-4-2"
    style: state.style,                    // "Ofensivo" | "Defensivo" | "Posesión"
    squad: squad                           // [{number, playerId}] con los 26 convocados
  };
}

/* API pública para la futura integración:
     CopaOnboarding.start({ teams, media, onComplete })
   - teams/media: si se pasan, se usan en lugar del DATA embebido (para leer del DB en vivo).
   - onComplete(result): callback con el objeto de buildResult() al pulsar "Comenzar el Mundial".
*/
window.CopaOnboarding = {
  start(opts){
    opts = opts||{};
    if(opts.teams) DATA.teams = opts.teams;
    if(opts.media) DATA.media = opts.media;
    if(typeof opts.onComplete==="function") this._onComplete = opts.onComplete;
    if(typeof opts.onSkip==="function") this._onSkip = opts.onSkip;
    Object.assign(state, {screen:"splash",teamId:null,coachMode:null,customCoach:null,mediaId:null,outletCycle:0,formation:"4-4-2",style:null,conv:null,convTeamId:null,convMenu:null});
    setupDelegation(); applyTeamTheme(null); render();
  },
  _onComplete:null,
  _onSkip:null
};


})();
