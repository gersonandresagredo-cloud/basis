/* BASIS · Prestamistas v2 — theme-aware particle field, count-ups, isotipo, video */
(()=>{
const W=960,H=540,K=2;
const stage=document.querySelector('deck-stage');
const secs=[...stage.querySelectorAll(':scope > section')];
const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.className='fx';
const ctx=cv.getContext('2d');
const spot=document.createElement('div');spot.className='spot';

const BR=[[6,92,39,36],[50,92,43,36],[6,51,24,36],[35,51,52,36],[92,51,42,36],[6,10,39,36],[50,10,39,36],[94,10,40,36]];
document.querySelectorAll('[data-iso]').forEach(el=>{
  const dark=el.closest('section.dark')||el.hasAttribute('data-light');
  const fill=el.hasAttribute('data-mono')?(dark?'#5a5a5a':'#B9BDBA'):(dark?'#fff':'#0A0A0A');
  el.innerHTML=`<svg viewBox="0 0 140 140" style="width:100%;height:100%;display:block">${BR.map((b,i)=>`<rect class="brk" style="--i:${i}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" rx="7" fill="${fill}"/>`).join('')}<rect class="brk" style="--i:8" x="98" y="92" width="36" height="36" rx="7" fill="#3DBE74"/></svg>`;
});

const grp=s=>s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function fmt(v,dec,thou){let [i,d]=v.toFixed(dec).split('.');if(thou)i=grp(i);return d?i+','+d:i;}
function countUp(el){
  const fin=el.dataset.final||(el.dataset.final=el.textContent);
  const toks=[];fin.replace(/\d(?:[\d.,]*\d)?/g,(m,off)=>{toks.push({m,off,dec:m.includes(',')?m.split(',')[1].length:0,thou:/\.\d{3}/.test(m),v:parseFloat(m.replace(/\./g,'').replace(',','.'))});return m;});
  if(!toks.length)return;
  const dur=+(el.dataset.dur||1200),st=performance.now()+(+(el.dataset.delay||0));
  cancelAnimationFrame(el._raf);
  const tick=now=>{const p=Math.min(1,Math.max(0,(now-st)/dur));
    if(p>=1){el.textContent=fin;return;}
    const e=1-Math.pow(1-p,4);let out='',last=0;
    toks.forEach(t=>{out+=fin.slice(last,t.off)+fmt(t.v*e,t.dec,t.thou);last=t.off+t.m.length;});
    el.textContent=out+fin.slice(last);el._raf=requestAnimationFrame(tick);};
  el._raf=requestAnimationFrame(tick);
}

const rnd=(a,b)=>a+Math.random()*(b-a);
const P=[];for(let i=0;i<46;i++)P.push({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.25,.25),vy:rnd(-.25,.25),r:rnd(.7,1.5)});
let B=[];const mouse={x:-999,y:-999};let active=null,mode='',dark=false;
document.addEventListener('mousemove',e=>{if(!active)return;const r=active.getBoundingClientRect();
  const sx=(e.clientX-r.left)/r.width,sy=(e.clientY-r.top)/r.height;mouse.x=sx*W;mouse.y=sy*H;
  spot.style.transform=`translate3d(${sx*1920-400}px,${sy*1080-400}px,0)`;});
function activate(s){
  if(active&&active!==s){const v=active.querySelector('video');if(v)v.pause();}
  active=s;mode=s.dataset.fx||'';dark=s.classList.contains('dark');
  if(!s.hasAttribute('data-nofx')){s.prepend(cv);s.prepend(spot);}else{cv.remove();spot.remove();}
  if(mode.includes('burst')){const cx=(+(s.dataset.bx||960))/K,cy=(+(s.dataset.by||540))/K;
    for(let i=0;i<90;i++){const a=rnd(0,6.283),v=rnd(1,6);B.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,r:rnd(.6,1.6)});}}
  s.querySelectorAll('.count').forEach(countUp);
  const v=s.querySelector('video');
  if(v){try{v.currentTime=0;}catch(e){}v.muted=false;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{});});}
}
stage.addEventListener('slidechange',e=>{const s=e.detail.slide||secs[e.detail.index];if(s){try{activate(s);}catch(err){active=s;}}});

const D2=80*80;let skip=false;
function frame(){
  skip=!skip;if(skip){requestAnimationFrame(frame);return;}
  const s=stage.querySelector(':scope > section[data-deck-active]');
  if(s&&s!==active){try{activate(s);}catch(e){active=s;}}
  if(active&&cv.isConnected){
    ctx.clearRect(0,0,W,H);
    const orbit=mode.includes('orbit'),flow=mode.includes('flow');
    const cx=(+(active.dataset.bx||960))/K,cy=(+(active.dataset.by||540))/K,R=(+(active.dataset.r||430))/K;
    for(const p of P){
      if(orbit){const dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy)||1;p.vx+=(-dy/d)*.018+(dx/d)*(R-d)*.0004;p.vy+=(dx/d)*.018+(dy/d)*(R-d)*.0004;}
      if(flow)p.vx+=(.6-p.vx)*.01;
      const mx=p.x-mouse.x,my=p.y-mouse.y,md=mx*mx+my*my;
      if(md<6400){const m=Math.sqrt(md)||1;p.vx+=mx/m*.12;p.vy+=my/m*.12;}
      const sp=Math.hypot(p.vx,p.vy),max=orbit?1.2:.8;
      if(sp>max){p.vx*=max/sp;p.vy*=max/sp;}
      if(sp<.08){p.vx+=rnd(-.1,.1);p.vy+=rnd(-.1,.1);}
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<-10)p.x=W+10;else if(p.x>W+10)p.x=-10;if(p.y<-10)p.y=H+10;else if(p.y>H+10)p.y=-10;
    }
    ctx.lineWidth=.6;ctx.strokeStyle=dark?'rgba(61,190,116,.16)':'rgba(42,157,91,.13)';ctx.beginPath();
    for(let i=0;i<P.length;i++){const a=P[i];for(let j=i+1;j<P.length;j++){const b=P[j];const dx=a.x-b.x,dy=a.y-b.y;if(dx*dx+dy*dy<D2){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}}}
    ctx.stroke();
    ctx.strokeStyle=dark?'rgba(107,226,154,.28)':'rgba(42,157,91,.25)';ctx.beginPath();
    for(const a of P){const dx=a.x-mouse.x,dy=a.y-mouse.y;if(dx*dx+dy*dy<12000){ctx.moveTo(a.x,a.y);ctx.lineTo(mouse.x,mouse.y);}}
    ctx.stroke();
    ctx.fillStyle=dark?'rgba(140,236,178,.8)':'rgba(42,157,91,.55)';ctx.beginPath();
    for(const p of P){ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,6.283);}
    ctx.fill();
    if(B.length){B=B.filter(b=>b.life>0);ctx.beginPath();
      for(const b of B){b.x+=b.vx;b.y+=b.vy;b.vx*=.96;b.vy*=.96;b.life-=.014;ctx.moveTo(b.x+b.r,b.y);ctx.arc(b.x,b.y,b.r,0,6.283);}
      ctx.fillStyle=dark?'rgba(107,226,154,.7)':'rgba(61,190,116,.65)';ctx.fill();}
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
