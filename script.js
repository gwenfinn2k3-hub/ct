/* ==========================================================================
   Interactive Presentation Deck Controller with Audio & Particle FX
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // State Variables
  let currentSlide = 1;
  const totalSlides = 10;
  let autoplayTimer = null;
  let isAutoplay = false;
  const AUTOPLAY_INTERVAL = 7000; // 7 seconds per slide
  let soundEnabled = true;

  // Titles for Overview Modal
  const slideTitles = [
    "Trang Bìa: Trách Nhiệm NVQS & CAND",
    "Khái Quát Hai Nhóm Trách Nhiệm",
    "Công Dân: Đăng Ký Nghĩa Vụ Đúng Hạn",
    "Công Dân: Chấp Hành Khám Tuyển & Nhập Ngũ",
    "Công Dân: Tuyên Truyền & Vận Động",
    "Công Dân: Đấu Tranh Chống Tiêu Cực",
    "Học Sinh: Ý Thức & Học Tập GDQP-AN",
    "Học Sinh: Xung Kích Hoạt Động Phong Trào",
    "Học Sinh: Đấu Tranh Nhận Thức Sai Lệch",
    "Tổng Kết & Thông Điệp Tuổi Trẻ"
  ];

  // DOM Elements
  const slides = document.querySelectorAll('.slide');
  const progressBar = document.getElementById('progressBar');
  const slideIndicator = document.getElementById('slideIndicator');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const dotIndicators = document.getElementById('dotIndicators');
  const btnOverview = document.getElementById('btnOverview');
  const overviewModal = document.getElementById('overviewModal');
  const btnCloseOverview = document.getElementById('btnCloseOverview');
  const overviewGrid = document.getElementById('overviewGrid');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const btnCloseHelp = document.getElementById('btnCloseHelp');
  const btnAutoplay = document.getElementById('btnAutoplay');
  const autoplayIcon = document.getElementById('autoplayIcon');
  const autoplayText = document.getElementById('autoplayText');
  const btnSound = document.getElementById('btnSound');
  const soundIcon = document.getElementById('soundIcon');
  const presentationContainer = document.getElementById('presentationContainer');
  const cursorTorch = document.getElementById('cursorTorch');
  const particleCanvas = document.getElementById('particleCanvas');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // ==========================================================================
  // 1. Web Audio API Sound Synthesizer (Zero External Dependencies)
  // ==========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSlideSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function playFanfareSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.setValueAtTime(0.035, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
      });
    } catch (e) {}
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundIcon) {
      soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high text-xs' : 'fa-solid fa-volume-xmark text-xs text-red-400';
    }
    if (soundEnabled) playClickSound();
  }

  // ==========================================================================
  // 2. Interactive Cursor Torch Following
  // ==========================================================================
  if (presentationContainer && cursorTorch) {
    presentationContainer.addEventListener('mousemove', (e) => {
      const rect = presentationContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cursorTorch.style.left = `${x}px`;
      cursorTorch.style.top = `${y}px`;
      cursorTorch.style.opacity = '0.4';
    });
    presentationContainer.addEventListener('mouseleave', () => {
      cursorTorch.style.opacity = '0';
    });
  }

  // ==========================================================================
  // 3. Floating Heroic Embers Particle System (Canvas)
  // ==========================================================================
  let emberParticles = [];
  function initEmbers() {
    if (!particleCanvas) return;
    const ctx = particleCanvas.getContext('2d');
    function resizeCanvas() {
      particleCanvas.width = presentationContainer ? presentationContainer.clientWidth : window.innerWidth;
      particleCanvas.height = presentationContainer ? presentationContainer.clientHeight : window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const count = 35;
    emberParticles = [];
    for (let i = 0; i < count; i++) {
      emberParticles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.4 ? '245, 158, 11' : '239, 68, 68',
        pulse: Math.random() * Math.PI
      });
    }

    function animateEmbers() {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      emberParticles.forEach(p => {
        p.y -= p.speedY;
        p.x += Math.sin(p.pulse) * 0.3 + p.speedX;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = particleCanvas.height + 10;
          p.x = Math.random() * particleCanvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity * (0.8 + 0.2 * Math.sin(p.pulse))})`;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      });
      requestAnimationFrame(animateEmbers);
    }
    animateEmbers();
  }
  initEmbers();

  // ==========================================================================
  // 4. Slide 10 Celebration Confetti Cannon
  // ==========================================================================
  let confettiAnimationId = null;
  function triggerConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = presentationContainer ? presentationContainer.clientWidth : window.innerWidth;
    confettiCanvas.height = presentationContainer ? presentationContainer.clientHeight : window.innerHeight;

    const confettiPieces = [];
    const colors = ['#F59E0B', '#EF4444', '#FFD700', '#FFFFFF', '#10B981'];
    for (let i = 0; i < 90; i++) {
      confettiPieces.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
        y: confettiCanvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frames = 0;
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

    function renderConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let activeCount = 0;

      confettiPieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.985;
        p.rotation += p.rotSpeed;
        if (frames > 70) p.alpha -= 0.015;

        if (p.alpha > 0) {
          activeCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      });

      frames++;
      if (activeCount > 0 && frames < 220) {
        confettiAnimationId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    renderConfetti();
    playFanfareSound();
  }

  // ==========================================================================
  // 5. Card 3D Magnetic Hover Tilt
  // ==========================================================================
  function setupCardTilt() {
    const cards = document.querySelectorAll('.glass-card-hover');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (y / (rect.height / 2)) * -4;
        const tiltY = (x / (rect.width / 2)) * 4;
        card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  setupCardTilt();

  // ==========================================================================
  // 6. Navigation, Dots & Overview Controls
  // ==========================================================================
  function createDots() {
    if (!dotIndicators) return;
    dotIndicators.innerHTML = '';
    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 bg-amber-400 dot-active' : 'bg-slate-600 hover:bg-slate-400'}`;
      dot.title = `Chuyển tới slide ${i}: ${slideTitles[i-1]}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        playClickSound();
        goToSlide(i);
      });
      dotIndicators.appendChild(dot);
    }
  }

  function createOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';
    for (let i = 1; i <= totalSlides; i++) {
      const card = document.createElement('div');
      const isActive = i === currentSlide;
      card.className = `p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between h-28 ${isActive ? 'bg-amber-950/60 border-amber-500 shadow-glow-gold' : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500'}`;
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono font-bold ${isActive ? 'text-amber-400' : 'text-slate-400'}">Slide ${String(i).padStart(2, '0')}</span>
          ${isActive ? '<i class="fa-solid fa-circle-check text-xs text-amber-400"></i>' : ''}
        </div>
        <div class="text-xs font-semibold text-white line-clamp-2">${slideTitles[i-1]}</div>
        <div class="text-[10px] text-slate-400">Nhấn để xem</div>
      `;
      card.addEventListener('click', () => {
        playClickSound();
        goToSlide(i);
        closeOverviewModal();
      });
      overviewGrid.appendChild(card);
    }
  }

  function updateSlideView() {
    slides.forEach((slide, idx) => {
      const slideIndex = idx + 1;
      if (slideIndex === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    if (progressBar) {
      const percentage = (currentSlide / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    if (slideIndicator) {
      slideIndicator.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }

    if (btnPrev) btnPrev.disabled = currentSlide === 1;
    if (btnNext) btnNext.disabled = currentSlide === totalSlides;

    if (dotIndicators) {
      const dots = dotIndicators.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        const i = idx + 1;
        if (i === currentSlide) {
          dot.className = 'w-5 h-2 rounded-full bg-amber-400 dot-active transition-all duration-300';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-slate-600 hover:bg-slate-400 transition-all duration-300';
        }
      });
    }

    createOverviewGrid();

    // Trigger Slide 10 Confetti Fanfare
    if (currentSlide === 10) {
      setTimeout(triggerConfetti, 350);
    }
  }

  function goToSlide(slideNum) {
    if (slideNum < 1 || slideNum > totalSlides) return;
    if (currentSlide !== slideNum) {
      currentSlide = slideNum;
      playSlideSound();
      updateSlideView();
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      currentSlide++;
      playSlideSound();
      updateSlideView();
    } else if (isAutoplay) {
      currentSlide = 1;
      playSlideSound();
      updateSlideView();
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      currentSlide--;
      playSlideSound();
      updateSlideView();
    }
  }

  window.goToSlide = goToSlide;
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  function openOverviewModal() {
    playClickSound();
    if (overviewModal) overviewModal.classList.remove('opacity-0', 'pointer-events-none');
  }
  function closeOverviewModal() {
    playClickSound();
    if (overviewModal) overviewModal.classList.add('opacity-0', 'pointer-events-none');
  }
  function openHelpModal() {
    playClickSound();
    if (helpModal) helpModal.classList.remove('opacity-0', 'pointer-events-none');
  }
  function closeHelpModal() {
    playClickSound();
    if (helpModal) helpModal.classList.add('opacity-0', 'pointer-events-none');
  }

  function toggleFullscreen() {
    playClickSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  function toggleAutoplay() {
    isAutoplay = !isAutoplay;
    playClickSound();
    if (isAutoplay) {
      if (autoplayIcon) autoplayIcon.className = 'fa-solid fa-pause text-sm';
      if (autoplayText) autoplayText.textContent = 'Tạm dừng';
      if (btnAutoplay) btnAutoplay.classList.add('text-emerald-400');
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    } else {
      if (autoplayIcon) autoplayIcon.className = 'fa-solid fa-play text-sm';
      if (autoplayText) autoplayText.textContent = 'Tự chạy';
      if (btnAutoplay) btnAutoplay.classList.remove('text-emerald-400');
      clearInterval(autoplayTimer);
    }
  }

  if (presentationContainer) {
    presentationContainer.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('nav') || e.target.closest('header')) {
        return;
      }
      nextSlide();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverviewModal();
      closeHelpModal();
      return;
    }

    const isOverviewOpen = overviewModal && !overviewModal.classList.contains('pointer-events-none');
    const isHelpOpen = helpModal && !helpModal.classList.contains('pointer-events-none');
    if (isOverviewOpen || isHelpOpen) return;

    switch(e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
      case 'o':
      case 'O':
        e.preventDefault();
        openOverviewModal();
        break;
      case 's':
      case 'S':
        e.preventDefault();
        toggleSound();
        break;
      case '?':
      case '/':
        e.preventDefault();
        openHelpModal();
        break;
      case 'a':
      case 'A':
        e.preventDefault();
        toggleAutoplay();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;
    }
  });

  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });
  if (btnOverview) btnOverview.addEventListener('click', openOverviewModal);
  if (btnCloseOverview) btnCloseOverview.addEventListener('click', closeOverviewModal);
  if (overviewModal) {
    overviewModal.addEventListener('click', (e) => {
      if (e.target === overviewModal) closeOverviewModal();
    });
  }
  if (btnHelp) btnHelp.addEventListener('click', openHelpModal);
  if (btnCloseHelp) btnCloseHelp.addEventListener('click', closeHelpModal);
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelpModal();
    });
  }
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  if (btnAutoplay) btnAutoplay.addEventListener('click', toggleAutoplay);
  if (btnSound) btnSound.addEventListener('click', toggleSound);

  // Initial Setup
  createDots();
  createOverviewGrid();
  updateSlideView();
});
