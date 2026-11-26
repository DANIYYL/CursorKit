const NL=String.fromCharCode(10);
const CANV=new Set(['comet','neon','sparkle','bubbles','confetti','ribbon','lightning','fire','snow','matrix','smoke','plexus','waves','snake','squares','rubber','dotgrid']);
export function cssFor(mode,cls){
  const isBase=s=>['#dot','#ring','#fx','body.seen','body.native','body #ring','body:has(.btn.hov) #ring'].some(p=>s.startsWith(p))||(mode==='spotlight'&&s.startsWith('#spot'));
  const isBtn=s=>{if(!cls||!s.startsWith('.'+cls))return false;const n=s[cls.length+1];return !n||'.: ,'.includes(n)};
  const tag='data-cursor="'+mode+'"',out=[],kfs=[];
  for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch(e){continue}
    for(const r of rs){
      if(r.type===1){const s=r.selectorText;
        if(s.includes(':is(')){if(s.includes(tag))out.push('body['+tag+'] #dot {'+NL+'  display: block;'+NL+'}')}
        else if(s.includes(tag)||isBase(s)||isBtn(s)||s==='.btn'){const t=r.cssText,b=t.slice(t.indexOf('{')+1,t.lastIndexOf('}')).trim();out.push(s+' {'+NL+b.replace(/;$/,'').split('; ').map(x=>'  '+x+';').join(NL)+NL+'}')}}
      else if(r.type===7)kfs.push(r)}}
  const T=' '+out.join(' ').replace(/[:;,{}()]/g,' ')+' ';
  kfs.forEach(k=>{if(T.includes(' '+k.name+' '))out.push('@keyframes '+k.name+' {'+NL+[...k.cssRules].map(x=>'  '+x.keyText+' { '+x.style.cssText.trim()+' }').join(NL)+NL+'}')});
  if(out.join('').includes('var(--a)'))out.push('@property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }');
  return out.join(NL+NL)}
export function htmlFor(b,mode){const c=b.cloneNode(true);c.classList.remove('on','hov');c.removeAttribute('style');c.removeAttribute('data-fa');
  return ['<body data-cursor="'+mode+'">','','<div id="dot"></div>','<div id="ring"></div>',CANV.has(mode)?'<canvas id="fx"></canvas>':null,mode==='spotlight'?'<div id="spot"></div>':null,'','<!-- button -->',c.outerHTML,'','</body>'].filter(x=>x!==null).join(NL)}
export function jsFor(mode,SP){const j=['const dot=document.getElementById("dot"),ring=document.getElementById("ring");','let x=0,y=0,rx=0,ry=0;','addEventListener("pointermove",e=>{','  x=e.clientX;y=e.clientY;','  dot.style.transform=`translate(${x}px,${y}px)`;','  document.body.classList.add("seen");','});','(function loop(){','  rx+=(x-rx)*.2;ry+=(y-ry)*.2;','  ring.style.transform=`translate(${rx}px,${ry}px)`;','  requestAnimationFrame(loop);','})();'];
  if(CANV.has(mode)){j.push('','// canvas effect: the particle/trail drawing lives in this page source (see extras() and loop())');if((SP||{})[mode])j.push('// spawner:','const spawn = '+(SP||{})[mode].toString()+';')}
  if(mode==='rocket'||mode==='arrow')j.push('','// set --rot (deg) from the movement angle: ring.style.setProperty("--rot", deg+45+"deg")');
  return j.join(NL)}
