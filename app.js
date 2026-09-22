// ============ Fairplay Sports – Portfolio Pickleball v2 interactions ============
document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero video mute/unmute toggle */
  const heroVideo = document.querySelector('.hero-video');
  const heroMuteBtn = document.getElementById('heroMuteBtn');
  if (heroVideo && heroMuteBtn) {
    if (prefersReduced) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    }
    const iconOff = document.getElementById('heroMuteIconOff');
    const iconOn = document.getElementById('heroMuteIconOn');
    heroMuteBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      const isMuted = heroVideo.muted;
      iconOff.style.display = isMuted ? 'block' : 'none';
      iconOn.style.display = isMuted ? 'none' : 'block';
      heroMuteBtn.setAttribute('aria-pressed', String(!isMuted));
      heroMuteBtn.setAttribute('aria-label', isMuted ? 'Bật âm thanh video giới thiệu' : 'Tắt âm thanh video giới thiệu');
      if (!isMuted) { heroVideo.play().catch(() => {}); }
    });
  }

  /* Sticky header shadow + back-to-top visibility */
  const topbar = document.getElementById('topbar');
  const onScroll = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 8);
    document.getElementById('toTop').classList.toggle('show', window.scrollY > 600);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('main section[id]');
  const navA = navLinks.querySelectorAll('a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* Back to top */
  document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* Counter animation for numbers with data-count */
  function animateCounter(el) {
    const target = el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget)) return;
    if (prefersReduced) { el.textContent = numTarget + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * numTarget) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* Subtle parallax for hero blobs (not scroll-jacking, capped, disabled if reduced-motion) */
  if (!prefersReduced) {
    const blobs = document.querySelectorAll('.hero-blob');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 500);
        blobs.forEach((b, i) => {
          const speed = 0.08 + i * 0.04;
          b.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* 3D tilt on hover for cards (mouse only, desktop) */
  if (!prefersReduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltEls = document.querySelectorAll('.t-card, .hm-card, .value-card, .leader-card');
    tiltEls.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y / rect.height) - 0.5) * -6;
        const rotY = ((x / rect.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* Tabs: Hạng mục cung ứng */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  /* Tournament filter + lightbox (guarded: section may not exist on every page) */
  const filterChips = document.querySelectorAll('.filter-chip');
  const tCards = Array.from(document.querySelectorAll('.t-card'));
  let visibleCount = 9;
  const moreBtn = document.getElementById('tMoreBtn');

  function applyFilter(tag) {
    tCards.forEach(card => {
      const match = tag === 'all' || card.dataset.tag === tag;
      card.dataset.match = match ? '1' : '0';
    });
    renderVisible();
  }

  function renderVisible() {
    let shown = 0;
    tCards.forEach(card => {
      const match = card.dataset.match !== '0';
      if (match && shown < visibleCount) {
        card.style.display = '';
        shown++;
      } else {
        card.style.display = 'none';
      }
    });
    if (moreBtn) {
      const remainingMatches = tCards.filter(c => c.dataset.match !== '0').length;
      moreBtn.style.display = remainingMatches > visibleCount ? 'inline-flex' : 'none';
    }
  }

  if (tCards.length) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        visibleCount = 9;
        applyFilter(chip.dataset.filter);
      });
    });
    applyFilter('all');

    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        visibleCount += 9;
        renderVisible();
      });
    }
  }

  /* Hạng mục chi tiết: filter + show more (guarded: section may not exist on every page) */
  const hmChips = document.querySelectorAll('.hm-chip');
  const hmCards = Array.from(document.querySelectorAll('.hm-card'));
  let hmVisibleCount = 9;
  const hmMoreBtn = document.getElementById('hmMoreBtn');

  function hmApplyFilter(tag) {
    hmCards.forEach(card => {
      const match = tag === 'all' || card.dataset.tag === tag;
      card.dataset.match = match ? '1' : '0';
    });
    hmRenderVisible();
  }

  function hmRenderVisible() {
    let shown = 0;
    hmCards.forEach(card => {
      const match = card.dataset.match !== '0';
      if (match && shown < hmVisibleCount) {
        card.style.display = '';
        shown++;
      } else {
        card.style.display = 'none';
      }
    });
    if (hmMoreBtn) {
      const remaining = hmCards.filter(c => c.dataset.match !== '0').length;
      hmMoreBtn.style.display = remaining > hmVisibleCount ? 'inline-flex' : 'none';
    }
  }

  if (hmCards.length) {
    hmChips.forEach(chip => {
      chip.addEventListener('click', () => {
        hmChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        hmVisibleCount = 9;
        hmApplyFilter(chip.dataset.filter);
      });
    });
    hmApplyFilter('all');

    if (hmMoreBtn) {
      hmMoreBtn.addEventListener('click', () => {
        hmVisibleCount += 9;
        hmRenderVisible();
      });
    }
  }

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbBody = document.getElementById('lbBody');
  let currentIdx = 0;
  let currentList = [];

  function openLightbox(idx, list) {
    currentList = list;
    currentIdx = idx;
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function renderLightbox() {
    const card = currentList[currentIdx];
    lbImg.src = card.dataset.full;
    lbTitle.textContent = card.dataset.title;
    lbBody.textContent = card.dataset.desc;
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  tCards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i, tCards));
  });
  hmCards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i, hmCards));
  });
  document.querySelector('#lightbox .close-btn').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.querySelector('#lightbox .prev-btn').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + currentList.length) % currentList.length;
    renderLightbox();
  });
  document.querySelector('#lightbox .next-btn').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % currentList.length;
    renderLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.querySelector('#lightbox .prev-btn').click();
    if (e.key === 'ArrowRight') document.querySelector('#lightbox .next-btn').click();
  });

  /* Quote request form -> mailto (no backend/account needed) */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('qName').value.trim();
      const phone = document.getElementById('qPhone').value.trim();
      const email = document.getElementById('qEmail').value.trim();
      const sport = document.getElementById('qSport').value;
      const note = document.getElementById('qNote').value.trim();
      if (!name || !phone) { return; }
      const subject = `[Yeu cau bao gia] ${sport} - ${name}`;
      const bodyLines = [
        `Ho ten: ${name}`,
        `So dien thoai: ${phone}`,
        `Email: ${email || '(khong cung cap)'}`,
        `Mon the thao quan tam: ${sport}`,
        `Nhu cau / Ghi chu: ${note || '(khong co)'}`
      ];
      const mailto = `mailto:fairplay.kinhdoanh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = mailto;
      const successEl = document.getElementById('quoteFormSuccess');
      if (successEl) successEl.classList.add('show');
    });
  }

});
