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
    + "\n#cm-onb .team-tile .tile-badges .badge{white-space:nowrap;}";
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
function personPhotoHTML(url, gender){
  return `<img src="${url || defaultPhotoFor(gender)}" alt="">`;
}
function avatarSVG(gender){ return personPhotoHTML(null, gender); }

// Escudo de la selección: logo real si existe; si no, cuadro con gradiente de sus colores + código FIFA.
function crestHTML(team, cls){
  // Logo asignado; si no, el escudo genérico del juego (DEFAULT_CREST_SRC). Nunca el cuadro de color.
  const src = team.logoImg || (typeof DEFAULT_CREST_SRC!=="undefined" ? DEFAULT_CREST_SRC : null);
  if(src){
    return `<span class="crest ${cls||''}"><img src="${src}" alt="" onerror="this.style.visibility='hidden'"></span>`;
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
  outletCycle: 0
};
function team(){ return DATA.teams.find(t=>t.id===state.teamId) || null; }

// Los fondos se mantienen SIEMPRE en negro+morado de la interfaz (no se recolorean por
// selección). Esta función se conserva como no-op para no romper las llamadas del flujo.
function applyTeamTheme(){ /* intencionalmente vacío: identidad visual fija indigo/morado */ }

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
    case "handoff":  html = screenHandoff(); break;
  }
  root.innerHTML = html;
  wire();
  const active = $(".screen");
  if(active){ active.classList.add("active","enter"); }
}

// Envuelve una pantalla con su atmósfera tintada.
function shell(id, inner){
  return `<section class="screen active" id="${id}">
    <div class="atmosphere"><div class="grain"></div></div>
    <div class="stage">${inner}</div>
  </section>`;
}
function stepper(now){
  const steps = ["pick","coach","news"];
  return `<div class="stepper">${steps.map(s=>{
    const i = steps.indexOf(s), n = steps.indexOf(now);
    const cls = i<n ? "done" : (i===n ? "now" : "");
    return `<span class="pip ${cls}"></span>`;
  }).join("")}</div>`;
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
      <div class="spacer" style="flex:1"></div>
      <button class="link-btn" data-act="to-splash">← Volver</button>
    </div>
    <div class="pick-scroll">
      <div class="pick-grid" id="pick-grid"></div>
    </div>
    <div class="pick-bar" id="pick-bar"></div>
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
  renderPickBar();
}
function renderPickBar(){
  const bar = $("#pick-bar"); if(!bar) return;
  const t = team();
  if(!t){ bar.classList.remove("show"); bar.innerHTML=""; return; }
  bar.innerHTML = `
    <div class="chip">
      ${crestHTML(t)}
      <div><b>${esc(t.name)}</b><small>${esc(t.code)} · ${esc(t.conf)} · Rating ${t.rating}</small></div>
    </div>
    <div class="spacer"></div>
    <button class="btn big" data-act="to-coach">Continuar con ${esc(t.name)} →</button>`;
  bar.classList.add("show");
}

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
    <div class="coach-foot">
      <button class="btn ghost" data-act="to-pick">← Cambiar selección</button>
      <button class="btn" data-act="to-news" ${state.coachMode?"":"disabled"}>Continuar →</button>
    </div>
  `;
}
function managerFormHTML(t){
  const c = state.customCoach || {};
  const genders = (typeof PERSON_GENDERS!=="undefined" && PERSON_GENDERS.length) ? PERSON_GENDERS : ["Masculino","Femenino"];
  const photo = c.photo ? `<img src="${c.photo}" alt="">` : avatarSVG(c.gender);
  const opts = DATA.teams.map(x=>({name:x.name, flag:x.flag||x.iso}))
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
function headlineFor(t){
  const i = ((state.outletCycle % 5)+5)%5;
  const c = t.coach;
  if(state.coachMode==="custom"){
    const nm = (state.customCoach && state.customCoach.displayName) || "Tu manager";
    const V = [
      `${nm} toma el mando de la selección de ${t.name} a pocos días del Mundial`,
      `${nm} asume la dirección de ${t.name} rumbo al Mundial`,
      `${nm} es el nuevo entrenador de ${t.name} a las puertas del Mundial`,
      `${nm} se hace cargo de ${t.name} en la recta final al Mundial`,
      `${nm} llega al banquillo de ${t.name} para el Mundial 2026`
    ];
    return V[i];
  }
  const nm = c ? c.displayName : "El entrenador";
  const V = [
    `${nm} listo para dar su lista de ${SQUAD_MAX} jugadores`,
    `${nm} define a los ${SQUAD_MAX} elegidos de ${t.name}`,
    `${nm} afina la convocatoria: ${SQUAD_MAX} nombres para el Mundial`,
    `${nm} ultima la lista de ${SQUAD_MAX} de ${t.name}`,
    `${nm} prepara el anuncio de sus ${SQUAD_MAX} convocados`
  ];
  return V[i];
}
function ledeFor(t, outlet){
  const i = ((state.outletCycle % 5)+5)%5;
  if(state.coachMode==="custom"){
    const nm = (state.customCoach && state.customCoach.displayName) || "el nuevo técnico";
    const V = [
      `A pocos días del arranque del Mundial 2026, <b>${esc(nm)}</b> asume la conducción de <b>${esc(t.name)}</b>. La afición aguarda sus primeras decisiones: convocatoria, once base e identidad del equipo quedan en sus manos.`,
      `Comienza una nueva era en <b>${esc(t.name)}</b>: <b>${esc(nm)}</b> toma las riendas con el Mundial 2026 a la vuelta de la esquina. Todos los focos apuntan ahora a su lista de convocados.`,
      `<b>${esc(nm)}</b> llega al banquillo de <b>${esc(t.name)}</b> en la recta final rumbo al Mundial 2026. Su primer reto: definir el grupo que peleará por la gloria.`,
      `Con el reloj corriendo hacia el Mundial 2026, <b>${esc(t.name)}</b> confía su proyecto a <b>${esc(nm)}</b>. La expectativa es máxima por conocer su plan de juego.`,
      `Nuevo rumbo para <b>${esc(t.name)}</b>. <b>${esc(nm)}</b> se hace cargo del equipo a las puertas del Mundial 2026 y ya trabaja en su primera convocatoria.`
    ];
    return V[i];
  }
  const nm = t.coach ? t.coach.displayName : "el entrenador";
  const V = [
    `<b>${esc(nm)}</b> ultima los detalles antes de anunciar los <b>${SQUAD_MAX}</b> convocados de <b>${esc(t.name)}</b>. La expectativa crece: cada nombre puede cambiar el rumbo en el Mundial 2026.`,
    `Cuenta regresiva en <b>${esc(t.name)}</b>: <b>${esc(nm)}</b> afina la lista de <b>${SQUAD_MAX}</b> jugadores que buscarán la gloria en el Mundial 2026.`,
    `Todo listo en el cuerpo técnico. <b>${esc(nm)}</b> prepara el anuncio de los <b>${SQUAD_MAX}</b> elegidos de <b>${esc(t.name)}</b> para la cita mundialista.`,
    `<b>${esc(nm)}</b> tiene ya casi resuelta la nómina de <b>${SQUAD_MAX}</b> de <b>${esc(t.name)}</b>. La hinchada espera con ansias los nombres definitivos.`,
    `A días del Mundial 2026, <b>${esc(nm)}</b> define quiénes serán los <b>${SQUAD_MAX}</b> que defiendan a <b>${esc(t.name)}</b>. Cada decisión será analizada al detalle.`
  ];
  return V[i];
}
function screenNews(){
  const t = team();
  const m = currentOutlet(t);
  const total = outletsFor(t).length;
  const idx = ((state.outletCycle % total)+total)%total;
  return shell("s-news", `
    <div class="flow-head">
      <div>
        <div class="eyebrow">Paso 3 de 3 · ${esc(t.name)}</div>
        <h2>La prensa reacciona</h2>
      </div>
      <div class="spacer"></div>
      ${stepper("news")}
    </div>
    <div class="news-stage">
      <article class="news-paper" id="news-paper" style="--outlet-1:${m.color1};--outlet-2:${m.color2};--outlet-3:${m.color3}">
        <header class="news-masthead">
          <div class="news-logo">${m.logoImg?`<img src="${m.logoImg}" alt="">`:`<span>${esc(m.name.slice(0,2).toUpperCase())}</span>`}</div>
          <div class="news-outlet">
            <div class="nm">${esc(m.name)}</div>
          </div>
          <span class="news-live">Última hora</span>
        </header>
        <div class="news-body">
          <div class="news-kicker">${flagImgHTML(t.flag||t.iso, t.name)} Selección de ${esc(t.name)}</div>
          <h1 class="news-headline">${esc(headlineFor(t))}.</h1>
          <p class="news-lede">${ledeFor(t, m)}</p>
        </div>
        <footer class="news-foot">
          <span class="byline">${esc(NEWS_DATE)}</span>
          <div class="spacer"></div>
          ${total>1?`<div class="outlet-pager">
            <button class="pager-btn" data-act="outlet-prev" aria-label="Medio anterior">‹</button>
            <span class="pager-count mono">${idx+1}/${total}</span>
            <button class="pager-btn" data-act="outlet-next" aria-label="Medio siguiente">›</button>
          </div>`:""}
        </footer>
      </article>
    </div>
    <div class="coach-foot" style="padding-bottom:34px;">
      <button class="btn ghost" data-act="to-coach">← Volver</button>
      <button class="btn" data-act="finish">Comenzar el Mundial →</button>
    </div>
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
      renderPickGrid();
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
      applyTeamTheme(team()); go("coach"); break;

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
      Object.assign(state, {screen:"splash",teamId:null,coachMode:null,customCoach:null,mediaId:null,outletCycle:0});
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
  return {
    teamId: t.id,
    teamName: t.name,
    coachMode: state.coachMode,            // 'real' | 'custom'
    coach: state.coachMode==="custom" ? state.customCoach : (t.coach||null),
    mediaId: state.mediaId
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
    Object.assign(state, {screen:"splash",teamId:null,coachMode:null,customCoach:null,mediaId:null,outletCycle:0});
    setupDelegation(); applyTeamTheme(null); render();
  },
  _onComplete:null,
  _onSkip:null
};


})();
