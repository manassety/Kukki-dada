/* ==========================================================================
   4-PAGE CINEMATIC BIRTHDAY SURPRISE - SCRIPT ENGINE
   For Major Kumud Sety ("Kukki Dada")
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
   * 1. AUDIO SYSTEM & AMBIENT SOUNDTRACK
   * -------------------------------------------------------------------------- */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let isAudioPlaying = false;
  let webAudioCtx = null;
  let synthOscillators = [];

  function initAudio() {
    if (!bgMusic) return;
    
    // Attempt standard HTML audio playback
    bgMusic.volume = 0.6;
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioPlaying = true;
        updateAudioUI(true);
      }).catch(err => {
        console.warn("HTML5 audio autoplay restricted. Enabling Web Audio ambient fallback.", err);
        // Browser requires user interaction or fallback
        setupWebAudioFallback();
      });
    }
  }

  function toggleAudio() {
    if (isAudioPlaying) {
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
      }
      stopWebAudioFallback();
      isAudioPlaying = false;
      updateAudioUI(false);
    } else {
      if (bgMusic) {
        bgMusic.play().then(() => {
          isAudioPlaying = true;
          updateAudioUI(true);
        }).catch(() => {
          startWebAudioFallback();
          isAudioPlaying = true;
          updateAudioUI(true);
        });
      } else {
        startWebAudioFallback();
        isAudioPlaying = true;
        updateAudioUI(true);
      }
    }
  }

  function updateAudioUI(playing) {
    if (playing) {
      musicToggle.classList.add('playing');
    } else {
      musicToggle.classList.remove('playing');
    }
  }

  // Web Audio Synthesizer fallback for lush ambient harmony
  function setupWebAudioFallback() {
    // Ready to trigger on first button click
  }

  function startWebAudioFallback() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!webAudioCtx) webAudioCtx = new AudioCtx();
      if (webAudioCtx.state === 'suspended') webAudioCtx.resume();
      
      stopWebAudioFallback();
      
      const freqs = [196.00, 246.94, 293.66, 392.00, 493.88]; // Ambient G-major chord
      freqs.forEach((freq, idx) => {
        const osc = webAudioCtx.createOscillator();
        const gain = webAudioCtx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, webAudioCtx.currentTime);
        
        // Gentle LFO modulation
        const lfo = webAudioCtx.createOscillator();
        const lfoGain = webAudioCtx.createGain();
        lfo.frequency.value = 0.2 + idx * 0.05;
        lfoGain.gain.value = 3.0;
        lfo.connect(osc.frequency);
        lfo.start();
        
        gain.gain.setValueAtTime(0.01, webAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, webAudioCtx.currentTime + 3.0);
        
        osc.connect(gain);
        gain.connect(webAudioCtx.destination);
        osc.start();
        
        synthOscillators.push({ osc, gain, lfo });
      });
    } catch(e) {
      console.log("Web Audio synth fallback active", e);
    }
  }

  function stopWebAudioFallback() {
    synthOscillators.forEach(item => {
      try {
        item.gain.gain.exponentialRampToValueAtTime(0.0001, webAudioCtx.currentTime + 0.5);
        setTimeout(() => {
          item.osc.stop();
          item.lfo.stop();
        }, 500);
      } catch(e){}
    });
    synthOscillators = [];
  }

  musicToggle.addEventListener('click', toggleAudio);


  /* --------------------------------------------------------------------------
   * 2. CANVAS PARTICLES SYSTEM (Dust & Gold Ambient Motfs)
   * -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 65;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (currentPage === 2) {
      updateCarouselLayout();
    }
  });
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * -0.5 - 0.1;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.4 ? 'rgba(229, 193, 88,' : 'rgba(255, 255, 255,';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
        this.y = canvas.height + 10;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = 'rgba(229, 193, 88, 0.5)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  /* --------------------------------------------------------------------------
   * 3. PAGE NAVIGATION MANAGER
   * -------------------------------------------------------------------------- */
  const pages = {
    0: document.getElementById('page0'),
    1: document.getElementById('page1'),
    2: document.getElementById('page2'),
    3: document.getElementById('page3'),
    4: document.getElementById('page4')
  };

  let currentPage = 0;

  function goToPage(pageNum) {
    if (pageNum === currentPage || !pages[pageNum]) return;
    
    // Hide current page
    pages[currentPage].classList.remove('active-page');
    
    currentPage = pageNum;
    pages[currentPage].classList.add('active-page');

    // Show floating music toggle after Starter Page or when playing
    if (currentPage >= 1 && isAudioPlaying) {
      musicToggle.classList.remove('hidden');
    }

    // Trigger page-specific events
    if (currentPage === 2) {
      updateCarouselLayout();
      startAutoRotate();
    } else {
      stopAutoRotate();
      if (currentPage === 3) {
        startLetterTypingSequence();
      } else if (currentPage === 4) {
        startLotusBloomSequence();
      }
    }
  }

  function triggerLightBurst() {
    const burst = document.createElement('div');
    burst.className = 'light-burst-overlay active';
    document.body.appendChild(burst);
    setTimeout(() => {
      burst.style.opacity = '0';
      setTimeout(() => burst.remove(), 400);
    }, 280);
  }

  // Page 0 "OPEN THE SURPRISE ✨" Button
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  if (openSurpriseBtn) {
    openSurpriseBtn.addEventListener('click', () => {
      initAudio();
      triggerLightBurst();
      goToPage(1);
    });
  }

  // Page 1 "Begin The Journey" Button
  document.getElementById('startJourneyBtn').addEventListener('click', () => {
    initAudio();
    goToPage(2);
  });

  // Page 2 Button -> Page 3
  document.getElementById('goToPage3Btn').addEventListener('click', () => {
    goToPage(3);
  });

  // Page 3 Button -> Page 4
  document.getElementById('goToPage4Btn').addEventListener('click', () => {
    goToPage(4);
  });

  // Replay Button on Page 4
  document.getElementById('replayBtn').addEventListener('click', () => {
    resetLotusAndText();
    goToPage(1);
  });


  /* --------------------------------------------------------------------------
   * 4. PAGE 2: 3D CIRCULAR Orbit PHOTO CAROUSEL ENGINE
   * -------------------------------------------------------------------------- */
  const carouselTrack = document.getElementById('carouselTrack');
  const cards = Array.from(document.querySelectorAll('.carousel-card'));
  const carouselDotsContainer = document.getElementById('carouselDots');
  const totalCards = cards.length;
  
  let currentAngle = 0;
  let targetAngle = 0;
  let activeIndex = 0;
  let isDragging = false;
  let startX = 0;
  let dragAngleStart = 0;

  // Create pagination dots
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => rotateToCard(idx));
    carouselDotsContainer.appendChild(dot);
  });

  function updateCarouselLayout() {
    const angleStep = 360 / totalCards;
    const w = window.innerWidth;
    
    // Dynamic radial distances based on screen width ranges
    let rx = 240;
    let rz = 250;
    let scaleBoost = 0.35;

    if (w < 480) { // Mobile (360px - 430px)
      rx = 110;
      rz = 130;
      scaleBoost = 0.32;
    } else if (w < 768) { // Medium Mobile / Small Tablet
      rx = 150;
      rz = 170;
      scaleBoost = 0.35;
    } else if (w < 1440) { // HD / Standard Laptop
      rx = 230;
      rz = 240;
      scaleBoost = 0.35;
    } else if (w < 2560) { // QHD 1440p
      rx = 320;
      rz = 340;
      scaleBoost = 0.38;
    } else { // 4K Ultra HD
      rx = 420;
      rz = 450;
      scaleBoost = 0.42;
    }

    let closestIndex = 0;
    let maxZ = -Infinity;

    cards.forEach((card, idx) => {
      // Calculate angle in radians
      const cardAngleDeg = currentAngle + idx * angleStep;
      const rad = (cardAngleDeg * Math.PI) / 180;

      const x = Math.sin(rad) * rx;
      const z = Math.cos(rad) * rz;
      
      // Calculate scale, opacity & depth blur based on Z coordinate
      const zNorm = (z + rz) / (2 * rz); // 0 to 1
      const scale = 0.65 + zNorm * scaleBoost;
      const opacity = 0.35 + zNorm * 0.65; // 0.35 to 1.0
      const blur = (1 - zNorm) * 4; // 0px to 4px blur

      if (z > maxZ) {
        maxZ = z;
        closestIndex = idx;
      }

      // Apply 3D position
      card.style.transform = `translate3d(${x}px, 0px, ${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = Math.round(zNorm * 100);
      
      card.classList.remove('is-center');
    });

    // Highlight center card
    cards[closestIndex].classList.add('is-center');
    activeIndex = closestIndex;

    // Update dots
    const dots = Array.from(carouselDotsContainer.children);
    dots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === activeIndex);
    });
  }

  function rotateToCard(index) {
    const angleStep = 360 / totalCards;
    targetAngle = -index * angleStep;
    animateCarouselRotation();
  }

  function animateCarouselRotation() {
    currentAngle += (targetAngle - currentAngle) * 0.15;
    updateCarouselLayout();
    if (Math.abs(targetAngle - currentAngle) > 0.05) {
      requestAnimationFrame(animateCarouselRotation);
    } else {
      currentAngle = targetAngle;
      updateCarouselLayout();
    }
  }

  // Next / Prev controls
  document.getElementById('nextPhotoBtn').addEventListener('click', () => {
    targetAngle -= 360 / totalCards;
    animateCarouselRotation();
  });

  document.getElementById('prevPhotoBtn').addEventListener('click', () => {
    targetAngle += 360 / totalCards;
    animateCarouselRotation();
  });

  // Card click to center
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (idx !== activeIndex) {
        rotateToCard(idx);
      }
    });
  });

  // Mouse Drag / Touch Swipe Controls
  const stage = document.getElementById('carouselStage');

  function handleDragStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    dragAngleStart = currentAngle;
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diffX = currentX - startX;
    currentAngle = dragAngleStart + diffX * 0.4;
    updateCarouselLayout();
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    // Snap to nearest photo angle
    const angleStep = 360 / totalCards;
    targetAngle = Math.round(currentAngle / angleStep) * angleStep;
    animateCarouselRotation();
  }

  // Auto-Rotate Carousel Engine (Rotates every 3.2 seconds automatically)
  let autoRotateTimer = null;

  function startAutoRotate() {
    stopAutoRotate();
    autoRotateTimer = setInterval(() => {
      if (!isDragging && currentPage === 2) {
        targetAngle -= 360 / totalCards;
        animateCarouselRotation();
      }
    }, 3200);
  }

  function stopAutoRotate() {
    if (autoRotateTimer) {
      clearInterval(autoRotateTimer);
      autoRotateTimer = null;
    }
  }

  stage.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);

  stage.addEventListener('touchstart', handleDragStart, { passive: true });
  window.addEventListener('touchmove', handleDragMove, { passive: true });
  window.addEventListener('touchend', handleDragEnd);

  stage.addEventListener('mouseenter', stopAutoRotate);
  stage.addEventListener('mouseleave', () => {
    if (currentPage === 2) startAutoRotate();
  });

  // Initial carousel placement & auto-rotation
  updateCarouselLayout();


  /* --------------------------------------------------------------------------
   * 5. PAGE 3: REALISTIC LETTER TYPING ENGINE
   * -------------------------------------------------------------------------- */
  const letterMessage = `Dear Kukki Dada ❤️,

Happy Birthday!

I've always looked up to you, not just because you are my elder brother, but because of the person you are.

You've always been someone I can learn from, someone I can look up to, and someone whose presence gives me confidence.

Life has taken you to places and responsibilities that make me genuinely proud to call you my brother.

For me, though, you'll always be my Kukki Dada — the same person I can joke with, annoy, learn from, and share countless memories with.

I hope this birthday brings you happiness, peace, success and many more unforgettable moments.

May you always stay strong, keep achieving everything you dream of, and continue inspiring everyone around you.

And no matter how far life takes you or how busy things become, remember that your little brother will always be cheering for you.

Proud of you, Dada.

Happy Birthday once again! 🎂❤️

With lots of love,
Your Little Brother ❤️`;

  const typewriterTarget = document.getElementById('typewriterTarget');
  const typingCursor = document.getElementById('typingCursor');
  const letterWrapper = document.getElementById('letterWrapper');
  const p3PostLetter = document.getElementById('p3PostLetter');

  let letterIndex = 0;
  let isTypingStarted = false;

  function startLetterTypingSequence() {
    if (isTypingStarted) return;
    isTypingStarted = true;
    
    typewriterTarget.textContent = '';
    typingCursor.style.display = 'inline-block';
    letterIndex = 0;
    
    setTimeout(typeNextCharacter, 600);
  }

  function typeNextCharacter() {
    if (letterIndex < letterMessage.length) {
      const char = letterMessage.charAt(letterIndex);
      typewriterTarget.textContent += char;
      letterIndex++;
      
      // Auto-scroll letter paper container during typing
      const letterPaper = document.getElementById('letterPaper');
      if (letterPaper) {
        letterPaper.scrollTop = letterPaper.scrollHeight;
      }

      // Realistic typing cadence pause calculation
      let delay = Math.random() * 25 + 20; // Default 20-45ms
      if (char === '.' || char === '!' || char === '?') {
        delay = 320; // Pause at end of sentence
      } else if (char === ',') {
        delay = 160; // Pause at comma
      } else if (char === '\n') {
        delay = 220; // Pause at line break
      }

      setTimeout(typeNextCharacter, delay);
    } else {
      // Typing completed!
      typingCursor.style.display = 'none';
      letterWrapper.classList.add('glow-complete');
      
      // Reveal post letter message and auto-scroll into view
      setTimeout(() => {
        p3PostLetter.classList.remove('hidden-opacity');
        p3PostLetter.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 600);

      // Also allow clicking the letter card itself to proceed to Page 4
      letterWrapper.addEventListener('click', () => {
        goToPage(4);
      }, { once: true });
    }
  }


  /* --------------------------------------------------------------------------
   * 6. PAGE 4: STAGE-BY-STAGE LOTUS BLOOM & CLIMAX SEQUENCE
   * -------------------------------------------------------------------------- */
  const stemPath = document.getElementById('stemPath');
  const leafLeft = document.getElementById('leafLeft');
  const leafRight = document.getElementById('leafRight');
  const lotusSvg = document.getElementById('lotusSvg');

  // Petals array in exact blooming sequence
  const petals = [
    document.getElementById('petal1'), // 1. Back petal
    document.getElementById('petal2'), // 2. Left petal
    document.getElementById('petal3'), // 3. Right petal
    document.getElementById('petal4'), // 4. Front-left petal
    document.getElementById('petal5'), // 5. Front-right petal
    document.getElementById('petal6'), // 6. Inner petals
    document.getElementById('petal7')  // 7. Center petals/core
  ];

  const climax1 = document.getElementById('climax1');
  const climax2 = document.getElementById('climax2');
  const climax3 = document.getElementById('climax3');
  const climax4Group = document.getElementById('climax4Group');
  const climaxFinalBadge = document.getElementById('climaxFinalBadge');

  let isLotusBloomStarted = false;

  function startLotusBloomSequence() {
    if (isLotusBloomStarted) return;
    isLotusBloomStarted = true;

    // Reset initial states
    resetLotusAndText();

    // STAGE 1: STEM GROWTH (0s - 3.5s)
    setTimeout(() => {
      stemPath.classList.add('grown');
    }, 300);

    // STAGE 2: FIRST LEAVES (3.5s - 5.0s)
    setTimeout(() => {
      leafLeft.classList.add('unfolded');
    }, 3200);

    setTimeout(() => {
      leafRight.classList.add('unfolded');
    }, 4000);

    // STAGE 3: LOTUS BLOOM PETAL BY PETAL (5.2s onwards)
    const bloomStartDelay = 5200;
    const petalStagger = 750; // 750ms delay per petal for dramatic viewing

    petals.forEach((petal, idx) => {
      setTimeout(() => {
        if (petal) petal.classList.add('bloomed');
        
        // Spawn small golden particle burst at petal location
        createPetalSparkle(200, 210);
      }, bloomStartDelay + idx * petalStagger);
    });

    // FINAL ILLUMINATION & CLIMAX TEXT REVEAL
    const totalBloomDuration = bloomStartDelay + petals.length * petalStagger + 600;

    setTimeout(() => {
      // Glow entire flower
      lotusSvg.classList.add('fully-illuminated');

      // Reveal Final Messages Step-by-Step
      setTimeout(() => {
        climax1.style.opacity = '1';
        climax1.style.transform = 'translateY(0)';
      }, 800);

      setTimeout(() => {
        climax2.style.opacity = '1';
        climax2.style.transform = 'translateY(0)';
      }, 2400);

      setTimeout(() => {
        climax3.style.opacity = '1';
        climax3.style.transform = 'translateY(0)';
      }, 4000);

      setTimeout(() => {
        climax4Group.style.opacity = '1';
        climax4Group.style.transform = 'translateY(0)';
      }, 5800);

      setTimeout(() => {
        climaxFinalBadge.style.opacity = '1';
        climaxFinalBadge.style.transform = 'translateY(0)';
      }, 7600);

    }, totalBloomDuration);
  }

  function createPetalSparkle(cx, cy) {
    // Simple visual effect helper
    for (let i = 0; i < 5; i++) {
      const p = new Particle();
      p.x = window.innerWidth / 2 + (Math.random() * 60 - 30);
      p.y = window.innerHeight / 2 - 40 + (Math.random() * 60 - 30);
      p.size = Math.random() * 3 + 2;
      p.color = 'rgba(255, 215, 0,';
      particles.push(p);
    }
  }

  function resetLotusAndText() {
    isLotusBloomStarted = false;
    
    stemPath.classList.remove('grown');
    leafLeft.classList.remove('unfolded');
    leafRight.classList.remove('unfolded');
    lotusSvg.classList.remove('fully-illuminated');

    petals.forEach(p => {
      if (p) p.classList.remove('bloomed');
    });

    [climax1, climax2, climax3, climax4Group, climaxFinalBadge].forEach(el => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      }
    });
  }

});
