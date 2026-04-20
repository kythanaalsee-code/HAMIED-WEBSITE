/* ═══════════════════════════════════════════
   STICHTING HAMIËD — JAVASCRIPT
   GSAP ScrollTrigger + Quiz + Forms + Nav
═══════════════════════════════════════════ */

'use strict';

// ─── GSAP Registration ───────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── DOM Ready ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initNav();
  initScrollAnimations();
  initLocationCards();
  initQuiz();
  initForms();
  initMobileNav();
  initHeroMedia();
  initHeroAnimations();
});

// ═══════════════════════════════════════════
// SPLASH SCREEN — zoom-in logo, 2s, then dismiss
// ═══════════════════════════════════════════
function initSplash() {
  const splash = document.getElementById('splash-screen');
  const logo   = splash ? splash.querySelector('.splash-logo') : null;
  if (!splash || !logo) return;

  // Prevent scroll while splash is visible
  document.body.style.overflow = 'hidden';

  const tl = gsap.timeline({
    onComplete: () => {
      document.body.style.overflow = '';
      splash.classList.add('splash-hidden');
    }
  });

  // Start small + invisible, zoom smoothly to full size in 2 s
  tl.fromTo(logo,
    { scale: 0.35, opacity: 0 },
    { scale: 1, opacity: 1, duration: 2, ease: 'power3.out' }
  )
  // Brief pause at full size, then fade the whole screen out
  .to(splash,
    { opacity: 0, duration: 0.55, ease: 'power2.inOut' },
    '+=0.25'
  );
}

// ═══════════════════════════════════════════
// NAV — sticky scroll + active section + smooth scroll
// ═══════════════════════════════════════════
function initNav() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id]');
  const navHeight = () => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    return Number(cssVar.replace('px', '')) || 80;
  };

  // Keep nav styling persistent from initial paint
  if (header) {
    header.classList.add('scrolled');
  }

  // Scroll → add class
  ScrollTrigger.create({
    start: 'top -10',
    onUpdate: (self) => {
      header.classList.toggle('scrolled', self.scroll() > 60);
    }
  });

  // Smooth scroll on nav click
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.1,
        scrollTo: { y: target, offsetY: navHeight() },
        ease: 'power3.inOut'
      });
      // Close mobile nav
      const mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) {
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Active nav link on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: `-${navHeight()}px 0px -40% 0px` });

  sections.forEach(s => observer.observe(s));
}

// ═══════════════════════════════════════════
// MOBILE NAV
// ═══════════════════════════════════════════
function initMobileNav() {
  const burger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!burger || !mobileNav) return;

  let isOpen = false;
  burger.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileNav.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));

    // Animate burger → X
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      gsap.to(spans[0], { rotation: 45, y: 7, duration: 0.25, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 0, duration: 0.2 });
      gsap.to(spans[2], { rotation: -45, y: -7, duration: 0.25, ease: 'power2.out' });
    } else {
      gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 1, duration: 0.2 });
      gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  });
}

// ═══════════════════════════════════════════
// HERO ANIMATIONS
// ═══════════════════════════════════════════
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 })
    .from('.hero-title', { opacity: 0, y: 40, duration: 1.1 }, '-=0.5')
    .from('.hero-sub', { opacity: 0, y: 24, duration: 0.8 }, '-=0.7')
    .from('.btn-hero', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
    .from('.scroll-cue', { opacity: 0, duration: 0.5 }, '-=0.2');
}

// ═══════════════════════════════════════════
// HERO VIDEO — lazy start + fallback handling
// ═══════════════════════════════════════════
function initHeroMedia() {
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoWrap = document.querySelector('.hero-video-wrap');
  const heroFallback = document.querySelector('.hero-video-fallback');

  if (!heroVideo || !heroVideoWrap || !heroFallback) return;

  const showFallback = () => heroVideoWrap.classList.remove('media-ready');
  const showVideo = () => heroVideoWrap.classList.add('media-ready');

  heroVideo.muted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.setAttribute('playsinline', '');
  heroVideo.preload = 'auto';

  const tryPlay = () => {
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        showVideo();
      }).catch(() => {
        showFallback();
      });
    } else {
      showFallback();
    }
  };

  if (heroVideo.readyState >= 3) {
    tryPlay();
  } else {
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
  }

  heroVideo.addEventListener('playing', showVideo, { once: true });
  heroVideo.addEventListener('error', showFallback, { once: true });
}

// ═══════════════════════════════════════════
// SCROLL ANIMATIONS — GSAP ScrollTrigger
// ═══════════════════════════════════════════
function initScrollAnimations() {
  const ease = 'power3.out';

  // Section headers
  gsap.utils.toArray('.section-eyebrow, .section-title, .section-desc').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0, y: 30, duration: 0.8, ease,
    });
  });

  // Service cards — stagger
  const serviceCards = gsap.utils.toArray('.service-card');
  if (serviceCards.length) {
    gsap.from(serviceCards, {
      scrollTrigger: { trigger: '.services-grid', start: 'top 80%', once: true },
      opacity: 0, y: 36, duration: 0.7, ease,
      stagger: { amount: 0.5, from: 'start' }
    });
  }

  // Job cards — stagger
  const jobCards = gsap.utils.toArray('.job-card');
  if (jobCards.length) {
    gsap.from(jobCards, {
      scrollTrigger: { trigger: '.jobs-grid', start: 'top 80%', once: true },
      opacity: 0, y: 30, duration: 0.65, ease,
      stagger: { amount: 0.45 }
    });
  }

  // Location cards — stagger from left
  const locCards = gsap.utils.toArray('.location-card');
  if (locCards.length) {
    gsap.from(locCards, {
      scrollTrigger: { trigger: '.locations-grid', start: 'top 85%', once: true },
      opacity: 0, y: 24, duration: 0.8, ease,
      stagger: { amount: 0.4 }
    });
  }

  // About layout
  const aboutText = document.querySelector('.about-text');
  const aboutVisuals = document.querySelector('.about-visuals');
  if (aboutText) {
    gsap.from(aboutText, {
      scrollTrigger: { trigger: aboutText, start: 'top 80%', once: true },
      opacity: 0, x: -40, duration: 0.9, ease
    });
  }
  if (aboutVisuals) {
    gsap.from(aboutVisuals, {
      scrollTrigger: { trigger: aboutVisuals, start: 'top 80%', once: true },
      opacity: 0, x: 40, duration: 0.9, ease
    });
  }

  // Stat cards count-up
  document.querySelectorAll('.about-stat-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      opacity: 0, scale: 0.88, duration: 0.6, ease,
      delay: i * 0.12
    });
  });

  // Donor cards
  const donorCards = gsap.utils.toArray('.donor-card');
  if (donorCards.length) {
    gsap.from(donorCards, {
      scrollTrigger: { trigger: '.donors-grid', start: 'top 82%', once: true },
      opacity: 0, y: 24, duration: 0.6, ease,
      stagger: { amount: 0.35 }
    });
  }

  // FAQ items
  const faqItems = gsap.utils.toArray('.faq-item');
  if (faqItems.length) {
    gsap.from(faqItems, {
      scrollTrigger: { trigger: '.faq-list', start: 'top 80%', once: true },
      opacity: 0, y: 16, duration: 0.55, ease,
      stagger: { amount: 0.3 }
    });
  }

  // Quiz container
  const quizContainer = document.querySelector('.quiz-container');
  if (quizContainer) {
    gsap.from(quizContainer, {
      scrollTrigger: { trigger: quizContainer, start: 'top 80%', once: true },
      opacity: 0, y: 32, scale: 0.97, duration: 0.8, ease
    });
  }

  // Apply form wrap
  const applyForm = document.querySelector('.apply-form-wrap');
  if (applyForm) {
    gsap.from(applyForm, {
      scrollTrigger: { trigger: applyForm, start: 'top 80%', once: true },
      opacity: 0, y: 30, duration: 0.8, ease
    });
  }

  // Contact form wrap
  const contactForms = document.querySelectorAll('.contact-form-wrap, .contact-info-wrap');
  contactForms.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      opacity: 0, y: 28, duration: 0.75, ease,
      delay: i * 0.15
    });
  });

  // Donate layout
  const donateInfo = document.querySelector('.donate-info');
  const donateRecognition = document.querySelector('.donate-recognition');
  if (donateInfo) {
    gsap.from(donateInfo, {
      scrollTrigger: { trigger: donateInfo, start: 'top 82%', once: true },
      opacity: 0, x: -30, duration: 0.8, ease
    });
  }
  if (donateRecognition) {
    gsap.from(donateRecognition, {
      scrollTrigger: { trigger: donateRecognition, start: 'top 82%', once: true },
      opacity: 0, x: 30, duration: 0.8, ease
    });
  }
}

// ═══════════════════════════════════════════
// LOCATION CARDS — hover scale
// ═══════════════════════════════════════════
function initLocationCards() {
  const cards = document.querySelectorAll('.location-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { scale: 1.02, duration: 0.45, ease: 'power2.out', zIndex: 2 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { scale: 1, duration: 0.45, ease: 'power2.out', zIndex: 1 });
    });
  });
}

// ═══════════════════════════════════════════
// CARE QUIZ
// ═══════════════════════════════════════════
function initQuiz() {
  const slides = document.querySelectorAll('.quiz-slide:not(.quiz-result)');
  const resultSlide = document.getElementById('quiz-result');
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const progressBar = document.getElementById('quiz-progress-bar');
  const stepLabel = document.getElementById('quiz-step-label');
  const dots = document.querySelectorAll('.quiz-dot');
  const quizNav = document.getElementById('quiz-nav');
  const totalSteps = slides.length;

  let currentStep = 0;
  let answers = {};

  function updateProgress() {
    const pct = ((currentStep + 1) / totalSteps) * 100;
    gsap.to(progressBar, { width: pct + '%', duration: 0.5, ease: 'power2.out' });
    stepLabel.textContent = currentStep < totalSteps
      ? `Stap ${currentStep + 1} van ${totalSteps}`
      : 'Uw advies';
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentStep));
    prevBtn.disabled = currentStep === 0;
  }

  function showSlide(index, direction = 1) {
    const from = direction === 1 ? 40 : -40;
    if (index >= totalSteps) {
      // Show result
      slides.forEach(s => s.classList.remove('active'));
      resultSlide.classList.add('active');
      quizNav.style.display = 'none';
      stepLabel.textContent = 'Uw persoonlijk advies';
      gsap.from(resultSlide, { opacity: 0, y: from, duration: 0.5, ease: 'power3.out' });
      showResult();
      return;
    }
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        gsap.from(slide, { opacity: 0, x: from, duration: 0.4, ease: 'power3.out' });
      } else {
        slide.classList.remove('active');
      }
    });
  }

  function showResult() {
    const titleEl = document.getElementById('quiz-result-title');
    const textEl = document.getElementById('quiz-result-text');
    const hiddenEl = document.getElementById('quiz-result-hidden');

    // Simple algorithm
    let recommendation = '';
    let resultText = '';

    if (answers[4] === 'yes') {
      recommendation = 'Palliatieve zorg';
      resultText = 'Op basis van uw antwoorden lijkt palliatieve/terminale zorg het meest passend. Ons gespecialiseerd team biedt liefdevolle begeleiding in de laatste levensfase, gericht op comfort, waardigheid en geborgenheid voor zowel de bewoner als de familie.';
    } else if (answers[2] === 'memory') {
      recommendation = 'Gespecialiseerde dementiezorg';
      resultText = 'Ons gespecialiseerde dementiezorgprogramma biedt een veilige, gestructureerde omgeving met individuele begeleiding voor mensen met geheugenproblematiek.';
    } else if (answers[3] === 'fulltime' || answers[3] === 'intensive') {
      recommendation = '24-uurszorg / Residentiële zorg';
      resultText = 'Op basis van uw antwoorden lijkt voltijdse residentiële zorg de meest geschikte optie. In een van onze vier locaties krijgt uw naaste 24/7 professionele verpleging en een warme, thuisachtige omgeving.';
    } else if (answers[3] === 'home' || answers[3] === 'daycare') {
      recommendation = 'Thuiszorg of Dagopvang';
      resultText = 'Thuiszorg of dagopvang sluit goed aan bij uw situatie. Uw naaste kan thuis blijven wonen en overdag professionele begeleiding en activiteiten ontvangen bij Stichting Hamiëd.';
    } else if (answers[2] === 'daily') {
      recommendation = 'Dagopvang of Thuiszorg';
      resultText = 'Voor ondersteuning bij dagelijkse activiteiten bieden wij uitstekende dagopvang en thuiszorgdiensten. Uw naaste behoudt zoveel mogelijk zelfstandigheid met de juiste begeleiding.';
    } else {
      recommendation = 'Persoonlijk intakegesprek';
      resultText = 'Op basis van uw antwoorden adviseren wij een persoonlijk intakegesprek met ons zorgteam. Samen bespreken wij de best passende zorgvorm voor uw specifieke situatie.';
    }

    titleEl.textContent = `Aanbeveling: ${recommendation}`;
    textEl.textContent = resultText;
    hiddenEl.value = recommendation;
    gsap.to(progressBar, { width: '100%', duration: 0.5, ease: 'power2.out' });
  }

  // Option selection
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const slide = opt.closest('.quiz-slide');
      const step = parseInt(slide.dataset.step);
      slide.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[step] = opt.dataset.value;

      // Pulse animation
      gsap.from(opt, { scale: 0.97, duration: 0.2, ease: 'power2.out' });

      // Enable next
      nextBtn.disabled = false;
      nextBtn.textContent = currentStep < totalSteps - 1 ? 'Volgende →' : 'Bekijk advies →';
    });
  });

  // Next button
  nextBtn.addEventListener('click', () => {
    if (!answers[currentStep + 1]) return; // No answer selected
    currentStep++;
    updateProgress();
    showSlide(currentStep, 1);
  });

  // Prev button
  prevBtn.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep--;
    updateProgress();
    showSlide(currentStep, -1);
    nextBtn.disabled = false;
    nextBtn.textContent = currentStep < totalSteps - 1 ? 'Volgende →' : 'Bekijk advies →';
  });

  updateProgress();

  // Quiz contact form
  const quizForm = document.getElementById('quiz-contact-form');
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(quizForm)) return;
      showToast('Uw aanvraag is verstuurd! Wij nemen spoedig contact op.', 'success');
      quizForm.reset();
    });
  }
}

// ═══════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════
function initForms() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(contactForm)) return;
      showToast('Bericht verstuurd! Wij reageren binnen 1 werkdag.', 'success');
      contactForm.reset();
    });
  }

  // Apply form (job applications)
  const applyForm = document.getElementById('apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(applyForm)) return;
      showToast('Sollicitatie verstuurd naar hr@hamied.cw!', 'success');
      applyForm.reset();
      document.getElementById('file-selected').textContent = 'Geen bestand gekozen';
    });
  }

  // Job apply buttons → scroll to form + prefill
  document.querySelectorAll('.job-apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const jobName = btn.dataset.job;
      const positionInput = document.getElementById('apply-position');
      const jobNameSpan = document.getElementById('apply-job-name');
      if (positionInput) positionInput.value = jobName;
      if (jobNameSpan) jobNameSpan.textContent = `— ${jobName}`;
      const wrap = document.getElementById('apply-form-wrap');
      if (wrap) {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: wrap, offsetY: 100 },
          ease: 'power3.inOut'
        });
        // Flash the form border
        gsap.from(wrap, {
          boxShadow: '0 0 0 3px rgba(124,92,191,0.4)',
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.9
        });
      }
    });
  });

  // File input display
  const cvInput = document.getElementById('af-cv');
  const fileSelected = document.getElementById('file-selected');
  if (cvInput && fileSelected) {
    cvInput.addEventListener('change', () => {
      const fileName = cvInput.files[0]?.name;
      fileSelected.textContent = fileName || 'Geen bestand gekozen';
      if (fileName) fileSelected.style.color = 'var(--color-violet)';
    });
  }
}

// ═══════════════════════════════════════════
// FORM VALIDATION
// ═══════════════════════════════════════════
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const parent = field.closest('.form-group');
    field.style.borderColor = '';
    if (parent) parent.querySelector('.field-error')?.remove();

    let fieldValid = true;
    if (!field.value.trim()) {
      fieldValid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      fieldValid = false;
    }

    if (!fieldValid) {
      isValid = false;
      field.style.borderColor = '#e591c4';
      gsap.from(field, { x: -6, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 3 });
    }
  });

  if (!isValid) {
    showToast('Vul alle verplichte velden correct in.', 'error');
  }
  return isValid;
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'success') toast.classList.add('success');

  gsap.fromTo(toast,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
  );

  setTimeout(() => {
    gsap.to(toast, {
      y: 20, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => toast.classList.remove('show', 'success')
    });
  }, 4000);
}

// ═══════════════════════════════════════════
// PARALLAX HERO VIDEO (subtle)
// ═══════════════════════════════════════════
window.addEventListener('scroll', () => {
  const video = document.querySelector('.hero-video');
  const fallback = document.querySelector('.hero-video-fallback');
  const scrollY = window.scrollY;
  const el = video || fallback;
  if (el) {
    el.style.transform = `translateY(${scrollY * 0.35}px)`;
  }
}, { passive: true });
