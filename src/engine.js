export function initEngine(){
const rnd=(a,b)=>a+Math.random()*(b-a),$=s=>document.querySelector(s);
const dot=$('#dot'),ring=$('#ring'),cv=$('#fx'),ctx=cv.getContext('2d'),spot=$('#spot');
const ac=new AbortController();let raf;
const L=(t,f,o={},tg=window)=>tg.addEventListener(t,f,{...o,signal:ac.signal});
const LD=(t,f,o={})=>L(t,f,o,document.documentElement);
let W,H,mode='ring',seen=false,ang=0,sa=0;
const m={x:-100,y:-100},r={x:-100,y:-100},pts=[],parts=[];
function size(){const d=devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
L('resize',size);size();

function setMode(k){mode=k;document.body.dataset.cursor=k;document.body.classList.toggle('native',k==='default');pts.length=0;parts.length=0;if(k==='confetti')burst(m.x,m.y)}
function add(o,d){o.l=1;o.d=d;if(parts.length>450)parts.shift();parts.push(o)}
function burst(x,y){for(let i=0;i<42;i++){const a=rnd(0,6.283),s=rnd(3,9);add({k:'c',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,h:rnd(0,360),s:rnd(7,13),a:rnd(0,6),va:rnd(-.3,.3)},.011)}}
L('scroll',()=>{if(seen)hover(document.elementFromPoint(m.x,m.y))},{passive:true});
const TRAIL=new Set(['comet','neon','ribbon','lightning','plexus']),chain=Array.from({length:18},()=>({x:-100,y:-100}));
let dist=0;
const SP={
  fire:()=>add({k:'S',x:m.x+rnd(-5,5),y:m.y,vx:rnd(-.6,.6),vy:rnd(-3,-1),g:-.02,h:rnd(5,50),s:rnd(5,10)},.03),
  snow:()=>add({k:'S',x:m.x+rnd(-12,12),y:m.y,vx:rnd(-.5,.5),vy:rnd(.5,1.5),g:0,c:'#7dd3fc',s:rnd(2,4)},.007),
  smoke:()=>add({k:'S',x:m.x+rnd(-6,6),y:m.y,vx:rnd(-.3,.3),vy:rnd(-.9,-.3),g:0,c:'#64748b',al:.3,gr:1,s:rnd(8,16)},.012),
  matrix:()=>add({k:'t',x:m.x+rnd(-14,14),y:m.y,vy:rnd(1.5,3),ch:'01ABCDEF<>/{}'[rnd(0,13)|0]},.016),
  squares:()=>add({k:'q',x:m.x,y:m.y,a:rnd(0,3),va:rnd(-.1,.1),s:rnd(14,26),h:(performance.now()/6)%360},.03)
};
function spawn(dx,dy,first){
  if(first){chain.forEach(c=>{c.x=m.x;c.y=m.y});dist=0;return}
  const f=SP[mode];if(f){f();f()}
  dist+=Math.hypot(dx,dy);
  if(mode==='waves'&&dist>30){dist=0;add({k:'r',x:m.x,y:m.y,s:0,c:`hsl(${(performance.now()/5)%360},90%,60%)`},.03)}
}
function tilt(x,y){if(!hovBtn)return;const b=hovBtn.getBoundingClientRect();hovBtn.style.setProperty('--mx',(x-b.left-b.width/2)*.12+'px');hovBtn.style.setProperty('--my',(y-b.top-b.height/2)*.12+'px')}
function extras(t){
  if(mode==='ribbon'||mode==='lightning'||mode==='plexus'){
    const life=mode==='plexus'?1400:500;
    while(pts.length&&t-pts[0].t>life)pts.shift();
    if(mode==='plexus'){
      ctx.fillStyle=ctx.strokeStyle='#6366f1';ctx.lineWidth=1;
      for(let i=0;i<pts.length;i++){const a=pts[i],f=1-(t-a.t)/life;
        ctx.globalAlpha=f;ctx.beginPath();ctx.arc(a.x,a.y,2.5,0,7);ctx.fill();
        for(let j=i+1;j<pts.length;j++){const b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<90){ctx.globalAlpha=f*(1-d/90);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}}
    }else{
      const L=mode==='lightning',j=L?9:0;ctx.lineCap='round';
      for(let i=1;i<pts.length;i++){const p=pts[i],q=pts[i-1],a=1-(t-p.t)/life;
        ctx.globalAlpha=a;ctx.lineWidth=L?2.5:a*16;ctx.strokeStyle=L?'#0ea5e9':`hsl(${230+a*100},95%,65%)`;
        ctx.shadowBlur=L?14:0;ctx.shadowColor='#38bdf8';
        ctx.beginPath();ctx.moveTo(q.x+rnd(-j,j),q.y+rnd(-j,j));ctx.lineTo(p.x+rnd(-j,j),p.y+rnd(-j,j));ctx.stroke()}
      ctx.shadowBlur=0;
    }
  }else if(mode==='snake'){
    let px=m.x,py=m.y;
    chain.forEach(c=>{c.x+=(px-c.x)*.45;c.y+=(py-c.y)*.45;px=c.x;py=c.y});
    for(let i=chain.length-1;i>=0;i--){const c=chain[i];ctx.fillStyle=`hsl(${150+i*5},85%,${58-i}%)`;ctx.beginPath();ctx.arc(c.x,c.y,10-i*.45,0,7);ctx.fill()}
  }else if(mode==='rubber'){
    ctx.strokeStyle='#f472b6';ctx.lineCap='round';ctx.lineWidth=Math.max(1,7-Math.hypot(m.x-r.x,m.y-r.y)/18);
    ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(r.x,r.y);ctx.stroke();
  }else if(mode==='dotgrid'){
    ctx.fillStyle='#8b5cf6';
    for(let x=17;x<W;x+=34)for(let y=17;y<H;y+=34){const k=Math.max(0,1-Math.hypot(x-r.x,y-r.y)/170);ctx.globalAlpha=.25+k*.75;ctx.beginPath();ctx.arc(x,y,1.5+k*6,0,7);ctx.fill()}
  }
  ctx.globalAlpha=1;
}
let hovBtn=null;
function hover(el){const b=el&&el.closest?el.closest('.btn'):null;if(b===hovBtn)return;if(hovBtn){hovBtn.classList.remove('hov');hovBtn.style.removeProperty('--mx');hovBtn.style.removeProperty('--my')}hovBtn=b;if(b)b.classList.add('hov')}
function move(x,y,first){
  const dx=x-m.x,dy=y-m.y;m.x=x;m.y=y;
  if(first)pts.length=0;
  if(!seen||first){seen=true;r.x=m.x;r.y=m.y;document.body.classList.add('seen')}
  hover(document.elementFromPoint(x,y));
  dot.style.transform=`translate(${m.x}px,${m.y}px)`;
  spot.style.setProperty('--x',m.x+'px');spot.style.setProperty('--y',m.y+'px');
  if(!first&&Math.hypot(dx,dy)>2)ang=Math.atan2(dy,dx);
  if(TRAIL.has(mode))pts.push({x:m.x,y:m.y,t:performance.now()});
  if(mode==='sparkle')for(let i=0;i<2;i++)add({k:'s',x:m.x,y:m.y,vx:rnd(-1,1),vy:rnd(-1,.6),h:rnd(30,60),s:rnd(2,5)},.02);
  if(mode==='bubbles'&&Math.random()<.5)add({k:'b',x:m.x+rnd(-8,8),y:m.y,vx:rnd(-.3,.3),vy:rnd(-1.4,-.5),s:rnd(4,14)},.007);
  spawn(dx,dy,first);
  tilt(x,y);
}
L('pointermove',e=>{if(e.pointerType!=='touch')move(e.clientX,e.clientY)});
L('touchstart',e=>{const t=e.touches[0];move(t.clientX,t.clientY,true);ring.classList.add('down');add({k:'r',x:t.clientX,y:t.clientY,s:0},.04);if(mode==='confetti')burst(t.clientX,t.clientY)},{passive:true});
L('touchmove',e=>{const t=e.touches[0];move(t.clientX,t.clientY)},{passive:true});
function touchEnd(){ring.classList.remove('down');seen=false;document.body.classList.remove('seen');setTimeout(()=>{if(!seen)hover(null)},250)}
L('touchend',touchEnd);L('touchcancel',touchEnd);
LD('pointerleave',e=>{if(e.pointerType==='touch')return;seen=false;document.body.classList.remove('seen');hover(null)});
L('pointerdown',e=>{if(e.pointerType==='touch')return;ring.classList.add('down');add({k:'r',x:e.clientX,y:e.clientY,s:0},.04);if(mode==='confetti')burst(e.clientX,e.clientY)});
L('pointerup',()=>ring.classList.remove('down'));

function loop(t){
  r.x+=(m.x-r.x)*.2;r.y+=(m.y-r.y)*.2;
  ring.style.transform=mode==='pixel'?`translate(${Math.round(r.x/18)*18}px,${Math.round(r.y/18)*18}px)`:`translate(${r.x}px,${r.y}px)`;
  const dd=((ang-sa+Math.PI*3)%(Math.PI*2))-Math.PI;sa+=dd*.2;
  ring.style.setProperty('--rot',(sa*180/Math.PI+45)+'deg');
  ctx.clearRect(0,0,W,H);extras(t);

  if(mode==='comet'||mode==='neon'){
    const life=mode==='neon'?600:450;
    while(pts.length&&t-pts[0].t>life)pts.shift();
    if(mode==='comet')pts.forEach(p=>{const a=1-(t-p.t)/life;ctx.globalAlpha=a;ctx.fillStyle=`hsl(${190+a*60},100%,65%)`;ctx.beginPath();ctx.arc(p.x,p.y,a*9,0,7);ctx.fill()});
    else{ctx.lineCap=ctx.lineJoin='round';for(let i=1;i<pts.length;i++){const a=1-(t-pts[i].t)/life;ctx.globalAlpha=a;ctx.strokeStyle=`hsl(${(t/4+i*6)%360},100%,60%)`;ctx.lineWidth=a*8+1;ctx.shadowBlur=18;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(pts[i-1].x,pts[i-1].y);ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke()}ctx.shadowBlur=0}
  }

  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.l-=p.d;
    if(p.l<=0){parts.splice(i,1);continue}
    ctx.globalAlpha=Math.min(1,p.l*1.5);
    if(p.k==='S'){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;ctx.globalAlpha*=p.al||1;ctx.fillStyle=p.c||`hsl(${p.h},100%,60%)`;ctx.beginPath();ctx.arc(p.x,p.y,p.gr?p.s*(2-p.l):p.s*p.l,0,7);ctx.fill()}
    else if(p.k==='t'){p.y+=p.vy;ctx.fillStyle='#16a34a';ctx.font='700 14px monospace';ctx.textAlign='center';ctx.fillText(p.ch,p.x,p.y)}
    else if(p.k==='q'){p.a+=p.va;const z=p.s*p.l;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.strokeStyle=`hsl(${p.h},90%,60%)`;ctx.lineWidth=2;ctx.strokeRect(-z/2,-z/2,z,z);ctx.restore()}
    else if(p.k==='s'){p.x+=p.vx;p.y+=p.vy;p.vy+=.05;ctx.fillStyle=`hsl(${p.h},100%,65%)`;ctx.shadowBlur=12;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,p.s*p.l,0,7);ctx.fill();ctx.shadowBlur=0}
    else if(p.k==='b'){p.x+=p.vx+Math.sin(p.y/18)*.4;p.y+=p.vy;ctx.strokeStyle='rgba(125,211,252,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(p.x-p.s*.35,p.y-p.s*.35,p.s*.18,0,7);ctx.fill()}
    else if(p.k==='r'){p.s+=3.2;ctx.strokeStyle=p.c||'#a78bfa';ctx.lineWidth=3*p.l;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.stroke()}
    else{p.vy+=.18;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=`hsl(${p.h},90%,60%)`;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore()}
  }
  ctx.globalAlpha=1;
  raf=requestAnimationFrame(loop);
}
raf=requestAnimationFrame(loop);
return{setMode,SP,destroy(){cancelAnimationFrame(raf);ac.abort();document.body.classList.remove('seen')}}
}
