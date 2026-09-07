const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const soundBtn = document.getElementById("soundBtn");
const themeBtn = document.getElementById("themeBtn");

function openModal(title, content){
  modalContent.innerHTML = `<h2>${title}</h2>${content}`;
  modal.hidden = false;
}
document.getElementById("closeModal").onclick = () => modal.hidden = true;
modal.addEventListener("click", e => { if(e.target === modal) modal.hidden = true; });

document.getElementById("startBtn").onclick = () => {
  openModal("🌸 Game Siap!", `<p>Halaman quiz akan kita lanjutkan di versi berikutnya. Database soal Juz 30 sudah disiapkan supaya mudah ditambahkan.</p><button class="primary" onclick="modal.hidden=true">Mulai</button>`);
};

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if(action === "surah"){
      openModal("📖 Pilih Surah", `<p>Pilih surah Juz 30 untuk bermain.</p>
      <div class="surah-list">${["An-Naba'","An-Nazi'at","'Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Insyiqaq","Al-Buruj"].map(s=>`<button onclick="modal.hidden=true">${s}</button>`).join("")}</div>`);
    } else if(action === "score"){
      const score = localStorage.getItem("lanjutAyatHighScore") || 0;
      openModal("🏆 High Score", `<p>Skor tertinggimu saat ini:</p><div style="font-size:48px;font-weight:800;color:#ee679f">${score}</div>`);
    } else {
      openModal("⚙️ Pengaturan", `<p>🎵 Suara: ${soundBtn.textContent === "🔊" ? "Aktif" : "Mati"}</p><p>🌙 Tema bisa diubah lewat tombol di kanan atas.</p>`);
    }
  });
});

let soundOn = true;
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
};

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "🌙" : "☀️";
};

window.addEventListener("keydown", e => {
  if(e.key === "Escape") modal.hidden = true;
});
