/* =====================================================================
   ส่วนที่ 1: SORTING ENGINE  (หัวใจของเกม)
   ฟังก์ชันเหล่านี้เป็นอัลกอริทึมจริง ใช้ทั้ง "ตรวจคำตอบ / คำใบ้ / สร้างโจทย์ / บอทคู่แข่ง"
   ===================================================================== */

/* ---------- BUBBLE SORT ----------
   แนวคิด: เทียบ "คู่ติดกัน" จากซ้ายไปขวา ถ้าซ้าย > ขวา ให้สลับ
   หนึ่งรอบ (pass) ตัวมากสุดของส่วนที่เหลือจะ "ลอย" ไปท้ายแถว
   ถ้ารอบไหนไม่มีการสลับเลย แปลว่าเรียงเสร็จ (early exit)
   คืนค่าเป็นลิสต์ของ "ขั้นตอน" {i, j, swap} เพื่อให้บอทเล่นทีละ step และใช้ทำคำใบ้ได้ */
function bubbleSortSteps(input){
  const a=[...input], n=a.length, steps=[];
  for(let pass=0; pass<n-1; pass++){
    let swapped=false;
    for(let i=0; i<n-1-pass; i++){          // ส่วนท้ายที่เรียงแล้ว (pass ตัว) ไม่ต้องเทียบอีก
      const doSwap = a[i] > a[i+1];          // เทียบคู่ติดกัน
      steps.push({i, j:i+1, swap:doSwap});
      if(doSwap){ [a[i],a[i+1]]=[a[i+1],a[i]]; swapped=true; }
    }
    if(!swapped) break;                      // early exit
  }
  return steps;
}
// ทำ Bubble Sort เพียง k รอบ แล้วคืนสถานะของแถว (ใช้ในด่านนักสืบ)
function bubblePasses(input,k){
  const a=[...input];
  for(let p=0;p<k;p++)
    for(let i=0;i<a.length-1-p;i++)
      if(a[i]>a[i+1]) [a[i],a[i+1]]=[a[i+1],a[i]];
  return a;
}

/* ---------- SELECTION SORT ----------
   แนวคิด: รอบที่ p → หาตัว "เล็กที่สุด" ในช่วง [p..n-1] แล้วสลับมาไว้ช่อง p
   สลับไม่เกิน n-1 ครั้ง (น้อยที่สุดในกลุ่ม O(n²)) แต่ต้องเทียบเยอะเสมอ */
function selectionPasses(input,k){
  const a=[...input];
  for(let p=0;p<k;p++){
    let m=p;                                      // m = ตำแหน่งตัวเล็กสุดที่เจอ
    for(let j=p+1;j<a.length;j++) if(a[j]<a[m]) m=j;
    [a[p],a[m]]=[a[m],a[p]];                      // สลับมาไว้หน้า
  }
  return a;
}
// คำใบ้ Selection: จาก "สถานะปัจจุบัน" ถัดไปต้องสลับตำแหน่งไหน
function selectionNextSwap(a){
  for(let p=0;p<a.length;p++){
    let m=p;
    for(let j=p+1;j<a.length;j++) if(a[j]<a[m]) m=j;
    if(m!==p) return [p,m];                       // เจอช่องแรกที่ยังไม่ใช่ตัวเล็กสุด
  }
  return null;
}

/* ---------- INSERTION SORT ----------
   แนวคิด: ส่วนซ้ายเรียงแล้ว หยิบตัวถัดไป (key) มาเทียบจาก "ขวาไปซ้าย"
   ตัวที่ใหญ่กว่า key ให้ขยับไปขวา 1 ช่อง แล้ววาง key ลงช่องว่าง
   ทำ k รอบ → k+1 ตัวแรกเรียงกันแล้ว ที่เหลือยังไม่ถูกแตะ */
function insertionPasses(input,k){
  const a=[...input];
  for(let i=1;i<=k;i++){
    const key=a[i]; let j=i-1;
    while(j>=0 && a[j]>key){ a[j+1]=a[j]; j--; }  // ขยับตัวที่ใหญ่กว่าไปขวา
    a[j+1]=key;                                   // วาง key ในตำแหน่งที่ถูก
  }
  return a;
}
// ตำแหน่งแทรกที่ถูกต้อง = จำนวนตัวในถาดที่น้อยกว่า key (ใช้ตรวจคำตอบด่าน Insertion)
function insertionPosition(sortedPart,key){ return sortedPart.filter(x=>x<key).length; }

/* ---------- MERGE (ขั้น "รวม" ของ Merge Sort) ----------
   แนวคิด: มีสองลิสต์ที่เรียงแล้ว เทียบ "หัวแถว" ของสองลิสต์ ตัวที่น้อยกว่าไปก่อน
   ทำซ้ำจนหมด → ได้ลิสต์ใหญ่ที่เรียงแล้ว (O(n)) แล้วรวมต่อเป็นชั้น ๆ ได้ O(n log n)
   ฟังก์ชันนี้บอกว่า "ควรหยิบจาก A หรือ B" ในขั้นนี้ */
function mergeChoice(A,B){ return A < B ? 'A' : 'B'; }

/* ---------- ฟังก์ชันช่วยวิเคราะห์ ---------- */
// นับ inversions = จำนวนคู่ (i<j) ที่ a[i] > a[j]
// เป็นจำนวนการสลับ "คู่ติดกัน" ขั้นต่ำที่จำเป็น (เท่ากับจำนวน swap ที่ Bubble Sort ทำจริง)
function countInversions(a){
  let c=0;
  for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if(a[i]>a[j]) c++;
  return c;
}
// จำนวนการสลับ "สองตำแหน่งไหนก็ได้" ขั้นต่ำ = n - จำนวน cycle ของ permutation
function minSwaps(a){
  const s=[...a].sort((x,y)=>x-y), pos={}; s.forEach((v,i)=>pos[v]=i);
  const seen=Array(a.length).fill(false); let cycles=0;
  for(let i=0;i<a.length;i++) if(!seen[i]){
    cycles++; let j=i;
    while(!seen[j]){ seen[j]=true; j=pos[a[j]]; }
  }
  return a.length-cycles;
}
const isSorted=a=>a.every((x,i)=>i===0||a[i-1]<=x);

/* =====================================================================
   ส่วนที่ 2: ตัวช่วย UI
   ===================================================================== */
const $=s=>document.querySelector(s);
const rnd=n=>Math.floor(Math.random()*n);
const range=(a,b)=>[...Array(b-a)].map((_,i)=>a+i);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function pickDistinct(n,max){return shuffle(range(1,max+1)).slice(0,n);}
const EMO=['🍓','🍰','🧁','🍩','🍮','🍪','🍡','🍨','☕','🍵','🥞','🍙','🍒','🍑','🍫','🥐','🍧','🍬','🧇','🍯'];
const later=(f,ms=550)=>setTimeout(f,ms);
const hearts=(n,max)=>'❤️'.repeat(Math.max(0,n))+'🤍'.repeat(max-Math.max(0,n));
const chip=t=>`<span class="chip">${t}</span>`;
const row=(arr,fn)=>`<div class="row">${arr.map(fn).join('')}</div>`;
function say(t){const e=$('#say');if(e)e.innerHTML=t;}
function shake(){const b=$('#board');if(!b)return;b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');}

// การ์ดขนม: ความสูง = ค่าตัวเลข (เห็นเป็นขั้นบันไดเมื่อเรียงแล้ว)
function cardHTML(v,o={}){
  const mx=o.maxV||9, mini=o.mini;
  const h=(mini?40:50)+Math.round(v/mx*(mini?30:72));
  return `<div class="card${mini?' mini':''} ${o.cls||''}" data-id="${(o.p||'')+v}" ${o.i!==undefined?`data-i="${o.i}"`:''} ${o.attr||''} style="height:${h}px"><span class="em">${EMO[(v-1)%EMO.length]}</span><b>${v}</b></div>`;
}
// FLIP animation: จำตำแหน่งเดิม → render ใหม่ → เลื่อนจากที่เดิมมาที่ใหม่ ให้เห็นการสลับ
function flip(render,anim=true){
  const b=$('#board'),old={};
  if(anim)b.querySelectorAll('[data-id]').forEach(el=>old[el.dataset.id]=el.getBoundingClientRect());
  render();
  if(!anim)return;
  b.querySelectorAll('[data-id]').forEach(el=>{
    const o=old[el.dataset.id];if(!o)return;
    const n=el.getBoundingClientRect(),dx=o.left-n.left,dy=o.top-n.top;
    if(Math.abs(dx)>1||Math.abs(dy)>1){
      el.style.transition='none';el.style.transform=`translate(${dx}px,${dy}px)`;void el.offsetWidth;
      el.style.transition='transform .3s ease, box-shadow .2s';el.style.transform='';
    }
  });
}
function showModal(h){$('#mbox').innerHTML=h;$('#modal').classList.remove('hidden');}
function hideModal(){$('#modal').classList.add('hidden');}

// เลือกการ์ด 2 ใบเพื่อสลับ (mode 'adj' = ต้องติดกัน, 'any' = ที่ไหนก็ได้)
function pick(st,e,mode,doSwap){
  const c=e.target.closest('[data-i]'); if(!c)return;
  const i=+c.dataset.i;
  if(st.sel===-1){st.sel=i;st.hp=null;return st.render();}
  if(st.sel===i){st.sel=-1;return st.render();}
  if(mode==='adj'&&Math.abs(st.sel-i)!==1){say('ถาดนี้สลับได้เฉพาะ "คู่ที่อยู่ติดกัน" นะคะ~ 🥺');st.sel=i;return st.render();}
  const j=st.sel;st.sel=-1;doSwap(j,i);
}

/* =====================================================================
   ส่วนที่ 3: สถานะเกม / หน้าจอ
   ===================================================================== */
var cur=null, curIdx=-1;      // ใช้ var เพื่อให้ onclick="cur.hint()" เข้าถึงได้
const STAGES=[];
const progress={stars:[0,0,0,0,0,0],pts:[0,0,0,0,0,0]};

function updateTop(){
  const s=progress.stars.reduce((a,b)=>a+b,0),p=progress.pts.reduce((a,b)=>a+b,0);
  $('#top').innerHTML=`⭐ ${s}/18 &nbsp; 💖 ${p}`;
}
function frame(){
  $('#screen').innerHTML=`
  <div class="mentor"><div class="avatar">🐰</div><div class="bubble" id="say"></div></div>
  <div class="panel">
    <div class="stagehead"><button class="btn ghost" onclick="showMap()">◀ แผนที่</button>
      <h2>${cur.icon} ด่าน ${curIdx+1}: ${cur.name}</h2>
      <button class="btn ghost" onclick="showTut()">❓ คู่มือ</button></div>
    <div class="chips" id="info"></div>
    <div class="board" id="board"></div>
    <div class="ctrl" id="ctrl"></div>
  </div>`;
  $('#board').onclick=e=>cur.click&&cur.click(e);
}
function openStage(i,tut=true){
  if(cur&&cur.stop)cur.stop();
  hideModal();curIdx=i;cur=STAGES[i];frame();cur.init();
  if(tut)showTut();
}
function showTut(){
  showModal(`<h2>${cur.icon} ${cur.algo}</h2>${cur.tut}<div class="mbtns"><button class="btn" onclick="hideModal()">เข้าใจแล้ว เริ่มเลย! ✨</button></div>`);
}
function retry(){openStage(curIdx,false);}
function nextStage(){ if(curIdx>=STAGES.length-1)showFinal(); else openStage(curIdx+1); }

function showTitle(){
  $('#screen').innerHTML=`<div class="panel title">
    <div class="hero">🎀☕🍰</div><h1>Moe Moe Café Sort</h1>
    <p>คุณคือ <b>เมดน้องใหม่</b> ของคาเฟ่สุดป่วน!<br>ออเดอร์ ลูกค้า และถาดขนมยุ่งเหยิงไปหมด<br>
    ใช้ <b>Sorting Algorithm</b> จัดระเบียบให้ทัน แล้วเป็น <b>หัวหน้าเมด</b> ให้ได้นะคะ~ 🐰</p>
    <button class="btn big" onclick="showMap()">▶ เริ่มทำงานกะแรก</button></div>`;
}
function showMap(){
  if(cur&&cur.stop)cur.stop();
  hideModal();cur=null;
  $('#screen').innerHTML=`
  <div class="mentor"><div class="avatar">🐰</div><div class="bubble">เลือกกะงานได้เลยค่ะ! แนะนำให้เล่นตามลำดับ 1 → 6 นะคะ แต่ละกะจะสอน algorithm ใหม่ ✨</div></div>
  <div class="panel"><div class="map">${STAGES.map((s,i)=>`
    <div class="stg" onclick="openStage(${i})"><div class="ic">${s.icon}</div><h3>ด่าน ${i+1}: ${s.name}</h3>
    <small>${s.algo}</small><div>${'⭐'.repeat(progress.stars[i])}${'☆'.repeat(3-progress.stars[i])}</div></div>`).join('')}</div>
    <div class="ctrl"><button class="btn ghost" onclick="showCheat()">📖 สมุดจดของเมด</button><button class="btn ghost" onclick="showFinal()">🏆 สรุปคะแนน</button></div></div>`;
  updateTop();
}
function showCheat(){
  showModal(`<h2>📖 สมุดจดของเมด</h2><table>
  <tr><th>Algorithm</th><th>หลักการ</th><th>จุดเด่น</th></tr>
  <tr><td>Bubble</td><td>เทียบ-สลับคู่ติดกัน ตัวใหญ่ลอยไปท้าย</td><td>เข้าใจง่าย O(n²) สลับเยอะ</td></tr>
  <tr><td>Selection</td><td>หาตัวเล็กสุด สลับไปไว้หน้า</td><td>สลับ ≤ n−1 ครั้ง แต่เทียบเยอะเสมอ</td></tr>
  <tr><td>Insertion</td><td>หยิบทีละตัวแทรกในส่วนที่เรียงแล้ว</td><td>เร็วมากถ้าข้อมูลเกือบเรียง O(n)</td></tr>
  <tr><td>Merge</td><td>แบ่งครึ่ง เรียง แล้ว merge หัวแถว</td><td>O(n log n) เสถียร</td></tr></table>
  <div class="mbtns"><button class="btn" onclick="hideModal()">ปิด</button></div>`);
}
function showFinal(){
  const s=progress.stars.reduce((a,b)=>a+b,0),p=progress.pts.reduce((a,b)=>a+b,0);
  const rank=s>=16?'👑 หัวหน้าเมด Sorting Master':s>=12?'🌸 เมดมือทอง':s>=7?'🍰 เมดฝึกหัดฝีมือดี':'🥺 เมดน้องใหม่ (สู้ ๆ นะคะ)';
  showModal(`<h2>🏆 สรุปผลการทำงาน</h2><div class="stars">${s} / 18 ⭐</div>
  <p style="text-align:center">คะแนนรวม <b>${p}</b><br>ตำแหน่ง: <b>${rank}</b></p>
  <div class="mbtns"><button class="btn" onclick="showMap()">🗺️ กลับแผนที่</button></div>`);
}
// ชนะด่าน: คำนวณดาวและคะแนน (ใช้คำใบ้แล้วลด 1 ดาว)
function win(stars,detail){
  const hints=cur.hints||0;
  if(hints>0)stars=Math.max(1,stars-1);
  const pts=Math.max(10,stars*100-hints*20);
  progress.stars[curIdx]=Math.max(progress.stars[curIdx],stars);
  progress.pts[curIdx]=Math.max(progress.pts[curIdx],pts);
  updateTop();
  const last=curIdx===STAGES.length-1;
  showModal(`<h2>🎉 ผ่านด่านแล้วค่ะ!</h2><div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
  <p style="text-align:center">+${pts} คะแนน${hints?` (ใช้คำใบ้ ${hints} ครั้ง → ลด 1 ดาว)`:''}</p>
  <div class="explain okk">${detail}</div>
  <div class="mbtns"><button class="btn ghost" onclick="retry()">🔄 เล่นอีกครั้ง</button>
  <button class="btn" onclick="nextStage()">${last?'🏆 ดูสรุปผล':'➡️ ด่านต่อไป'}</button></div>`);
}
function lose(msg){
  showModal(`<h2>😿 เสียใจด้วยค่ะ</h2><div class="explain bad">${msg}</div>
  <div class="mbtns"><button class="btn" onclick="retry()">🔄 ลองใหม่</button><button class="btn ghost" onclick="showMap()">◀ แผนที่</button></div>`);
}

/* =====================================================================
   ส่วนที่ 4: ด่านทั้ง 6
   ===================================================================== */

/* ---------- ด่าน 1: BUBBLE — สลับได้เฉพาะคู่ติดกัน ---------- */
STAGES.push({
  name:'ถาดเสิร์ฟสลับคู่', algo:'Bubble Sort', icon:'🫧',
  tut:`<p>ถาดเสิร์ฟแคบมาก! <b>สลับได้เฉพาะขนมที่อยู่ติดกัน</b> เท่านั้น และมีจำนวนครั้งจำกัด</p>
  <p><b>Bubble Sort</b> ทำแบบนี้: สแกนจากซ้ายไปขวา เจอคู่ที่ "ซ้าย &gt; ขวา" ก็สลับ ตัวใหญ่ ๆ จะ "ลอย" ไปท้ายแถวเหมือนฟองสบู่</p>
<pre>ทำซ้ำจนไม่มีการสลับ:
  for i = 0 .. n-2:
    if a[i] > a[i+1]: swap(a[i], a[i+1])</pre>
  <p>🎮 กดการ์ดใบแรก แล้วกดการ์ดข้างเคียงเพื่อสลับ เรียง <b>น้อย → มาก</b> ให้ได้ภายในจำนวนครั้งที่กำหนด<br>💡 ความลับ: จำนวนสลับขั้นต่ำ = จำนวน "คู่ที่เรียงผิด" (inversions)</p>`,
  init(){
    do{this.start=shuffle(pickDistinct(6,9));this.par=countInversions(this.start);}while(this.par<7||this.par>11);
    this.hints=0;this.reset();
  },
  reset(){
    this.a=[...this.start];this.moves=0;this.sel=-1;this.hp=null;this.limit=this.par+4;this.render();
    say('ถาดเสิร์ฟคับแคบ สลับได้แค่ข้างกันนะคะ! ลองคิดแบบ Bubble Sort: เทียบคู่ติดกันจากซ้ายไปขวา 🫧');
  },
  render(){
    $('#info').innerHTML=chip(`🔁 สลับแล้ว <b>${this.moves}</b> / ${this.limit}`)+chip(`⭐⭐⭐ ต้องสลับ ≤ ${this.par}`)+chip(`💡 ใช้คำใบ้ ${this.hints}`);
    flip(()=>{$('#board').innerHTML=`<div class="lbl">ถาดเสิร์ฟ — เรียงน้อย → มาก (ซ้าย → ขวา)</div>`+
      row(this.a,(v,i)=>cardHTML(v,{i,cls:(this.sel===i?'sel ':'')+(this.hp&&this.hp.includes(i)?'hint':'')}));});
    $('#ctrl').innerHTML=`<button class="btn" onclick="cur.hint()">💡 คำใบ้ (−20)</button><button class="btn ghost" onclick="cur.reset()">↩️ เริ่มใหม่</button>`;
  },
  click(e){pick(this,e,'adj',(j,i)=>{
    [this.a[j],this.a[i]]=[this.a[i],this.a[j]];this.moves++;this.hp=null;this.render();
    if(isSorted(this.a)){
      const st=this.moves<=this.par?3:this.moves<=this.par+2?2:1;
      later(()=>win(st,`Bubble Sort ต้องสลับคู่ติดกันอย่างน้อย = จำนวน inversions = <b>${this.par}</b> ครั้ง คุณใช้ <b>${this.moves}</b> ครั้ง`));
    } else if(this.moves>=this.limit) later(()=>lose(`หมดจำนวนครั้งสลับแล้ว! ชุดนี้ต้องสลับขั้นต่ำ ${this.par} ครั้ง (นับ inversions) ลองสแกนซ้าย→ขวาแบบ Bubble Sort ดูนะคะ`));
  });},
  hint(){
    const s=bubbleSortSteps(this.a).find(s=>s.swap); if(!s)return;   // ใช้ Bubble Sort จริงหา step ถัดไป
    this.hints++;this.hp=[s.i,s.j];this.render();
    say(`Bubble Sort สแกนจากซ้าย เจอคู่แรกที่ "ซ้าย &gt; ขวา" คือ <b>${this.a[s.i]}</b> กับ <b>${this.a[s.j]}</b> → สลับเลย! 🫧`);
  }
});

/* ---------- ด่าน 2: SELECTION — สลับได้ไม่เกิน n−1 ---------- */
STAGES.push({
  name:'ชั้นวางเค้กสุดแน่น', algo:'Selection Sort', icon:'🎯',
  tut:`<p>ชั้นวางนี้ <b>สลับได้สองช่องไหนก็ได้</b> แต่ทำได้แค่ <b>6 ครั้ง</b> (n−1) เท่านั้น!</p>
  <p><b>Selection Sort</b>: รอบที่ 1 หาตัว <b>เล็กที่สุด</b> ทั้งแถว สลับไปไว้ช่องแรก, รอบที่ 2 หาตัวเล็กสุดของที่เหลือ สลับไปช่องสอง ... ทำแบบนี้ สลับไม่เกิน n−1 ครั้งแน่นอน</p>
<pre>for p = 0 .. n-2:
  m = index ของตัวเล็กสุดใน a[p..n-1]
  swap(a[p], a[m])</pre>
  <p>🎮 กดการ์ดสองใบเพื่อสลับ (สีเขียว = จัดเข้าที่แล้ว)</p>`,
  init(){
    do{this.start=shuffle(pickDistinct(7,9));}while(minSwaps(this.start)<5);
    this.min=minSwaps(this.start);this.limit=6;this.hints=0;this.reset();
  },
  reset(){
    this.a=[...this.start];this.moves=0;this.sel=-1;this.hp=null;this.render();
    say('ชั้นวางนี้สลับช่องไหนก็ได้ แต่ทำได้แค่ 6 ครั้ง! คิดแบบ Selection Sort: "หาตัวเล็กสุด แล้วสลับไปไว้หน้าสุด" 🎯');
  },
  render(){
    const s=[...this.a].sort((x,y)=>x-y);let L=0;while(L<this.a.length&&this.a[L]===s[L])L++;   // ส่วนหน้าที่เข้าที่แล้ว
    $('#info').innerHTML=chip(`🔁 สลับแล้ว <b>${this.moves}</b> / ${this.limit}`)+chip(`⭐⭐⭐ สลับ ≤ ${this.min}`)+chip(`💡 ใช้คำใบ้ ${this.hints}`);
    flip(()=>{$('#board').innerHTML=`<div class="lbl">ชั้นวางเค้ก — เรียงน้อย → มาก</div>`+
      row(this.a,(v,i)=>cardHTML(v,{i,cls:(i<L?'lock ':'')+(this.sel===i?'sel ':'')+(this.hp&&this.hp.includes(i)?'hint':'')}));});
    $('#ctrl').innerHTML=`<button class="btn" onclick="cur.hint()">💡 คำใบ้ (−20)</button><button class="btn ghost" onclick="cur.reset()">↩️ เริ่มใหม่</button>`;
  },
  click(e){pick(this,e,'any',(j,i)=>{
    [this.a[j],this.a[i]]=[this.a[i],this.a[j]];this.moves++;this.hp=null;this.render();
    if(isSorted(this.a)){
      later(()=>win(this.moves<=this.min?3:2,`Selection Sort สลับ <b>ไม่เกิน n−1 = 6</b> ครั้งเสมอ ชุดนี้สลับน้อยสุดได้ <b>${this.min}</b> ครั้ง คุณใช้ <b>${this.moves}</b> ครั้ง`));
    } else if(this.moves>=this.limit) later(()=>lose('ใช้ครบ 6 ครั้งแล้วแต่ยังไม่เรียง! ทุกครั้งที่สลับ ต้องวาง "ตัวเล็กสุดของส่วนที่เหลือ" ลงช่องที่ถูกต้องให้ได้ 1 ตัวนะคะ'));
  });},
  hint(){
    const p=selectionNextSwap(this.a); if(!p)return;                   // ใช้ Selection Sort จริงหา step ถัดไป
    this.hints++;this.hp=p;this.render();
    say(`ช่อง <b>${p+1}</b> ยังไม่ใช่ตัวเล็กสุดของส่วนที่เหลือ → ตัวเล็กสุดคือ <b>${this.a[p]}</b> สลับมาไว้ช่อง ${p+1} ค่ะ 🎯`);
  }
});

/* ---------- ด่าน 3: INSERTION — แทรกคิวลูกค้า ---------- */
STAGES.push({
  name:'คิวลูกค้าหน้าร้าน', algo:'Insertion Sort', icon:'🃏',
  tut:`<p>ลูกค้าเข้าคิวมาทีละคน! ถาดซ้ายคือคิวที่ <b>จัดลำดับแล้ว</b> ลูกค้าถัดไปจะถือเลขคิวอยู่ในมือ</p>
  <p><b>Insertion Sort</b>: หยิบ 1 ตัว (key) แล้ว <b>เทียบจากขวาไปซ้าย</b> ตัวที่ใหญ่กว่า key ขยับไปขวา แล้วแทรก key ลงช่องว่าง</p>
<pre>for i = 1 .. n-1:
  key = a[i]; j = i-1
  while j>=0 and a[j] > key:
    a[j+1] = a[j]; j--
  a[j+1] = key</pre>
  <p>🎮 กดช่อง <b>[ ]</b> ที่คิดว่าควรแทรกลูกค้าในมือ ถ้าผิดเสียหัวใจ ❤️ (มี 3 ดวง)</p>`,
  init(){this.start=shuffle(pickDistinct(7,9));this.hints=0;this.reset();},
  reset(){
    this.sorted=[this.start];this.k=1;this.hearts=3;this.hs=-1;this.render();
    say('ลูกค้าคนแรกนั่งแล้วค่ะ คนต่อไปมาแล้ว! ลองเทียบจากขวาไปซ้ายนะคะ 🃏');
  },
  render(){
    const hand=this.start[this.k];
    $('#info').innerHTML=chip(`❤️ ${hearts(this.hearts,3)}`)+chip(`👥 จัดคิวแล้ว ${this.k}/${this.start.length}`)+chip(`💡 ใช้คำใบ้ ${this.hints}`);
    let tray='';
    for(let s=0;s<=this.sorted.length;s++){
      tray+=`<button class="slot ${this.hs===s?'hint':''}" data-slot="${s}">▾</button>`;
      if(s<this.sorted.length)tray+=cardHTML(this.sorted[s],{cls:'static lock'});
    }
    flip(()=>{$('#board').innerHTML=`<div class="lbl">🍽️ คิวที่จัดแล้ว (น้อย → มาก) — กดช่อง ▾ เพื่อแทรก</div><div class="row">${tray}</div>
      <div class="lbl">✋ ลูกค้าในมือ</div>${row([hand],v=>cardHTML(v,{cls:'static sel'}))}
      <div class="lbl">🕐 ยังรออยู่</div>${row(this.start.slice(this.k+1),v=>cardHTML(v,{cls:'static'}))}`;});
    $('#ctrl').innerHTML=`<button class="btn" onclick="cur.hint()">💡 คำใบ้ (−20)</button><button class="btn ghost" onclick="cur.reset()">↩️ เริ่มใหม่</button>`;
  },
  click(e){
    const b=e.target.closest('[data-slot]'); if(!b)return;
    const s=+b.dataset.slot,hand=this.start[this.k];
    const right=insertionPosition(this.sorted,hand);                    // ตำแหน่งแทรกที่ถูกต้อง
    if(s===right){
      this.sorted.splice(s,0,hand);this.k++;this.hs=-1;
      const shifted=this.sorted.length-1-s;
      say(`ถูกต้อง! แทรก <b>${hand}</b> แล้ว ตัวที่ใหญ่กว่าถูกขยับไปขวา <b>${shifted}</b> ตัว ✨`);
      this.render();
      if(this.k>=this.start.length)
        later(()=>win(Math.max(1,this.hearts),`Insertion Sort เทียบจาก <b>ขวาไปซ้าย</b> ถ้าข้อมูลเกือบเรียงอยู่แล้วจะแทบไม่ต้องขยับเลย (best case O(n)) คุณเหลือหัวใจ ${this.hearts} ดวง`));
    } else {
      this.hearts--;shake();this.render();
      say(s<right?`ยังไม่ใช่ค่ะ! ตัวที่อยู่ <b>ขวา</b> ของช่องนี้ยังน้อยกว่า ${hand} → ต้องแทรกไปทางขวากว่านี้ 😢`
                 :`ยังไม่ใช่ค่ะ! ตัวที่อยู่ <b>ซ้าย</b> ของช่องนี้ใหญ่กว่า ${hand} → ต้องแทรกไปทางซ้ายกว่านี้ 😢`);
      if(this.hearts<=0)later(()=>lose('หัวใจหมดแล้ว! จำไว้: เทียบจากขวาไปซ้าย เจอตัวที่ "น้อยกว่าหรือเท่ากับ" key ให้แทรกถัดจากตัวนั้นค่ะ'));
    }
  },
  hint(){this.hints++;this.hs=insertionPosition(this.sorted,this.start[this.k]);this.render();say('ช่องที่กะพริบคือจุดแทรกที่ถูกต้องค่ะ 💡');}
});

/* ---------- ด่าน 4: MERGE — รวมถาดที่เรียงแล้ว ---------- */
STAGES.push({
  name:'รวมถาดชาสองฝั่ง', algo:'Merge Sort', icon:'🍵',
  tut:`<p>ถาดชา 4 ถาด แต่ละถาด <b>เรียงเสร็จแล้ว</b> (ถาดละ 2 แก้ว) ต้องรวมให้เป็นถาดใหญ่ 1 ถาดที่เรียงสมบูรณ์</p>
  <p><b>Merge Sort</b>: แบ่งเป็นชิ้นเล็ก เรียง แล้ว <b>merge</b>: เทียบ "หัวแถว" ของสองถาด ตัวที่น้อยกว่าไปก่อน ทำซ้ำจนหมด เมื่อถาดหนึ่งหมด ที่เหลือของอีกถาดต่อท้ายได้เลย</p>
<pre>merge(A, B):
  while A และ B ไม่ว่าง:
    ถ้า A < B → หยิบ A ลงผลลัพธ์
    ไม่งั้น → หยิบ B
  ต่อท้ายตัวที่เหลือ</pre>
  <p>🎮 กดที่ <b>หัวแถว</b> (ขอบประ) ของถาดที่มีค่า <b>น้อยกว่า</b> มี ❤️ 4 ดวง</p>`,
  init(){
    const v=shuffle(pickDistinct(8,20));this.init0=[];
    for(let i=0;i<8;i+=2)this.init0.push([v[i],v[i+1]].sort((a,b)=>a-b));   // 4 ถาดที่เรียงแล้ว
    this.hints=0;this.reset();
  },
  reset(){
    this.final=false;                                   // (แก้บั๊ก) ต้องรีเซ็ตทุกครั้งที่เริ่มใหม่
    this.runs=this.init0.map(r=>[...r]);this.A=this.runs.shift();this.B=this.runs.shift();
    this.out=[];this.hearts=4;this.m=1;this.hp=null;this.render();
    say('รวมถาดทีละคู่ เทียบแค่ "หัวแถว" ของสองถาดก็พอค่ะ! 🍵');
  },
  render(){
    // การ์ดหัวแถว (i===0) เท่านั้นที่กดได้ (data-q) และมีขอบประ
    const mk=(arr,q)=>arr.map((v,i)=>cardHTML(v,{maxV:20,cls:(i===0?'front ':'')+(this.hp===q&&i===0?'hint':''),attr:i===0?`data-q="${q}"`:''})).join('');
    $('#info').innerHTML=chip(`❤️ ${hearts(this.hearts,4)}`)+chip(`🔀 การรวมครั้งที่ ${Math.min(this.m,3)}/3`)+chip(`💡 ใช้คำใบ้ ${this.hints}`);
    flip(()=>{$('#board').innerHTML=
      (this.runs.length?`<div class="lbl">⏳ ถาดที่รอรวม</div><div class="row wait">${this.runs.map(r=>`<div class="grp">${r.map(v=>cardHTML(v,{mini:1,maxV:20})).join('')}</div>`).join('')}</div>`:'')+
      `<div class="lbl">กดหัวแถวของถาดที่ "น้อยกว่า"</div>
       <div class="duo"><div class="q"><div class="qn">ถาด A</div><div class="row">${mk(this.A,'A')}</div></div>
       <div class="q"><div class="qn">ถาด B</div><div class="row">${mk(this.B,'B')}</div></div></div>
       <div class="lbl">📦 ถาดผลลัพธ์</div><div class="row">${this.out.map(v=>cardHTML(v,{maxV:20,cls:'static lock'})).join('')}</div>`;});
    $('#ctrl').innerHTML=`<button class="btn" onclick="cur.hint()">💡 คำใบ้ (−20)</button><button class="btn ghost" onclick="cur.reset()">↩️ เริ่มใหม่</button>`;
  },
  click(e){
    const c=e.target.closest('[data-q]'); if(!c||this.final)return;
    const q=c.dataset.q;
    if(q!==mergeChoice(this.A,this.B)){                                // ตรวจคำตอบด้วย merge logic
      this.hearts--;shake();this.hp=null;this.render();
      say(`ไม่ใช่ค่ะ! หัวแถว A = <b>${this.A}</b>, B = <b>${this.B}</b> → ต้องหยิบตัวที่ <b>น้อยกว่า</b> 😢`);
      if(this.hearts<=0)later(()=>lose('หัวใจหมดแล้ว! หลักของ merge คือ เทียบหัวแถวสองฝั่ง ตัวน้อยกว่าไปก่อนเสมอค่ะ'));
      return;
    }
    this.out.push(this[q].shift());this.hp=null;
    if(!this.A.length||!this.B.length){                                // ถาดหนึ่งหมด → ต่อท้ายที่เหลือได้เลย (ไม่ต้องเทียบ)
      const rest=this.A.length?this.A:this.B;
      if(rest.length)say(`ถาดหนึ่งหมดแล้ว! ที่เหลือ (${rest.join(', ')}) เรียงอยู่แล้ว ต่อท้ายได้เลยโดยไม่ต้องเทียบ ✨`);
      this.out.push(...rest);this.A=[];this.B=[];
    }
    if(!this.A.length&&!this.B.length){
      this.runs.push(this.out);this.out=[];
      if(this.runs.length===1){                                       // เหลือถาดเดียว = เสร็จ
        this.final=true;this.out=this.runs;this.runs=[];this.render();
        later(()=>win(Math.min(3,Math.max(1,this.hearts)),`Merge Sort แบ่งเป็นชิ้นเล็ก เรียงแล้วรวมเป็นชั้น ๆ ใช้เวลา <b>O(n log n)</b> เร็วกว่า O(n²) มากเมื่อข้อมูลเยอะ คุณเหลือหัวใจ ${this.hearts} ดวง`));
        return;
      }
      this.A=this.runs.shift();this.B=this.runs.shift();this.m++;
      say('รวมเสร็จหนึ่งถาด! ต่อไปรวมถาดคู่ถัดไปค่ะ 🍵');
    }
    this.render();
  },
  hint(){if(this.final)return;this.hints++;this.hp=mergeChoice(this.A,this.B);this.render();say('ตัวที่กะพริบคือหัวแถวที่น้อยกว่า หยิบได้เลยค่ะ 💡');}
});

/* ---------- ด่าน 5: นักสืบอัลกอริทึม ---------- */
STAGES.push({
  name:'นักสืบอัลกอริทึม', algo:'แยกแยะ Bubble / Selection / Insertion', icon:'🔍',
  tut:`<p>หัวหน้าเมดแอบเรียงขนมกลางดึก! ดู <b>ก่อน</b> และ <b>หลัง</b> ผ่านไปกี่รอบ แล้วทายว่าใช้ algorithm ไหน (5 ข้อ ต้องถูก ≥ 2 ข้อ)</p>
  <p><b>1 รอบ</b> คือ</p><ul>
  <li>🫧 Bubble = สแกนเทียบคู่ติดกัน 1 รอบทั้งแถว (ตัวใหญ่สุดไปท้าย)</li>
  <li>🎯 Selection = หาตัวเล็กสุดแล้วสลับไปไว้หน้า 1 ครั้ง</li>
  <li>🃏 Insertion = หยิบอีก 1 ตัวมาแทรกในส่วนซ้ายที่เรียงแล้ว</li></ul>
  <p>สังเกต "ร่องรอย": ส่วนไหนเรียงแล้ว อยู่ฝั่งหน้าหรือท้าย และส่วนที่เหลือถูกแตะหรือไม่</p>`,
  names:{bubble:'🫧 Bubble Sort',selection:'🎯 Selection Sort',insertion:'🃏 Insertion Sort'},
  init(){this.n=0;this.right=0;this.hints=0;this.ans=null;this.q=this.newQ();this.render();say('ดู "ร่องรอย" ให้ดีนะคะ นักสืบ! 🔍');},
  newQ(){
    const fn={bubble:bubblePasses,selection:selectionPasses,insertion:insertionPasses},names=Object.keys(fn);
    for(;;){                       // สุ่มจนได้โจทย์ที่ "มีคำตอบเดียว": มีเพียง algorithm เดียวที่ให้ผลนี้
      const arr=shuffle(pickDistinct(7,9)),k=2+rnd(2),algo=names[rnd(3)],snap=fn[algo](arr,k),key=snap.join();
      if(key===arr.join())continue;
      if(names.some(a=>a!==algo&&fn[a](arr,k).join()===key))continue;
      return {arr,snap,k,algo};
    }
  },
  render(){
    const q=this.q,A=this.ans!==null,ok=this.ans===q.algo,N=7;
    const hl=!A?[]:q.algo==='bubble'?range(N-q.k,N):q.algo==='selection'?range(0,q.k):range(0,q.k+1);
    const why={
      bubble:`<b>Bubble Sort</b>: ทุกรอบ "ตัวมากสุด" ลอยไปท้ายแถว → หลัง ${q.k} รอบ ตัวใหญ่สุด ${q.k} ตัวนอนเรียงอยู่ <b>ท้ายสุด</b> (สีเขียว) ส่วนข้างหน้าถูกสลับคู่ไปมาเล็กน้อย`,
      selection:`<b>Selection Sort</b>: ทุกรอบ "หาตัวเล็กสุด" สลับมาไว้หน้า → หลัง ${q.k} รอบ ตัวเล็กสุด ${q.k} ตัวอยู่ <b>หน้าสุด</b> (สีเขียว) ส่วนที่เหลือแทบอยู่ที่เดิม (ขยับแค่ตัวที่โดนสลับ)`,
      insertion:`<b>Insertion Sort</b>: ทุกรอบ "หยิบ 1 ตัวมาแทรก" → หลัง ${q.k} รอบ <b>${q.k+1} ตัวแรก</b>เรียงกันแล้ว (สีเขียว) แต่ตัวที่เหลือทางขวายัง <b>เหมือนเดิมเป๊ะ</b> เพราะยังไม่ถูกแตะ`};
    $('#info').innerHTML=chip(`ข้อ ${this.n+1}/5`)+chip(`✅ ถูก ${this.right}`);
    flip(()=>{$('#board').innerHTML=`<div class="lbl">📋 ก่อนเริ่มเรียง</div>${row(q.arr,v=>cardHTML(v,{mini:1,p:'a',cls:'static'}))}
      <div class="lbl">👀 หลังผ่านไป <b>${q.k} รอบ</b> เป็นแบบนี้ → ใช้ algorithm อะไร?</div>${row(q.snap,(v,i)=>cardHTML(v,{mini:1,p:'b',cls:'static '+(hl.includes(i)?'lock':'')}))}
      ${A?`<div class="explain ${ok?'okk':'bad'}">${ok?'🎉 ถูกต้อง!':`😿 ไม่ใช่ค่ะ คำตอบคือ <b>${this.names[q.algo]}</b>`}<br>${why[q.algo]}</div>`:''}`;},false);
    $('#ctrl').innerHTML=A?`<button class="btn" onclick="cur.next()">${this.n>=4?'ดูผล 🏁':'ข้อต่อไป ➡️'}</button>`
      :Object.keys(this.names).map(k=>`<button class="btn" onclick="cur.answer('${k}')">${this.names[k]}</button>`).join('');
  },
  answer(a){if(this.ans!==null)return;this.ans=a;if(a===this.q.algo)this.right++;this.render();},
  next(){
    this.n++;
    if(this.n>=5){
      if(this.right>=2)win(this.right>=4?3:this.right===3?2:1,`ถูก <b>${this.right}/5</b> ข้อ — จำง่าย ๆ: Bubble = ท้ายเรียงก่อน, Selection = หน้าเรียงก่อนแต่ที่เหลือไม่ขยับ, Insertion = หน้าเรียงแต่ที่เหลือไม่โดนแตะเลย`);
      else lose(`ถูกแค่ ${this.right}/5 ข้อ ลองทบทวนคู่มือ (❓) แล้วสังเกตว่า "ส่วนที่เรียงแล้ว" อยู่ฝั่งไหนนะคะ`);
    } else {this.q=this.newQ();this.ans=null;this.render();}
  }
});

/* ---------- ด่าน 6: บอส — แข่งกับหัวหน้าเมด (Bubble Sort ที่รันทีละ step) ---------- */
STAGES.push({
  name:'ศึกชิงตำแหน่งหัวหน้าเมด', algo:'แข่งกับ Bubble Sort', icon:'👑',
  tut:`<p>หัวหน้าเมด <b>"บับเบิ้ล-จัง"</b> จะเรียงถาดเดียวกับคุณด้วย <b>Bubble Sort</b> ทีละ step (เทียบคู่ติดกัน 1 คู่ต่อจังหวะ สีฟ้าคือคู่ที่กำลังเทียบ)</p>
  <p>แต่คุณ <b>สลับสองช่องไหนก็ได้!</b> ใช้ความรู้ Selection Sort (หาตัวเล็กสุด สลับไปไว้หน้า) ให้เสร็จ <b>ก่อนเธอ</b> ถึงจะชนะ</p>
  <p>🎮 กดเริ่มแข่ง แล้วกดการ์ดสองใบของคุณเพื่อสลับ</p>`,
  init(){
    do{this.start=shuffle(pickDistinct(7,9));}while(countInversions(this.start)<15||minSwaps(this.start)<5);
    this.min=minSwaps(this.start);this.hints=0;this.reset();
  },
  stop(){clearInterval(this.timer);this.running=false;},
  reset(){
    this.stop();this.a=[...this.start];this.b=[...this.start];this.steps=bubbleSortSteps(this.start);   // step ทั้งหมดของ Bubble Sort ที่บอทจะเล่น
    this.si=0;this.moves=0;this.bSwaps=0;this.bCmp=0;this.cmp=null;this.sel=-1;this.over=false;this.render();
    say('พร้อมแล้วกดเริ่มแข่งเลยค่ะ! เธอสลับทีละคู่ติดกัน แต่คุณสลับได้ทุกช่อง สู้ ๆ นะคะ 👑');
  },
  start_(ms){this.reset();this.running=true;this.render();this.timer=setInterval(()=>this.tick(),ms);say('เริ่ม! หาตัวเล็กสุดแล้วสลับไปไว้หน้าให้ไว! 🏃‍♀️');},
  tick(){
    if(!this.running||this.over)return;
    const s=this.steps[this.si++];                                    // บอทเดิน 1 step ของ Bubble Sort
    if(!s){this.stop();return;}
    this.cmp=[s.i,s.j];this.bCmp++;
    if(s.swap){[this.b[s.i],this.b[s.j]]=[this.b[s.j],this.b[s.i]];this.bSwaps++;}
    this.render();
    if(isSorted(this.b))this.end(false);
  },
  end(playerWon){
    this.over=true;this.stop();this.cmp=null;this.render();
    if(playerWon){
      const st=this.moves<=this.min?3:this.moves<=this.a.length-1?2:1;
      later(()=>win(st,`คุณชนะ! คุณสลับ <b>${this.moves}</b> ครั้ง (ขั้นต่ำ ${this.min}) ส่วน Bubble เทียบไป ${this.bCmp} ครั้ง สลับ ${this.bSwaps} ครั้ง — Bubble สลับเยอะเพราะขยับได้แค่ข้างกัน ส่วน Selection สลับ ≤ n−1 เสมอ`));
    } else later(()=>lose(`บับเบิ้ล-จังเสร็จก่อน! เธอเทียบ ${this.bCmp} ครั้ง สลับ ${this.bSwaps} ครั้ง ลองหาตัวเล็กสุดแล้วสลับไปไว้หน้าแบบ Selection Sort ให้ไวขึ้นนะคะ`));
  },
  render(){
    $('#info').innerHTML=chip(`🙋 สลับของคุณ <b>${this.moves}</b>`)+chip(`🤖 Bubble: เทียบ ${this.bCmp} / สลับ ${this.bSwaps}`)+chip(`⭐⭐⭐ ≤ ${this.min} ครั้ง`);
    flip(()=>{$('#board').innerHTML=`<div class="lbl">🙋 คุณ — สลับช่องไหนก็ได้!</div>`+
      row(this.a,(v,i)=>cardHTML(v,{i,p:'p',cls:this.sel===i?'sel':''}))+
      `<div class="lbl">👩‍🍳 บับเบิ้ล-จัง (Bubble Sort) — สีฟ้า = คู่ที่กำลังเทียบ</div>`+
      row(this.b,(v,i)=>cardHTML(v,{p:'b',cls:'static '+(this.cmp&&this.cmp.includes(i)?'cmp':'')}));});
    $('#ctrl').innerHTML=this.running?`<button class="btn ghost" onclick="cur.reset()">↩️ ยอมแพ้/เริ่มใหม่</button>`
      :this.over?'':`<button class="btn" onclick="cur.start_(1400)">🐢 เริ่มแข่ง (ง่าย)</button><button class="btn" onclick="cur.start_(1000)">🐇 เริ่มแข่ง (ปกติ)</button>`;
  },
  click(e){
    if(!this.running||this.over){say('กด "เริ่มแข่ง" ก่อนนะคะ! 🏁');return;}
    pick(this,e,'any',(j,i)=>{
      [this.a[j],this.a[i]]=[this.a[i],this.a[j]];this.moves++;this.render();
      if(isSorted(this.a))this.end(true);
    });
  }
});

/* =====================================================================
   ส่วนที่ 5: เริ่มเกม
   ===================================================================== */
updateTop();
showTitle();