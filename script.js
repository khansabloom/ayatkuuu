const $ = (s) => document.querySelector(s);
const screens = {home:$("#homeScreen"), quiz:$("#quizScreen"), result:$("#resultScreen")};
let allQuestions = [];
let activeQuestions = [];
let current = 0, score = 0, lives = 3, combo = 0, bestCombo = 0, correct = 0, timer = null, timeLeft = 15;
let soundOn = true;

function show(name){
  Object.values(screens).forEach(x=>x.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

async function loadQuestions(){
  try{
    const res = await fetch("questions.json");
    if(!res.ok) throw new Error("questions.json tidak ditemukan");
    const data = await res.json();
    allQuestions = data.questions || [];
  }catch(err){
    console.error(err);
    allQuestions = [];
  }
}
function beep(type){
  if(!soundOn) return;
  try{
    const C = window.AudioContext || window.webkitAudioContext;
    if(!C) return;
    const ctx = new C(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type="sine";
    osc.frequency.value = type==="good" ? 660 : type==="bad" ? 190 : 520;
    gain.gain.setValueAtTime(.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.01);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.14);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+.15);
  }catch(e){}
}
function startGame(surah=null){
  if(!allQuestions.length){ alert("Soal belum berhasil dimuat. Pastikan questions.json ada di repository yang sama dengan index.html."); return; }
  const pool = surah ? allQuestions.filter(q=>q.surah===surah) : allQuestions;
  activeQuestions = shuffle(pool).slice(0, Math.min(10,pool.length));
  current=0; score=0; lives=3; combo=0; bestCombo=0; correct=0;
  show("quiz"); renderQuestion();
}
function renderQuestion(){
  clearInterval(timer);
  if(current>=activeQuestions.length || lives<=0){ finishGame(); return; }
  const q=activeQuestions[current];
  $("#score").textContent=score; $("#lives").textContent=lives; $("#combo").textContent=combo;
  $("#questionNo").textContent=`${current+1} / ${activeQuestions.length}`;
  $("#surahName").textContent=q.surah;
  $("#prompt").textContent=q.prompt;
  $("#progressBar").style.width=`${((current)/activeQuestions.length)*100}%`;
  $("#feedback").textContent=""; $("#feedback").className="feedback";
  $("#nextBtn").hidden=true;
  const box=$("#options"); box.innerHTML="";
  shuffle(q.options).forEach(opt=>{
    const b=document.createElement("button");
    b.className="option"; b.textContent=opt; b.dataset.value=opt;
    b.addEventListener("click",()=>answer(b,q));
    box.appendChild(b);
  });
  timeLeft=15; updateTimer();
  timer=setInterval(()=>{
    timeLeft--; updateTimer();
    if(timeLeft<=0){clearInterval(timer); answer(null,q,true);}
  },1000);
}
function updateTimer(){
  $("#timer").textContent=timeLeft;
  $("#timer").classList.toggle("warning",timeLeft<=5);
}
function answer(clicked,q,timeout=false){
  if(!$("#nextBtn").hidden) return;
  clearInterval(timer);
  document.querySelectorAll(".option").forEach(b=>b.disabled=true);
  const isCorrect = clicked && clicked.dataset.value===q.answer;
  if(isCorrect){
    clicked.classList.add("correct");
    combo++; bestCombo=Math.max(bestCombo,combo); correct++;
    score += 100 + Math.max(0,timeLeft*5) + (combo>=3?50:0);
    $("#feedback").textContent = combo>=3 ? "🔥 MasyaAllah! Combo terus!" : "✨ Benar! MasyaAllah!";
    $("#feedback").className="feedback good"; beep("good");
  }else{
    if(clicked) clicked.classList.add("wrong");
    document.querySelectorAll(".option").forEach(b=>{if(b.dataset.value===q.answer)b.classList.add("correct")});
    lives--; combo=0;
    $("#feedback").textContent = timeout ? "⏰ Waktunya habis!" : "💗 Belum tepat, coba ingat lagi!";
    $("#feedback").className="feedback bad"; beep("bad");
  }
  $("#score").textContent=score; $("#lives").textContent=lives; $("#combo").textContent=combo;
  $("#progressBar").style.width=`${((current+1)/activeQuestions.length)*100}%`;
  if(lives<=0){
    $("#nextBtn").hidden=false; $("#nextBtn").textContent="Lihat Hasil →";
  }else{
    $("#nextBtn").hidden=false; $("#nextBtn").textContent=current===activeQuestions.length-1?"Lihat Hasil →":"Lanjut →";
  }
}
$("#nextBtn").addEventListener("click",()=>{current++;renderQuestion();});
function finishGame(){
  clearInterval(timer);
  const best=Number(localStorage.getItem("lanjutAyatHighScore")||0);
  const newBest=score>best;
  if(newBest)localStorage.setItem("lanjutAyatHighScore",String(score));
  $("#finalScore").textContent=score; $("#correctCount").textContent=correct; $("#bestCombo").textContent=bestCombo;
  $("#resultIcon").textContent=score>=700?"🏆":score>=400?"🌸":"💜";
  $("#resultTitle").textContent=score>=700?"MasyaAllah, keren!":score>=400?"Semangat, makin jago!":"Tetap semangat!";
  $("#resultText").textContent=newBest && score>0 ? "🎉 High score baru! Terus latihan hafalannya ya." : "Setiap latihan bikin hafalanmu makin kuat.";
  show("result");
}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").hidden=false;}
function closeModal(){$("#modal").hidden=true;}

$("#startBtn").onclick=()=>startGame();
$("#againBtn").onclick=()=>startGame();
$("#resultHomeBtn").onclick=()=>show("home");
$("#quitBtn").onclick=()=>{clearInterval(timer);show("home");};
$("#homeBtn").onclick=()=>{clearInterval(timer);show("home");};
$("#closeModal").onclick=closeModal;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal();});

$("#scoreBtn").onclick=()=>{
  const best=localStorage.getItem("lanjutAyatHighScore")||0;
  openModal(`<h2>🏆 High Score</h2><p>Skor tertinggimu di perangkat ini:</p><div style="font-size:54px;font-weight:800;color:#ed639e">${best}</div>`);
};
$("#howBtn").onclick=()=>openModal(`<h2>💡 Cara Main</h2><p>1. Baca potongan ayat yang tampil.<br>2. Pilih lanjutan ayat yang paling tepat.<br>3. Jawaban benar memberi poin dan combo.<br>4. Kamu punya 3 ❤️ nyawa dan 15 detik setiap soal.<br>5. Kumpulkan skor setinggi mungkin!</p>`);
$("#surahBtn").onclick=()=>{
  const surahs=[...new Set(allQuestions.map(q=>q.surah))];
  openModal(`<h2>📖 Pilih Surah</h2><p>Mode Juz 30 — pilih surah yang tersedia.</p><div class="surah-grid"><button data-surah="all">🌙 Campur Semua</button>${surahs.map(s=>`<button data-surah="${s.replaceAll('"','&quot;')}">${s}</button>`).join("")}</div>`);
  document.querySelectorAll("[data-surah]").forEach(b=>b.onclick=()=>{
    const s=b.dataset.surah; closeModal(); startGame(s==="all"?null:s);
  });
};
$("#soundBtn").onclick=()=>{soundOn=!soundOn;$("#soundBtn").textContent=soundOn?"🔊":"🔇";};
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("#themeBtn").textContent=document.body.classList.contains("dark")?"🌙":"☀️";};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
loadQuestions();
