(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = 3200, H = 2100;
  const keys = new Set();
  const touchKeys = new Set();
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  const LEVELS = [
    {
      id:1,name:'Explora y reconoce',icon:'🗺️',desc:'Conoce la realidad del territorio y detecta riesgos y capacidades.',prep:20,xp:120,spawn:{x:430,y:1570},
      objectives:[
        {id:'risk-river',x:820,y:820,icon:'⚠️',title:'Zona inundable',kind:'hotspot',text:'El cauce cercano representa un riesgo que debe ser conocido antes de planear la respuesta.',teach:'La preparación empieza por conocer la realidad, los riesgos y las necesidades del territorio.'},
        {id:'school',x:1535,y:750,icon:'🏫',title:'Escuela comunitaria',kind:'hotspot',text:'La escuela es una capacidad disponible en la comunidad. Su utilidad depende de la planificación y de las condiciones del lugar.',teach:'Las capacidades incluyen personas, espacios, conocimientos y recursos que pueden integrarse a la respuesta.'},
        {id:'health',x:2450,y:1520,icon:'🏥',title:'Centro de salud',kind:'hotspot',text:'El centro de salud muestra que la comunidad no parte de cero: existen actores y recursos que pueden coordinarse.',teach:'Identificar recursos existentes ayuda a organizar una respuesta comunitaria.'}
      ],
      checkpoint:{title:'Punto de control: leer el territorio',icon:'🧭',intro:'Ya exploraste tres puntos. Ahora demuestra que entendiste por qué conocer la realidad es el primer paso.',questions:[
        {q:'Antes de decidir cómo responder a una situación, ¿qué debería hacer la comunidad?',o:['Actuar de inmediato sin analizar','Conocer la realidad y las necesidades','Esperar siempre una orden externa','Elegir una ruta al azar'],a:1},
        {q:'Encontrar una escuela y un centro de salud permite identificar:',o:['Solo edificios','Capacidades y recursos que pueden integrarse','Riesgos inevitables','Lugares que nunca deben usarse'],a:1},
        {q:'¿Qué relación tiene este nivel con la planeación?',o:['Primero se improvisa y luego se analiza','La planeación debe partir de la realidad conocida','La planeación evita escuchar a la comunidad','La planeación solo depende de recursos económicos'],a:1}
      ]}
    },
    {
      id:2,name:'Prepara el kit',icon:'🧰',desc:'Aprende a anticipar necesidades y arma un kit de emergencia.',prep:20,xp:150,spawn:{x:900,y:1600},
      objectives:[{id:'kit-table',x:1120,y:1600,icon:'🧰',title:'Mesa de preparación',kind:'kit',text:'En la mesa encontrarás elementos diversos. Tu misión es separar lo útil de lo accesorio.',teach:'Preparar con anticipación reduce la improvisación y facilita una respuesta inicial.'}],
      checkpoint:{title:'Punto de control: kit de emergencia',icon:'🧰',intro:'Ahora demuestra que sabes distinguir los elementos prioritarios para una respuesta inicial.',questions:[
        {q:'¿Qué conjunto es más apropiado para un kit?',o:['Agua, alimentos no perecederos, linterna y botiquín','Televisor y consola','Decoraciones y objetos frágiles','Solo ropa'],a:0},
        {q:'¿Por qué se prepara el kit antes de una emergencia?',o:['Para ocupar espacio','Para reducir la improvisación y facilitar la respuesta inicial','Para sustituir a las instituciones','Para evitar hacer un plan familiar'],a:1},
        {q:'¿Qué debe orientar la selección del contenido del kit?',o:['Lo que esté de moda','Las necesidades particulares de la familia','El objeto más costoso','El recipiente más grande'],a:1}
      ]}
    },
    {
      id:3,name:'Plan familiar',icon:'🏠',desc:'Ayuda a una familia a definir cómo comunicarse, reunirse y salir.',prep:20,xp:170,spawn:{x:1960,y:420},
      objectives:[{id:'family-house',x:2230,y:840,icon:'🏠',title:'Casa familiar',kind:'family',text:'Entra en la casa y organiza un plan para todos sus integrantes.',teach:'Un plan familiar define rutas, punto de encuentro, comunicación y responsabilidades, considerando necesidades particulares.'}],
      checkpoint:{title:'Punto de control: plan familiar',icon:'🏠',intro:'La familia necesita acuerdos claros antes de una emergencia. Completa el reto.',questions:[
        {q:'¿Cuál elemento es esencial en un Plan Familiar de Emergencias?',o:['Un punto de encuentro previamente definido','Un horario de televisión','Una lista de entretenimiento','Un presupuesto de vacaciones'],a:0},
        {q:'Si hay un niño pequeño y una persona mayor, el plan debe:',o:['Ignorar la situación','Definir responsabilidades y apoyo según sus necesidades','Dejar que cada uno resuelva por separado','Esperar para improvisar'],a:1},
        {q:'Conocer la ruta de salida con anticipación permite:',o:['Hacer más largo el recorrido','Facilitar una salida organizada','Evitar la comunicación','Reemplazar el kit'],a:1}
      ]}
    },
    {
      id:4,name:'Construye el mapa',icon:'📍',desc:'Completa un mapa con riesgos, capacidades y rutas de respuesta.',prep:20,xp:190,spawn:{x:1120,y:1760},
      objectives:[{id:'map-board',x:1450,y:1925,icon:'📍',title:'Mapa comunitario',kind:'map',text:'Coloca correctamente los elementos esenciales del mapa de preparación.',teach:'El mapa integra riesgos, capacidades y rutas para orientar una respuesta comunitaria.'}],
      checkpoint:{title:'Punto de control: mapa de respuesta',icon:'📍',intro:'La comunidad necesita una herramienta útil para ver su territorio y responder mejor.',questions:[
        {q:'¿Qué debe integrar el mapa comunitario?',o:['Solo nombres de calles','Riesgos, capacidades y rutas de respuesta','Solo viviendas','Solo edificios religiosos'],a:1},
        {q:'Una capacidad comunitaria puede ser:',o:['Una persona con conocimientos útiles','Una ruta bloqueada','Un riesgo','Una zona de peligro'],a:0},
        {q:'¿Por qué sirven las rutas de respuesta?',o:['Para complicar el recorrido','Para orientar una evacuación o respuesta organizada','Para evitar la coordinación','Para sustituir el conocimiento del territorio'],a:1}
      ]}
    },
    {
      id:5,name:'Activa la red',icon:'🤝',desc:'Conecta al COPPAS con actores e instituciones para responder de manera articulada.',prep:20,xp:250,spawn:{x:2520,y:1720},
      objectives:[{id:'network',x:2955,y:1585,icon:'🤝',title:'Centro de articulación',kind:'network',text:'Activa la red de apoyo conectando capacidades de la comunidad con otros actores.',teach:'La articulación evita acciones aisladas y permite coordinar esfuerzos y capacidades existentes.'}],
      checkpoint:{title:'Reto final: comunidad coordinada',icon:'🤝',intro:'Ahora debes integrar todo lo aprendido: conocer, preparar, organizar y articular.',questions:[
        {q:'¿Qué significa articularse con otros actores e instituciones?',o:['Trabajar sin informar a nadie','Coordinar capacidades y acciones','Entregar toda la responsabilidad a otros','Evitar la participación comunitaria'],a:1},
        {q:'¿Qué secuencia refleja mejor una preparación comunitaria?',o:['Improvisar → actuar → conocer','Conocer → organizar → planear → coordinar → responder','Responder → olvidar → planear','Esperar → actuar solo'],a:1},
        {q:'¿Qué papel puede cumplir el COPPAS ante una emergencia?',o:['Quedarse al margen','Promover formación, organización, planeación, articulación y asistencia','Actuar sin comunidad','Reemplazar a todos los organismos'],a:1}
      ]}
    }
  ];

  const npcs = [
    {id:'maria',x:840,y:1420,avatar:'👩',role:'Vecina',name:'María',lines:['La preparación empieza antes de la emergencia. Primero debemos conocer qué situaciones pueden afectar al barrio.']},
    {id:'jorge',x:1840,y:720,avatar:'👨‍🏫',role:'Docente',name:'Jorge',lines:['La escuela puede aportar espacio y organización. Lo importante es saber qué capacidad existe y cómo coordinarla.']},
    {id:'ana',x:2190,y:1545,avatar:'🧑‍⚕️',role:'Salud',name:'Ana',lines:['El centro de salud es un recurso del territorio. Reconocerlo ayuda a pensar una respuesta que no empiece desde cero.']},
    {id:'lucia',x:2310,y:850,avatar:'👵',role:'Familia',name:'Lucía',lines:['En una emergencia debemos saber cómo comunicarnos, dónde encontrarnos y quién necesita más apoyo.']},
    {id:'carlos',x:3220,y:1585,avatar:'🧑‍🤝‍🧑',role:'COPPAS',name:'Carlos',lines:['Cuando los grupos trabajan coordinadamente, la comunidad aprovecha mejor sus capacidades y evita acciones aisladas.']}
  ];

  const buildings = [
    {x:1320,y:360,w:430,h:310,name:'Escuela comunitaria',icon:'🏫',kind:'school'},
    {x:2240,y:1150,w:420,h:300,name:'Centro de salud',icon:'🏥',kind:'health'},
    {x:2050,y:520,w:360,h:260,name:'Casa familiar',icon:'🏠',kind:'home'},
    {x:2740,y:1230,w:430,h:300,name:'Centro COPPAS',icon:'⛪',kind:'coppas'},
    {x:1250,y:1660,w:400,h:210,name:'Punto de encuentro',icon:'📍',kind:'meeting'},
    {x:440,y:1260,w:340,h:220,name:'Centro comunitario',icon:'🏛️',kind:'community'}
  ];

  // All collision geometry is derived from what is actually drawn on the map.
  // No invisible fences/rectangles are used. Buildings are solid; roads stay open.
  const ROADS = [
    {x:0,y:1020,w:W,h:120},
    {x:980,y:0,w:120,h:H},
    {x:1860,y:0,w:120,h:H},
    {x:0,y:1540,w:W,h:110},
    {x:0,y:1880,w:W,h:85}
  ];
  const RIVER = {x:0,y:300,w:1060,h:470};
  const BRIDGE = {x:930,y:300,w:180,h:470};
  const obstacles = buildings.map(b=>({x:b.x-2,y:b.y-2,w:b.w+4,h:b.h+4,id:b.kind}));

  // Objectives are authored directly on walkable ground beside their related places.
  // Their positions are kept separate from building footprints and road lanes.

  const player={x:430,y:1570,r:14,speed:255,dir:'down',bob:0};
  const camera={x:0,y:0};
  const pressed = new Map();
  let currentLevel=1, unlockedLevel=1, levelObjectives=new Set(), discovered=new Map();
  let xp=0, preparation=0, lives=3, started=false, canMove=false, lastTime=performance.now(), miniMapTimer=0;
  let challengeQuestions=[],challengeIndex=0,challengeScore=0,currentObjective=null;

  const els={
    levelNo:document.getElementById('levelNo'),levelName:document.getElementById('levelName'),xp:document.getElementById('xp'),prep:document.getElementById('prep'),lives:document.getElementById('lives'),
    missionIcon:document.getElementById('missionIcon'),missionTitle:document.getElementById('missionTitle'),missionDesc:document.getElementById('missionDesc'),objectiveCount:document.getElementById('objectiveCount'),objectivePct:document.getElementById('objectivePct'),objectiveBar:document.getElementById('objectiveBar'),
    miniMap:document.getElementById('miniMap'),discoveryLog:document.getElementById('discoveryLog'),discoveryCount:document.getElementById('discoveryCount'),toast:document.getElementById('toast'),interactPrompt:document.getElementById('interactPrompt'),interactText:document.getElementById('interactText'),sceneBanner:document.getElementById('sceneBanner'),
    startModal:document.getElementById('startModal'),dialogModal:document.getElementById('dialogModal'),dialogAvatar:document.getElementById('dialogAvatar'),dialogRole:document.getElementById('dialogRole'),dialogName:document.getElementById('dialogName'),dialogContent:document.getElementById('dialogContent'),dialogContinue:document.getElementById('dialogContinue'),
    challengeModal:document.getElementById('challengeModal'),challengeTitle:document.getElementById('challengeTitle'),challengeBadge:document.getElementById('challengeBadge'),challengeIntro:document.getElementById('challengeIntro'),challengeBody:document.getElementById('challengeBody'),challengeFeedback:document.getElementById('challengeFeedback'),challengeNext:document.getElementById('challengeNext'),
    levelModal:document.getElementById('levelModal'),unlockTitle:document.getElementById('unlockTitle'),unlockDesc:document.getElementById('unlockDesc'),unlockXP:document.getElementById('unlockXP'),unlockBtn:document.getElementById('unlockBtn'),
    winModal:document.getElementById('winModal'),finalXP:document.getElementById('finalXP'),finalPrep:document.getElementById('finalPrep'),finalDiscoveries:document.getElementById('finalDiscoveries'),restartBtn:document.getElementById('restartBtn')
  };

  function current(){return LEVELS[currentLevel-1]}
  function showToast(msg){els.toast.textContent=msg;els.toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>els.toast.classList.remove('show'),2600)}
  function showBanner(msg){els.sceneBanner.textContent=msg;els.sceneBanner.classList.remove('hidden');clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>els.sceneBanner.classList.add('hidden'),2300)}
  function updateHud(){const l=current();els.levelNo.textContent=l.id;els.levelName.textContent=l.name;els.xp.textContent=xp;els.prep.textContent=Math.min(100,preparation)+'%';els.lives.textContent=lives;els.missionIcon.textContent=l.icon;els.missionTitle.textContent=l.name;els.missionDesc.textContent=l.desc;const total=l.objectives.length,done=levelObjectives.size,pct=Math.round(done/total*100);els.objectiveCount.textContent=`${done} / ${total}`;els.objectivePct.textContent=pct+'%';els.objectiveBar.style.width=pct+'%';}

  function resetLevel(id,spawnOverride=false){currentLevel=id;levelObjectives=new Set();const p=current().spawn;player.x=spawnOverride?spawnOverride.x:p.x;player.y=spawnOverride?spawnOverride.y:p.y;player.dir='down';camera.x=clamp(player.x-getViewport().w/2,0,W-getViewport().w);camera.y=clamp(player.y-getViewport().h/2,0,H-getViewport().h);updateHud();renderMiniMap();showBanner(`NIVEL ${id}: ${current().name}`);canMove=true;}
  function startGame(){els.startModal.classList.remove('show');started=true;canMove=true;canvas.focus();resetLevel(1,{x:430,y:1570});showToast('Explora libremente. Acércate a personas y puntos marcados y pulsa E.');}

  function getViewport(){return{w:canvas.clientWidth||1280,h:canvas.clientHeight||720}}
  function resizeCanvas(){const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);camera.x=clamp(camera.x,0,Math.max(0,W-rect.width));camera.y=clamp(camera.y,0,Math.max(0,H-rect.height));}
  window.addEventListener('resize',resizeCanvas); resizeCanvas();

  function rectContainsPoint(x,y,r,rect){
    return x+r>rect.x && x-r<rect.x+rect.w && y+r>rect.y && y-r<rect.y+rect.h;
  }

  function isBlockedCircle(nx,ny){
    if(nx-player.r<12 || ny-player.r<12 || nx+player.r>W-12 || ny+player.r>H-12) return true;
    for(const o of obstacles){
      const cx=clamp(nx,o.x,o.x+o.w), cy=clamp(ny,o.y,o.y+o.h);
      if(Math.hypot(nx-cx,ny-cy)<player.r) return true;
    }
    // Water is blocked except at the visible bridge.
    if(rectContainsPoint(nx,ny,player.r,RIVER) && !rectContainsPoint(nx,ny,player.r,BRIDGE)) return true;
    return false;
  }

  function movementVector(){let dx=0,dy=0;if(keys.has('w')||keys.has('arrowup')||touchKeys.has('up'))dy-=1;if(keys.has('s')||keys.has('arrowdown')||touchKeys.has('down'))dy+=1;if(keys.has('a')||keys.has('arrowleft')||touchKeys.has('left'))dx-=1;if(keys.has('d')||keys.has('arrowright')||touchKeys.has('right'))dx+=1;if(!dx&&!dy)return null;const len=Math.hypot(dx,dy)||1;return{dx:dx/len,dy:dy/len}}
  function move(dt){
    if(!started||!canMove)return;
    const v=movementVector();
    if(!v)return;
    const distance=player.speed*dt;
    const steps=Math.max(1,Math.ceil(distance/4));
    const step=distance/steps;
    for(let i=0;i<steps;i++){
      const nx=player.x+v.dx*step;
      if(!isBlockedCircle(nx,player.y)) player.x=nx;
      const ny=player.y+v.dy*step;
      if(!isBlockedCircle(player.x,ny)) player.y=ny;
    }
    if(Math.abs(v.dx)>Math.abs(v.dy)) player.dir=v.dx>0?'right':'left';
    else player.dir=v.dy>0?'down':'up';
    player.bob+=dt*12;
    const vp=getViewport();
    const targetX=clamp(player.x-vp.w/2,0,W-vp.w);
    const targetY=clamp(player.y-vp.h/2,0,H-vp.h);
    const smooth=1-Math.pow(0.0008,dt);
    camera.x += (targetX-camera.x)*smooth;
    camera.y += (targetY-camera.y)*smooth;
  }

  function allLevelObjectivesDone(){return levelObjectives.size===current().objectives.length}
  function findInteraction(){let best=null,bestD=78;for(const n of npcs){const d=dist(player,n);if(d<bestD){best={...n,isNpc:true,d};bestD=d}}for(const o of current().objectives){const d=dist(player,o);if(d<bestD && !levelObjectives.has(o.id)){best={...o,isObjective:true,d};bestD=d}}return best}
  function interact(){if(!started||!canMove)return;const e=findInteraction();if(!e){showToast('Acércate un poco más a una persona o punto de misión.');return;}canMove=false;if(e.isNpc)openNpc(e);else openObjective(e)}

  function openNpc(n){els.dialogAvatar.textContent=n.avatar;els.dialogRole.textContent=n.role;els.dialogName.textContent=n.name;els.dialogContent.innerHTML=`<p>${n.lines[0]}</p><div class="teach-box"><b>Aprendizaje:</b> ${n.id==='maria'?'Conocer la realidad permite planear mejor.':n.id==='jorge'?'Una capacidad comunitaria es útil cuando sabemos cómo integrarla.':n.id==='ana'?'Reconocer recursos evita partir de cero.':n.id==='lucia'?'Un plan familiar debe considerar comunicación y necesidades particulares.':'La articulación coordina capacidades y evita acciones aisladas.'}</div>`;els.dialogContinue.textContent='CERRAR';els.dialogContinue.onclick=()=>{els.dialogModal.classList.remove('show');canMove=true;};els.dialogModal.classList.add('show')}

  function openObjective(o){currentObjective=o; if(o.kind==='hotspot'){completeObjective(o); return;} if(o.kind==='kit'){openKitMinigame(o);return;} if(o.kind==='family'){openFamilyMinigame(o);return;} if(o.kind==='map'){openMapMinigame(o);return;} if(o.kind==='network'){openNetworkMinigame(o);return;}}

  function completeObjective(o,extraMessage=''){levelObjectives.add(o.id);if(!discovered.has(o.id)){discovered.set(o.id,{title:o.title,text:o.teach});renderDiscoveries();}xp+=35;updateHud();showToast(`✓ ${o.title} descubierto`);showBanner(o.teach);canMove=true;if(allLevelObjectivesDone())setTimeout(()=>openCheckpoint(),350)}

  function openCheckpoint(){canMove=false;challengeQuestions=current().checkpoint.questions;challengeIndex=0;challengeScore=0;els.challengeTitle.textContent=current().checkpoint.title;els.challengeBadge.textContent=current().checkpoint.icon;els.challengeIntro.textContent=current().checkpoint.intro;renderChallenge();els.challengeModal.classList.add('show')}
  function renderChallenge(){const q=challengeQuestions[challengeIndex];els.challengeBody.innerHTML=`<div class="challenge-question">${q.q}</div><div class="choice-grid">${q.o.map((x,i)=>`<button class="choice" data-i="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join('')}</div>`;els.challengeFeedback.className='challenge-feedback';els.challengeFeedback.innerHTML='';els.challengeNext.classList.add('hidden');els.challengeBody.querySelectorAll('.choice').forEach(btn=>btn.onclick=()=>submitChoice(Number(btn.dataset.i),q));}
  function submitChoice(i,q){els.challengeBody.querySelectorAll('.choice').forEach(b=>b.disabled=true);const correct=i===q.a;const btn=els.challengeBody.querySelector(`[data-i="${i}"]`);btn.classList.add(correct?'correct':'wrong');if(correct){challengeScore++;els.challengeFeedback.className='feedback ok';els.challengeFeedback.innerHTML='✅ Correcto. Continúa: el objetivo es aplicar el concepto en el territorio.'}else{lives=Math.max(0,lives-1);updateHud();els.challengeFeedback.className='feedback bad';els.challengeFeedback.innerHTML=`⚠️ Esta no es la mejor respuesta. Revisa el aprendizaje y vuelve a intentarlo al finalizar el reto.`;}challengeIndex++;if(challengeIndex<challengeQuestions.length){els.challengeNext.textContent='SIGUIENTE';els.challengeNext.classList.remove('hidden');els.challengeNext.onclick=renderChallenge;}else{const passed=challengeScore===challengeQuestions.length;els.challengeNext.textContent=passed?'DESBLOQUEAR SIGUIENTE NIVEL':'REPETIR RETO';els.challengeNext.classList.remove('hidden');els.challengeNext.onclick=passed?finishCheckpoint:()=>{challengeIndex=0;challengeScore=0;renderChallenge();};}}
  function finishCheckpoint(){const l=current();xp+=l.xp;preparation+=l.prep;updateHud();els.challengeModal.classList.remove('show');if(currentLevel===LEVELS.length){els.finalXP.textContent=xp;els.finalPrep.textContent=Math.min(100,preparation)+'%';els.finalDiscoveries.textContent=discovered.size;els.winModal.classList.add('show');canMove=false;return;}const next=LEVELS[currentLevel];unlockedLevel=Math.max(unlockedLevel,next.id);els.unlockTitle.textContent=`Nivel ${next.id}: ${next.name}`;els.unlockDesc.textContent=next.desc;els.unlockXP.textContent=next.xp;els.levelModal.classList.add('show');canMove=false;els.unlockBtn.onclick=()=>{els.levelModal.classList.remove('show');resetLevel(next.id);};}

  function openKitMinigame(o){
    els.challengeTitle.textContent='🧰 Arma el kit';els.challengeBadge.textContent='🎒';els.challengeIntro.textContent='Arrastra al bolso únicamente los elementos prioritarios para una respuesta inicial. Después tendrás que explicar una decisión.';
    const items=[['💧','Agua'],['🥫','Alimentos no perecederos'],['🔦','Linterna'],['🩹','Botiquín básico'],['🧼','Elementos de higiene'],['📄','Documentos protegidos'],['📺','Televisor'],['🎮','Consola'],['🧸','Objeto decorativo']];
    els.challengeBody.innerHTML=`<div class="drag-board"><div class="drag-column" id="kitItems"><h4>OBJETOS DISPONIBLES</h4>${items.map((it,i)=>`<div class="drag-item" draggable="true" data-good="${i<6?'1':'0'}"><span>${it[0]}</span>${it[1]}</div>`).join('')}</div><div class="drag-column" id="kitBag"><h4>BOLSO DE EMERGENCIA</h4><div style="font-size:9px;color:#8d96a3">Suelta aquí los elementos prioritarios.</div></div></div><div id="kitMsg" class="challenge-feedback"></div>`;
    els.challengeNext.textContent='COMPROBAR KIT';els.challengeNext.classList.remove('hidden');els.challengeNext.onclick=()=>checkKit(o);els.challengeModal.classList.add('show');setupDrag();
  }
  function setupDrag(){const bag=document.getElementById('kitBag'),items=document.querySelectorAll('.drag-item');let dragged=null;items.forEach(el=>{el.addEventListener('dragstart',()=>{dragged=el;el.classList.add('dragging')});el.addEventListener('dragend',()=>el.classList.remove('dragging'))});bag.addEventListener('dragover',e=>e.preventDefault());bag.addEventListener('drop',e=>{e.preventDefault();if(dragged){bag.appendChild(dragged);dragged.classList.remove('dragging')}})}
  function checkKit(o){const bag=[...document.querySelectorAll('#kitBag .drag-item')];const good=bag.filter(x=>x.dataset.good==='1').length;const bad=bag.filter(x=>x.dataset.good==='0').length;const all=[...document.querySelectorAll('#kitItems .drag-item')].length+bag.length;if(good===6&&bad===0&&all>=6){els.challengeBody.innerHTML+=`<div class="feedback ok">✅ Kit completo. Ahora has aplicado el criterio de priorizar necesidades básicas.</div>`;els.challengeNext.textContent='CONTINUAR';els.challengeNext.onclick=()=>{els.challengeModal.classList.remove('show');completeObjective(o)};}else{lives=Math.max(0,lives-1);updateHud();document.getElementById('kitMsg').className='feedback bad';document.getElementById('kitMsg').textContent='Hay elementos prioritarios fuera del bolso o llevaste elementos accesorios. Reorganiza y vuelve a comprobar.';}}

  function openFamilyMinigame(o){els.challengeTitle.textContent='🏠 Organiza el plan familiar';els.challengeBadge.textContent='🧭';els.challengeIntro.textContent='Toma tres decisiones para preparar a la familia. Cada elección debe responder a una necesidad concreta.';const opts=[
    {label:'Punto de encuentro',options:['Parque abierto fuera de la zona de riesgo','Estacionamiento subterráneo','Dentro de la vivienda'],good:0},
    {label:'Comunicación',options:['Definir un canal y un contacto común','Cada persona se comunica cuando pueda','No hace falta acordar nada'],good:0},
    {label:'Apoyo',options:['Asignar apoyo a quien lo necesite','Dejar que todos resuelvan por separado','Esperar a improvisar'],good:0}
  ];els.challengeBody.innerHTML=opts.map((g,gi)=>`<div style="margin-top:12px"><div class="eyebrow">${g.label}</div><div class="choice-grid">${g.options.map((x,i)=>`<button class="choice family-choice" data-g="${gi}" data-i="${i}">${x}</button>`).join('')}</div></div>`).join('');els.challengeNext.textContent='CONFIRMAR PLAN';els.challengeNext.classList.remove('hidden');els.challengeNext.onclick=()=>checkFamily(o);els.challengeModal.classList.add('show');}
  function checkFamily(o){let score=0;for(let g=0;g<3;g++){const pick=[...document.querySelectorAll(`.family-choice[data-g="${g}"]`)].find(b=>b.classList.contains('selected'));if(pick&&Number(pick.dataset.i)===0)score++;}if(score===3){els.challengeFeedback.className='feedback ok';els.challengeFeedback.textContent='✅ Plan coherente: define encuentro, comunicación y apoyo.';els.challengeNext.textContent='CONTINUAR';els.challengeNext.onclick=()=>{els.challengeModal.classList.remove('show');completeObjective(o)};}else{lives=Math.max(0,lives-1);updateHud();els.challengeFeedback.className='feedback bad';els.challengeFeedback.textContent='Revisa las tres decisiones. El plan debe reducir la improvisación y considerar necesidades particulares.';}}

  function openMapMinigame(o){els.challengeTitle.textContent='📍 Completa el mapa';els.challengeBadge.textContent='🗺️';els.challengeIntro.textContent='Coloca tres marcadores sobre el plano: riesgo, capacidad y punto de respuesta. Los sitios deben tener sentido con el territorio.';els.challengeBody.innerHTML=`<div class="map-task"><canvas id="taskMap" width="620" height="360"></canvas><div class="task-caption">Haz clic primero en un lugar de riesgo, luego en un recurso y finalmente en un punto de encuentro.</div></div><div id="mapStatus" class="challenge-feedback"></div>`;const c=document.getElementById('taskMap'),g=c.getContext('2d');drawTaskMap(g,c.width,c.height);let phase=0,markers=[];c.addEventListener('click',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;markers.push({x,y,phase});phase++;if(phase<=3){drawTaskMap(g,c.width,c.height);markers.forEach(m=>{g.fillStyle=['#b3131b','#2f7d51','#293241'][m.phase];g.beginPath();g.arc(m.x,m.y,9,0,Math.PI*2);g.fill()});document.getElementById('mapStatus').textContent=phase<3?`Marcador ${phase}/3 colocado.`:'Ya están los tres marcadores. Comprueba el mapa.';if(phase===3){els.challengeNext.disabled=false;}}});els.challengeNext.disabled=false;els.challengeNext.textContent='COMPROBAR MAPA';els.challengeNext.classList.remove('hidden');els.challengeNext.onclick=()=>checkMap(o,markers);els.challengeModal.classList.add('show');}
  function drawTaskMap(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#dbe6d7';g.fillRect(0,0,w,h);g.fillStyle='#a1cbd8';g.fillRect(0,55,180,90);g.fillStyle='#c7bdab';g.fillRect(0,190,w,38);g.fillRect(280,0,36,h);g.fillStyle='#f2efe6';g.fillRect(390,90,160,80);g.fillStyle='#fff';g.fillRect(480,250,90,55);g.fillStyle='#475467';g.font='700 12px system-ui';g.fillText('CENTRO DE SALUD',400,84);g.fillText('ESCUELA',485,245);g.fillText('CAMINO PRINCIPAL',20,210)}
  function checkMap(o,markers){if(markers.length<3){els.challengeFeedback.className='feedback bad';els.challengeFeedback.textContent='Necesitas colocar los tres marcadores.';return;}const risk=markers[0].x<200&&markers[0].y<170;const capacity=markers[1].x>360&&markers[1].y<190;const meeting=markers[2].x>450&&markers[2].y>230;if(risk&&capacity&&meeting){els.challengeFeedback.className='feedback ok';els.challengeFeedback.textContent='✅ Mapa coherente: riesgo, capacidad y punto de respuesta identificados.';els.challengeNext.textContent='CONTINUAR';els.challengeNext.onclick=()=>{els.challengeModal.classList.remove('show');completeObjective(o)};}else{lives=Math.max(0,lives-1);updateHud();els.challengeFeedback.className='feedback bad';els.challengeFeedback.textContent='Revisa la relación entre los elementos del territorio: el marcador 1 debe señalar un riesgo, el 2 un recurso y el 3 un lugar de respuesta.';}}

  function openNetworkMinigame(o){
    els.challengeTitle.textContent='🤝 Activa la red';
    els.challengeBadge.textContent='🔗';
    els.challengeIntro.textContent='Conecta a los actores que pueden colaborar frente a una emergencia. Construye una red de apoyo, no una cadena de dependencias.';
    const nodes=[['⛪','COPPAS'],['🏥','Salud'],['🏫','Escuela'],['👥','Comunidad'],['🚑','Socorro']];
    els.challengeBody.innerHTML=`<div id="networkBoard" class="network-board"><svg class="network-svg" aria-hidden="true"><defs><filter id="edgeShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".16"/></filter></defs></svg></div><div id="networkStatus" class="challenge-feedback"></div>`;
    const board=document.getElementById('networkBoard');
    const svg=board.querySelector('.network-svg');
    const pos=[[50,50],[78,30],[28,27],[28,73],[78,72]];
    nodes.forEach((n,i)=>{
      const el=document.createElement('button');
      el.className='choice network-node';
      el.style.left=pos[i][0]+'%';
      el.style.top=pos[i][1]+'%';
      el.textContent=`${n[0]} ${n[1]}`;
      el.dataset.i=i;
      board.appendChild(el);
    });
    let selected=[],edges=[];
    const clearSelection=()=>board.querySelectorAll('.network-node').forEach(b=>b.classList.remove('selected'));
    board.querySelectorAll('.network-node').forEach(btn=>btn.onclick=()=>{
      const i=Number(btn.dataset.i);
      if(selected.length===0){selected=[i];btn.classList.add('selected');return;}
      if(selected.length===1&&i!==selected[0]){
        const a=selected[0],b=i;
        const exists=edges.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
        if(!exists) edges.push([a,b]);
        selected=[];clearSelection();drawNetworkLines(board,edges);
        document.getElementById('networkStatus').textContent=`Conexiones creadas: ${edges.length}`;
        return;
      }
      selected=[];clearSelection();
    });
    const redraw=()=>drawNetworkLines(board,edges);
    window.addEventListener('resize',redraw,{passive:true});
    els.challengeNext.textContent='COMPROBAR RED';
    els.challengeNext.classList.remove('hidden');
    els.challengeNext.onclick=()=>checkNetwork(o,edges);
    els.challengeModal.classList.add('show');
    requestAnimationFrame(redraw);
  }
  function drawNetworkLines(board,edges){
    const svg=board.querySelector('.network-svg');
    if(!svg)return;
    const old=svg.querySelectorAll('.edge-line');old.forEach(e=>e.remove());
    const br=board.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${br.width} ${br.height}`);svg.setAttribute('preserveAspectRatio','none');
    const nodes=[...board.querySelectorAll('.network-node')];
    edges.forEach(([ai,bi])=>{
      const ra=nodes[ai].getBoundingClientRect(), rb=nodes[bi].getBoundingClientRect();
      const a={x:ra.left+ra.width/2-br.left,y:ra.top+ra.height/2-br.top};
      const b={x:rb.left+rb.width/2-br.left,y:rb.top+rb.height/2-br.top};
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.max(Math.hypot(dx,dy),1),ux=dx/len,uy=dy/len;
      const startPad=Math.min(ra.width,ra.height)/2-3,endPad=Math.min(rb.width,rb.height)/2-3;
      const sx=a.x+ux*startPad,sy=a.y+uy*startPad,ex=b.x-ux*endPad,ey=b.y-uy*endPad;
      const bend=Math.min(52,len*.20),px=-uy,py=ux;
      const d=`M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx+dx*.28+px*bend).toFixed(1)} ${(sy+dy*.28+py*bend).toFixed(1)}, ${(ex-dx*.28+px*bend).toFixed(1)} ${(ey-dy*.28+py*bend).toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.classList.add('edge-line');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','#c93a43');path.setAttribute('stroke-width','3.5');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('opacity','.72');path.setAttribute('filter','url(#edgeShadow)');svg.appendChild(path);
    });
  }
  function checkNetwork(o,edges){const connected=new Set([0]);let changed=true;while(changed){changed=false;for(const [a,b] of edges){if(connected.has(a)&&!connected.has(b)){connected.add(b);changed=true}if(connected.has(b)&&!connected.has(a)){connected.add(a);changed=true}}}if(connected.size>=4){els.challengeFeedback.className='feedback ok';els.challengeFeedback.textContent='✅ Red activada: el COPPAS quedó conectado con varias capacidades del territorio.';els.challengeNext.textContent='CONTINUAR';els.challengeNext.onclick=()=>{els.challengeModal.classList.remove('show');completeObjective(o)};}else{lives=Math.max(0,lives-1);updateHud();els.challengeFeedback.className='feedback bad';els.challengeFeedback.textContent='La red todavía está fragmentada. Conecta más actores para que las capacidades puedan coordinarse.';}}

  // Family choices use delegated selection
  els.challengeBody.addEventListener('click',e=>{const b=e.target.closest('.family-choice');if(!b)return;document.querySelectorAll(`.family-choice[data-g="${b.dataset.g}"]`).forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});

  function renderDiscoveries(){if(!discovered.size){els.discoveryLog.innerHTML='<div class="empty-state">Habla con personas, revisa lugares y descubre información.</div>';}else{els.discoveryLog.innerHTML=[...discovered.values()].map(x=>`<div class="discovery"><b>${x.title}</b>${x.text}</div>`).join('');}els.discoveryCount.textContent=`${discovered.size} hallazgos`}

  function draw(){
    const vp=getViewport();ctx.clearRect(0,0,vp.w,vp.h);ctx.save();ctx.translate(-camera.x,-camera.y);drawGround();drawRoads();drawWater();drawBuildings();drawObjectiveMarkers();drawNPCs();drawPlayer();drawVignetteWorld();ctx.restore();updatePrompt();
  }

  function drawGround(){ctx.fillStyle='#cfe0c6';ctx.fillRect(0,0,W,H); // subtle terrain cells
    const cell=110;for(let y=0;y<H;y+=cell){for(let x=0;x<W;x+=cell){ctx.fillStyle=((x/cell+y/cell)%2===0)?'rgba(255,255,255,.08)':'rgba(64,94,64,.025)';ctx.fillRect(x,y,cell,cell)}}
    // distant hills / tree belt
    ctx.fillStyle='#b7cbaa';ctx.beginPath();ctx.moveTo(0,180);ctx.quadraticCurveTo(420,40,900,170);ctx.quadraticCurveTo(1440,20,1900,170);ctx.quadraticCurveTo(2480,40,3200,170);ctx.lineTo(3200,0);ctx.lineTo(0,0);ctx.closePath();ctx.fill();
    for(let i=0;i<38;i++){const x=(i*263)%3100+40,y=(i*97)%270+20;tree(x,y,1.1)}
  }
  function drawRoads(){
    ROADS.forEach(r=>{
      ctx.fillStyle='#c8bdab';ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.strokeStyle='rgba(255,255,255,.82)';ctx.lineWidth=4;ctx.setLineDash([28,24]);
      ctx.beginPath();
      if(r.w>r.h){ctx.moveTo(r.x,r.y+r.h/2);ctx.lineTo(r.x+r.w,r.y+r.h/2)}
      else{ctx.moveTo(r.x+r.w/2,r.y);ctx.lineTo(r.x+r.w/2,r.y+r.h)}
      ctx.stroke();ctx.setLineDash([]);
    });
  }
  function drawWater(){
    ctx.save();
    ctx.fillStyle='#91c4d3';ctx.fillRect(RIVER.x,RIVER.y,RIVER.w,RIVER.h);
    // Water texture
    ctx.fillStyle='rgba(255,255,255,.24)';
    for(let y=330;y<760;y+=48){for(let x=25;x<1020;x+=88){ctx.beginPath();ctx.arc(x,y,18,0,Math.PI);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=3;ctx.stroke()}}
    // Visible bridge aligns with the vertical street and is the only crossing.
    ctx.fillStyle='#a98f73';ctx.fillRect(BRIDGE.x,BRIDGE.y,BRIDGE.w,BRIDGE.h);
    ctx.fillStyle='rgba(255,255,255,.72)';
    for(let y=BRIDGE.y+18;y<BRIDGE.y+BRIDGE.h-6;y+=34){ctx.fillRect(BRIDGE.x+18,y,BRIDGE.w-36,5)}
    ctx.strokeStyle='#795f48';ctx.lineWidth=5;ctx.strokeRect(BRIDGE.x+2,BRIDGE.y+2,BRIDGE.w-4,BRIDGE.h-4);
    ctx.fillStyle='rgba(255,248,235,.92)';ctx.fillRect(350,490,190,60);
    ctx.fillStyle='#8c4a4a';ctx.font='900 13px system-ui';ctx.textAlign='left';ctx.fillText('⚠ ZONA INUNDABLE',365,525);
    ctx.restore();
  }
  function drawBuildings(){
    for(const b of buildings){
      const shadowX=b.x+8, shadowY=b.y+12;
      ctx.fillStyle='rgba(33,41,51,.14)';roundRect(shadowX,shadowY,b.w,b.h,18,true);
      ctx.fillStyle='#f8fafc';roundRect(b.x,b.y,b.w,b.h,18,true);
      ctx.strokeStyle='#d2d9df';ctx.lineWidth=2;roundRect(b.x,b.y,b.w,b.h,18,false);
      ctx.fillStyle='#fefefe';roundRect(b.x+20,b.y+18,b.w-40,56,12,true);
      ctx.font='27px sans-serif';ctx.textAlign='center';ctx.fillText(b.icon,b.x+b.w/2,b.y+55);
      // Windows
      for(let yy=b.y+106;yy<b.y+b.h-82;yy+=58){
        for(let xx=b.x+34;xx<b.x+b.w-26;xx+=72){
          ctx.fillStyle='#d8edf1';roundRect(xx,yy,34,25,5,true);
        }
      }
      // Door first, then the building title sits safely above it.
      ctx.fillStyle='#a86c46';roundRect(b.x+b.w/2-18,b.y+b.h-48,36,48,7,true);
      const labelY=b.y+b.h-78;
      ctx.fillStyle='rgba(255,255,255,.95)';roundRect(b.x+18,labelY,b.w-36,28,9,true);
      ctx.strokeStyle='#e1e6ea';ctx.lineWidth=1;roundRect(b.x+18,labelY,b.w-36,28,9,false);
      ctx.fillStyle='#303a47';ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillText(b.name,b.x+b.w/2,labelY+18);
    }
  }
  function drawSigns(){ /* intentionally hidden: objective labels now live with their markers */ }
  function drawObjectiveMarkers(){
    current().objectives.forEach(o=>{
      if(levelObjectives.has(o.id))return;
      const pulse=1+Math.sin(performance.now()/270)/12;
      const my=o.y;
      ctx.save();
      ctx.strokeStyle='#b3131b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,my,27*pulse,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.96)';ctx.beginPath();ctx.arc(o.x,my,19,0,Math.PI*2);ctx.fill();
      ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(o.icon,o.x,my+7);

      const label=o.title;
      ctx.font='900 11px system-ui';
      const width=Math.max(110,ctx.measureText(label).width+28), height=28;
      const placement={
        'risk-river':{dx:0,dy:42},
        'school':{dx:0,dy:54},
        'health':{dx:0,dy:54},
        'kit-table':{dx:0,dy:46},
        'family-house':{dx:0,dy:54},
        'map-board':{dx:0,dy:46},
        'network':{dx:0,dy:46}
      }[o.id] || {dx:0,dy:46};
      let lx=clamp(o.x+placement.dx,width/2+8,W-width/2-8);
      let ly=clamp(o.y+placement.dy,18,H-height-18);
      ctx.fillStyle='rgba(255,255,255,.96)';roundRect(lx-width/2,ly-height/2,width,height,10,true);
      ctx.strokeStyle='rgba(179,19,27,.22)';ctx.lineWidth=1;roundRect(lx-width/2,ly-height/2,width,height,10,false);
      ctx.fillStyle='#394453';ctx.textAlign='center';ctx.fillText(label,lx,ly+4);
      ctx.restore();
    });
  }
  function drawNPCs(){
    for(const n of npcs){
      ctx.fillStyle='rgba(24,32,43,.14)';ctx.beginPath();ctx.ellipse(n.x,n.y+17,17,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(n.x,n.y-2,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#d4d9de';ctx.lineWidth=2;ctx.stroke();
      ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText(n.avatar,n.x,n.y+6);
      ctx.font='900 10px system-ui';const w=Math.max(52,ctx.measureText(n.name).width+16);
      ctx.fillStyle='rgba(255,255,255,.94)';roundRect(n.x-w/2,n.y+31,w,20,8,true);
      ctx.strokeStyle='#e1e6ea';ctx.lineWidth=1;roundRect(n.x-w/2,n.y+31,w,20,8,false);
      ctx.fillStyle='#334155';ctx.fillText(n.name,n.x,n.y+45);
    }
  }
  function drawPlayer(){const bob=Math.sin(player.bob)*2;ctx.save();ctx.translate(player.x,player.y+bob);ctx.fillStyle='rgba(24,32,43,.18)';ctx.beginPath();ctx.ellipse(0,17,17,7,0,0,Math.PI*2);ctx.fill(); // body
    ctx.fillStyle='#b3131b';roundRect(-13,-2,26,26,8,true);ctx.fillStyle='#f1c8aa';ctx.beginPath();ctx.arc(0,-13,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#252d38';roundRect(-11,-20,22,7,5,true);ctx.fillStyle='#fff';ctx.font='8px system-ui';ctx.textAlign='center';ctx.fillText('C',0,15); // facing marker
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(player.dir==='left'?-5:player.dir==='right'?5:0,-14,2,0,Math.PI*2);ctx.fill();ctx.restore();}
  function drawVignetteWorld(){const vp=getViewport();const grad=ctx.createRadialGradient(camera.x+vp.w/2,camera.y+vp.h/2,Math.min(vp.w,vp.h)*.2,camera.x+vp.w/2,camera.y+vp.h/2,Math.max(vp.w,vp.h)*.8);grad.addColorStop(0,'rgba(255,255,255,0)');grad.addColorStop(1,'rgba(34,42,50,.10)');ctx.fillStyle=grad;ctx.fillRect(camera.x,camera.y,vp.w,vp.h)}
  function tree(x,y,s){ctx.fillStyle='#7b542e';ctx.fillRect(x-4*s,y+15*s,8*s,26*s);ctx.fillStyle='#4a8b57';ctx.beginPath();ctx.arc(x,y,28*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#65a86b';ctx.beginPath();ctx.arc(x+18*s,y+5*s,20*s,0,Math.PI*2);ctx.fill()}
  function sign(x,y,icon,text){ctx.fillStyle='rgba(255,255,255,.88)';roundRect(x-72,y-24,144,48,12,true);ctx.strokeStyle='#dae0e4';ctx.lineWidth=1;roundRect(x-72,y-24,144,48,12,false);ctx.font='18px sans-serif';ctx.textAlign='left';ctx.fillText(icon,x-58,y+6);ctx.fillStyle='#364152';ctx.font='900 11px system-ui';ctx.fillText(text,x-30,y+4)}
  function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();else ctx.stroke()}

  function updatePrompt(){const e=findInteraction();if(!e||!started||!canMove){els.interactPrompt.classList.add('hidden');return;}const vp=getViewport();const sx=e.x-camera.x,sy=e.y-camera.y;els.interactPrompt.style.left=sx+'px';els.interactPrompt.style.top=(sy-44)+'px';els.interactText.textContent=e.isNpc?`Hablar con ${e.name}`:(e.title||e.name||'Interactuar');els.interactPrompt.classList.remove('hidden')}

  function renderMiniMap(){
    const mm=els.miniMap;
    const waterLeft=RIVER.x/W*100, waterTop=RIVER.y/H*100, waterW=RIVER.w/W*100, waterH=RIVER.h/H*100;
    mm.innerHTML=`<div class="map-grid"></div>
      <div class="map-water" style="left:${waterLeft}%;top:${waterTop}%;width:${waterW}%;height:${waterH}%;"></div>
      <div class="map-bridge" style="left:${BRIDGE.x/W*100}%;top:${BRIDGE.y/H*100}%;width:${BRIDGE.w/W*100}%;height:${BRIDGE.h/H*100}%;"></div>
      <div class="map-road h" style="top:${ROADS[0].y/H*100}%;height:${ROADS[0].h/H*100}%;"></div>
      <div class="map-road h" style="top:${ROADS[3].y/H*100}%;height:${ROADS[3].h/H*100}%;"></div>
      <div class="map-road h" style="top:${ROADS[4].y/H*100}%;height:${ROADS[4].h/H*100}%;"></div>
      <div class="map-road v" style="left:${ROADS[1].x/W*100}%;width:${ROADS[1].w/W*100}%;"></div>
      <div class="map-road v" style="left:${ROADS[2].x/W*100}%;width:${ROADS[2].w/W*100}%;"></div>`;
    buildings.forEach(b=>{const d=document.createElement('div');d.className='map-dot green';d.style.left=((b.x+b.w/2)/W*100)+'%';d.style.top=((b.y+b.h/2)/H*100)+'%';mm.appendChild(d)});
    current().objectives.forEach(o=>{if(levelObjectives.has(o.id))return;const d=document.createElement('div');d.className='map-dot';d.style.left=(o.x/W*100)+'%';d.style.top=(o.y/H*100)+'%';mm.appendChild(d)});
    npcs.forEach(n=>{const d=document.createElement('div');d.className='map-dot npc';d.style.left=(n.x/W*100)+'%';d.style.top=(n.y/H*100)+'%';mm.appendChild(d)});
    const p=document.createElement('div');p.className='map-player';p.style.left=(player.x/W*100)+'%';p.style.top=(player.y/H*100)+'%';mm.appendChild(p);
  }

  function loop(now){const dt=Math.min(.035,(now-lastTime)/1000);lastTime=now;move(dt);draw();if(now-miniMapTimer>120){renderMiniMap();miniMapTimer=now}requestAnimationFrame(loop)}

  document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(k))e.preventDefault();keys.add(k);if(k==='e')interact();if(k==='escape'){document.querySelectorAll('.modal.show').forEach(m=>{if(m.id!=='startModal')m.classList.remove('show')});if(started)canMove=true}});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();touchKeys.clear()});
  els.startModal.querySelector('#startBtn').onclick=startGame;
  els.restartBtn.onclick=()=>location.reload();
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{document.getElementById(b.dataset.close).classList.remove('show');canMove=true});
  document.querySelectorAll('[data-move]').forEach(btn=>{const dir=btn.dataset.move;const down=e=>{e.preventDefault();touchKeys.add(dir)};const up=e=>{e.preventDefault();touchKeys.delete(dir)};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)});
  document.getElementById('touchInteract').addEventListener('click',interact);
  canvas.addEventListener('click',()=>canvas.focus());

  updateHud();renderDiscoveries();renderMiniMap();requestAnimationFrame(loop);
})();
