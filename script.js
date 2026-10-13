/* ==========================================================================
   Interactive Presentation Deck Controller
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // State Variables
  let currentSlide = 1;
  const totalSlides = 10;
  let autoplayTimer = null;
  let isAutoplay = false;
  const AUTOPLAY_INTERVAL = 7000; // 7 seconds per slide

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
  const presentationContainer = document.getElementById('presentationContainer');

  // Init Dot Indicators
  function createDots() {
    if (!dotIndicators) return;
    dotIndicators.innerHTML = '';
    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 bg-amber-400' : 'bg-slate-600 hover:bg-slate-400'}`;
      dot.title = `Chuyển tới slide ${i}: ${slideTitles[i-1]}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(i);
      });
      dotIndicators.appendChild(dot);
    }
  }

  // Init Overview Modal Grid
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
        goToSlide(i);
        closeOverviewModal();
      });
      overviewGrid.appendChild(card);
    }
  }

  // Update Slide View
  function updateSlideView() {
    slides.forEach((slide, idx) => {
      const slideIndex = idx + 1;
      if (slideIndex === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Progress Bar
    if (progressBar) {
      const percentage = (currentSlide / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update Text Indicator
    if (slideIndicator) {
      slideIndicator.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }

    // Update Navigation Buttons State
    if (btnPrev) btnPrev.disabled = currentSlide === 1;
    if (btnNext) btnNext.disabled = currentSlide === totalSlides;

    // Update Dots
    if (dotIndicators) {
      const dots = dotIndicators.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        const i = idx + 1;
        if (i === currentSlide) {
          dot.className = 'w-5 h-2 rounded-full bg-amber-400 transition-all duration-300';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-slate-600 hover:bg-slate-400 transition-all duration-300';
        }
      });
    }

    // Re-create overview active styling
    createOverviewGrid();
  }

  // Navigation Actions
  function goToSlide(slideNum) {
    if (slideNum < 1 || slideNum > totalSlides) return;
    currentSlide = slideNum;
    updateSlideView();
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      currentSlide++;
      updateSlideView();
    } else if (isAutoplay) {
      // Loop back to first slide when autoplay reaches end
      currentSlide = 1;
      updateSlideView();
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      currentSlide--;
      updateSlideView();
    }
  }

  // Expose navigation functions to global scope for any inline onclick handlers
  window.goToSlide = goToSlide;
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  // Modal Control Functions
  function openOverviewModal() {
    if (overviewModal) overviewModal.classList.remove('opacity-0', 'pointer-events-none');
  }
  function closeOverviewModal() {
    if (overviewModal) overviewModal.classList.add('opacity-0', 'pointer-events-none');
  }
  function openHelpModal() {
    if (helpModal) helpModal.classList.remove('opacity-0', 'pointer-events-none');
  }
  function closeHelpModal() {
    if (helpModal) helpModal.classList.add('opacity-0', 'pointer-events-none');
  }

  // Fullscreen Toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Autoplay Toggle
  function toggleAutoplay() {
    isAutoplay = !isAutoplay;
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

  // Click on canvas advances slide (unless clicking an interactive element)
  if (presentationContainer) {
    presentationContainer.addEventListener('click', (e) => {
      // Ignore click if user clicked button, link or modal
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('nav') || e.target.closest('header')) {
        return;
      }
      nextSlide();
    });
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      closeOverviewModal();
      closeHelpModal();
      return;
    }

    // If modal is open, don't trigger regular navigation
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

  // Event Listeners for UI Buttons
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

  // Initial Setup
  createDots();
  createOverviewGrid();
  updateSlideView();
});
