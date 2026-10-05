const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path'),http=require('http');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.AURUM_BROWSER_PATH?{executablePath:process.env.AURUM_BROWSER_PATH}:{})});
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  const target=file===root?path.join(root,'index.html'):file;
  if(!target.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',target.endsWith('.html')?'text/html':target.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(data);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 // Older CRM titles must never restore the former eight-step flow.
 const live={textos:{doc_titulo:'Perfil de Vida · Aurum',p1_titulo:'Fachadas anteriores',paso_tpl:'Paso {n} de 8'}};
 const catalogo={espacios:{},app:{circulacion:0.12,amplitud_escalon:0.1}};
 const context=await browser.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 Instagram'});
 const posts=[],errors=[];

 await context.route('**/*',async route=>{
  const req=route.request(),u=req.url();
  if(u.startsWith(base))return route.continue();
  if(u.includes('script.google.com')&&req.method()==='GET')return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(u.includes('recurso=textos')?live:catalogo)});
  if(req.method()==='POST'){try{posts.push(JSON.parse(req.postData()))}catch{};return route.fulfill({status:200,body:'ok'});}
  return route.abort();
 });
 const page=await context.newPage();await page.emulateMedia({reducedMotion:"reduce"});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?utm_source=instagram&utm_medium=paid_social&utm_campaign=perfil_vida&fbclid=test');
 await page.waitForFunction(()=>window.__textosVivos&&window.__catalogoVivo);
 assert.equal(await page.locator('h1:visible').count(),1);
 assert.match(await page.title(),/perfil espacial/);
 assert.equal(await page.locator('.beneficios li').count(),6);
 assert.equal(await page.locator('#progress span').count(),6);
 assert.equal(await page.locator('.agenda-directa').getAttribute('href'),await page.evaluate(()=>urlAgenda()));
 if(process.env.AURUM_SCREENSHOTS_DIR){fs.mkdirSync(process.env.AURUM_SCREENSHOTS_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.AURUM_SCREENSHOTS_DIR,'aurum-portada-movil.png'),fullPage:true,animations:'disabled'});}
 await page.getByRole('button',{name:'Descubrir mi perfil'}).click();
 await page.locator('#estilos .card').first().click();
 await page.waitForFunction(()=>pActual()===2);
 await page.locator('#sensCont').click();assert.equal(await page.evaluate(()=>pActual()),2);
 await page.locator('#sensaciones button').filter({hasText:'Calidez'}).click();
 await page.locator('#sensCont').click();
 await page.locator('#momentos button').filter({hasText:'Trabajar desde casa'}).click();
 await page.locator('#momentos button').filter({hasText:'Cocinar en familia'}).click();
 await page.locator('#momCont').click();assert.equal(await page.evaluate(()=>pActual()),4);
 await page.getByRole('button',{name:'Familia con hijos',exact:true}).click();
 assert.equal(await page.evaluate(()=>numRecamaras()),3);
 await page.locator('[data-p="4"] .nav .btn').click();
 await page.getByRole('button',{name:'Ver mi lectura inicial'}).click();
 assert.equal(await page.evaluate(()=>pActual()),5);
 assert.equal(await page.locator('#contextoMsg').isVisible(),true);
 await page.getByRole('button',{name:'Sí, ya tengo',exact:true}).click();
 assert.equal(await page.locator('#terrenoSuperficie').isVisible(),true);
 await page.locator('#terrenoChips button').first().click();
 await page.getByRole('button',{name:'En los próximos 3 meses',exact:true}).click();
 await page.getByRole('button',{name:'Ver mi lectura inicial'}).click();
 assert.equal(await page.evaluate(()=>pActual()),6);
 assert.match(await page.locator('#perfilTitulo').innerText(),/flexible/);
 assert.match(await page.locator('#perfilLectura').innerText(),/momento del día/);
 assert.equal(posts.filter(p=>p.folio).length,0);
 assert(await page.locator('#perfilLectura').isVisible());
 assert((await page.locator('#perfilLectura').boundingBox()).y<(await page.locator('#gNombre').boundingBox()).y);
 if(process.env.AURUM_SCREENSHOTS_DIR){fs.mkdirSync(process.env.AURUM_SCREENSHOTS_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.AURUM_SCREENSHOTS_DIR,'aurum-lectura-movil.png'),fullPage:true,animations:'disabled'});}
 await page.locator('#gateEnviar').click();assert.equal(await page.evaluate(()=>pActual()),6);
 await page.locator('#gNombre').fill('Prueba Local');await page.locator('#gContact').fill('123');
 await page.locator('#gateEnviar').click();assert.equal(await page.evaluate(()=>pActual()),6);
 await page.locator('#gContact').fill('6621234567');await page.locator('#gateEnviar').click();
 await page.waitForFunction(()=>pActual()===7);
 assert.equal(posts.filter(p=>p.folio).length,1);
 const lead=posts.find(p=>p.folio);
 assert.equal(lead.terreno_estado,'si');assert.equal(lead.inicio_proyecto,'pronto');
 assert.equal(lead.perfil_espacial.id,'flexible');assert.equal(lead.utm_source,'instagram');assert.equal(lead.fbclid,'test');
 assert.equal(lead.contacto_canal,'whatsapp');assert.equal(lead.recamaras,3);
 assert.match(lead.proyecto,/3 meses/);assert(lead.calculo.m2habLo>0);
 assert.match(await page.locator('#resultadoEnvio').innerText(),/WhatsApp/);
 assert.equal(await page.locator('#agendaEmbed iframe').count(),0);
 assert(await page.locator('#btnAgenda').isVisible());
 assert.match(await page.locator('#waAgenda').getAttribute('href'),/claridad/);
 const storage=await page.evaluate(()=>localStorage.getItem('aurumS'));
 assert(!storage.includes('Prueba Local'));assert(!storage.includes('6621234567'));
 await page.evaluate(()=>revelar());assert.equal(posts.filter(p=>p.folio).length,1);
 if(process.env.AURUM_SCREENSHOTS_DIR){fs.mkdirSync(process.env.AURUM_SCREENSHOTS_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.AURUM_SCREENSHOTS_DIR,'aurum-resultado-movil.png'),fullPage:true,animations:'disabled'});}
 await page.reload();await page.waitForFunction(()=>window.__textosVivos&&window.__catalogoVivo);
 assert.equal(await page.evaluate(()=>S.terrenoEstado),'si');assert.equal(await page.evaluate(()=>S.inicioProyecto),'pronto');
 await page.evaluate(()=>{selTerrenoEstado('no');selInicio('explorando');ir(6);});
 assert.equal(await page.evaluate(()=>S.terreno),null);
 await page.locator('#gateToggle').click();await page.locator('#gNombre').fill('Prueba Correo');await page.locator('#gContact').fill('persona@example.com');
 await page.locator('#gContact').press('Enter');await page.waitForFunction(()=>pActual()===7);
 assert.match(await page.locator('#resultadoEnvio').innerText(),/correo/);
 assert.equal(posts.filter(p=>p.folio).length,2);
 // Verify profiles actually respond to other sets of choices.
 const profiles=await page.evaluate(()=>{
  const cases=[['trabajo','flexible'],['recibir','social'],['jardin','exterior'],['leer','refugio'],['ninguno','equilibrio']];
  return cases.map(([mom,expected])=>{S.extras=new Set();S.sensaciones=[];S.momentos=[MOMENTOS.findIndex(m=>m.id===mom)];return [perfilEspacial().id,expected];});
 });profiles.forEach(([actual,expected])=>assert.equal(actual,expected));
 // Late live text updates must preserve the current reading and six-step flow.
 await page.evaluate(()=>{ir(6);aplicarTextos({q6_desc_equilibrio:'Lectura actualizada desde el CRM.',paso_tpl:'Paso {n} de 8',doc_titulo:'Texto anterior'});});
 assert.equal(await page.locator('#perfilLectura').innerText(),'Lectura actualizada desde el CRM.');
 assert.match(await page.title(),/perfil espacial/);
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>ir(0));await page.screenshot({path:'/workspace/scratch/aurum-portada-escritorio.png',fullPage:true,animations:"disabled"});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 // Direct calendar route: no gate or lead submitted; existing Schedule measurement remains.
 const before=posts.filter(p=>p.folio).length;
 await page.evaluate(()=>{window.__events=[];window.fbq=(...args)=>window.__events.push(args);document.querySelector('.agenda-directa').addEventListener('click',ev=>ev.preventDefault());});
 await page.route('https://calendar.google.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<p>Agenda de prueba</p>'}));
 await page.locator('.agenda-directa').click({noWaitAfter:true});
 assert.equal(posts.filter(p=>p.folio).length,before);
 assert(await page.evaluate(()=>window.__events.some(a=>a[0]==='track'&&a[1]==='Schedule'&&a[2].origen==='directo')));
 assert(await page.evaluate(()=>window.__events.some(a=>a[1]==='SesionDirecta')));
 assert.deepEqual(errors,[]);
 console.log('PASS: móvil con textos/catálogo vivos; seis pasos; lectura previa; validación; WhatsApp/correo; perfiles; CRM/UTM; recarga; agenda directa; sin errores JS.');
 // Desktop calendar embedding and offline defaults.
 const desktop=await browser.newContext({viewport:{width:1440,height:1000}});
 await desktop.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 const desk=await desktop.newPage();desk.on('pageerror',e=>errors.push(e.message));
 await desk.goto(base);assert.match(await desk.title(),/perfil espacial/);
 await desk.evaluate(()=>{selTerrenoEstado('no');selInicio('explorando');ir(6);document.getElementById('gNombre').value='Prueba escritorio';document.getElementById('gContact').value='6621234567';revelar();});
 assert.equal(await desk.locator('#agendaEmbed iframe').count(),1);
 assert.match(await desk.locator('#agendaEmbed iframe').getAttribute('src'),/calendar.google.com/);
 assert.deepEqual(errors,[]);
 await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exit(1)});
