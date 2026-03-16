/* ══════════════════════════════════════════
   EPIC LOADER — Three.js Particle Universe
══════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('loader-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ── Gold particle field ──
  const count = 2200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const speeds    = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    sizes[i]  = Math.random() * 2.5 + 0.5;
    speeds[i] = Math.random() * 0.004 + 0.001;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xB8965A,
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ── Secondary dim particles ──
  const geo2 = new THREE.BufferGeometry();
  const pos2 = new Float32Array(800 * 3);
  for (let i = 0; i < 800; i++) {
    pos2[i*3]   = (Math.random()-0.5)*30;
    pos2[i*3+1] = (Math.random()-0.5)*30;
    pos2[i*3+2] = (Math.random()-0.5)*20;
  }
  geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
  const mat2 = new THREE.PointsMaterial({ color: 0xF5F0E8, size: 0.02, transparent: true, opacity: 0.0, depthWrite: false });
  const particles2 = new THREE.Points(geo2, mat2);
  scene.add(particles2);

  // ── Connecting lines ──
  const lineGeo = new THREE.BufferGeometry();
  const linePts = [];
  for (let i = 0; i < 18; i++) {
    const x1 = (Math.random()-0.5)*16, y1 = (Math.random()-0.5)*10, z1 = (Math.random()-0.5)*6;
    const x2 = x1 + (Math.random()-0.5)*4,  y2 = y1 + (Math.random()-0.5)*4,  z2 = z1;
    linePts.push(x1,y1,z1, x2,y2,z2);
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePts), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xB8965A, transparent: true, opacity: 0.0 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ── Rotating gold ring ──
  const ringGeo = new THREE.TorusGeometry(1.8, 0.003, 8, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xB8965A, transparent: true, opacity: 0.0 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.8;
  scene.add(ring);

  const ring2Geo = new THREE.TorusGeometry(2.6, 0.002, 8, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xB8965A, transparent: true, opacity: 0.0 });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.rotation.z = Math.PI / 5;
  scene.add(ring2);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate() {
    if (!document.getElementById('loader') || document.getElementById('loader').classList.contains('hidden')) return;
    requestAnimationFrame(animate);
    t += 0.005;

    // Fade in
    const fade = Math.min(t / 0.5, 1);
    mat.opacity  = fade * 0.75;
    mat2.opacity = fade * 0.2;
    lineMat.opacity = fade * 0.12;
    ringMat.opacity = fade * 0.18;
    ring2Mat.opacity = fade * 0.1;

    // Breathe & rotate
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.3) * 0.06;
    particles2.rotation.y = -t * 0.02;
    ring.rotation.z  = t * 0.25;
    ring2.rotation.y = t * 0.15;

    // Ripple particle positions
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i*3+1] += speeds[i] * Math.sin(t + i * 0.1) * 0.012;
      if (pos[i*3+1] > 11) pos[i*3+1] = -11;
    }
    geo.attributes.position.needsUpdate = true;

    // Camera drift
    camera.position.x = Math.sin(t * 0.15) * 0.4;
    camera.position.y = Math.cos(t * 0.1) * 0.25;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // ── Progress counter ──
  const bar  = document.getElementById('loader-bar');
  const pct  = document.getElementById('loader-pct');
  const glitchEl = document.getElementById('loader-glitch');
  const timeEl   = document.getElementById('loader-time');

  const phases = [
    'Initialising system...',
    'Loading assets...',
    'Compiling portfolio...',
    'Rendering components...',
    'Almost ready...',
  ];
  let progress = 0;
  let phaseIdx = 0;

  // Glitch text effect
  const glitchChars = '!<>-_\\/[]{}—=+*^?#░▒▓';
  function glitchText(target, text, cb) {
    let itr = 0;
    const interval = setInterval(() => {
      glitchEl.textContent = text.split('').map((c, i) => {
        if (i < itr) return text[i];
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }).join('');
      if (itr >= text.length) { clearInterval(interval); glitchEl.textContent = text; if(cb) cb(); }
      itr += 1.4;
    }, 28);
  }

  glitchText(glitchEl, phases[0]);

  const progressInterval = setInterval(() => {
    progress += Math.random() * 3.5 + 0.8;
    if (progress > 100) progress = 100;

    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    const newPhase = Math.floor((progress / 100) * phases.length);
    if (newPhase !== phaseIdx && newPhase < phases.length) {
      phaseIdx = newPhase;
      glitchText(glitchEl, phases[phaseIdx]);
    }

    if (progress >= 100) {
      clearInterval(progressInterval);
      glitchText(glitchEl, '[ READY ]', () => {
        setTimeout(() => {
          // Explosion exit — zoom + fade
          const loader = document.getElementById('loader');
          loader.style.transition = 'opacity 1.4s cubic-bezier(0.77,0,0.18,1), transform 1.4s cubic-bezier(0.77,0,0.18,1)';
          loader.style.transform  = 'scale(1.08)';
          loader.classList.add('hidden');
        }, 500);
      });
    }
  }, 55);

  // Live clock in corner
  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toTimeString().slice(0,8);
  }
  updateTime();
  setInterval(updateTime, 1000);
})();

// ── MENU TOGGLE ──
const menuToggle = document.getElementById('menu-toggle');
const fullMenu   = document.getElementById('full-menu');
const mainNav    = document.getElementById('main-nav');
let menuOpen = false;

menuToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  fullMenu.classList.toggle('open', menuOpen);
  mainNav.classList.toggle('menu-open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});

// ── ANIMATED SECTION TRANSITIONS ──
const pt = document.getElementById('page-transition');

function scrollToSection(targetId) {
  // 1. Close menu if open
  if (menuOpen) {
    menuOpen = false;
    fullMenu.classList.remove('open');
    mainNav.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  const target = document.querySelector(targetId);
  if (!target) return;

  // 2. Panels sweep UP (enter)
  pt.classList.remove('leaving');
  pt.classList.add('entering');

  // 3. After panels cover screen, scroll instantly
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'instant' });

    // 4. Panels sweep DOWN (leave)
    setTimeout(() => {
      pt.classList.remove('entering');
      pt.classList.add('leaving');

      // 5. Clean up
      setTimeout(() => {
        pt.classList.remove('leaving');
      }, 700);
    }, 120);
  }, 600);
}

// Attach to all nav/menu anchor links
document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      scrollToSection(href);
    }
  });
});

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Smooth ring follow
function animateCursor() {
  const cx = parseFloat(cursor.style.left) || 0;
  const cy = parseFloat(cursor.style.top)  || 0;
  rx += (cx - rx) * 0.35;
  ry += (cy - ry) * 0.35;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor enlarges on hover
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '18px'; cursor.style.height = '18px';
    ring.style.width = '54px'; ring.style.height = '54px'; ring.style.opacity = '0.3';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = ''; cursor.style.height = '';
    ring.style.width = ''; ring.style.height = ''; ring.style.opacity = '';
  });
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// Nav active highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + entry.target.id
          ? 'var(--ink)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

/* ════════════════════════════════════════
   SECTION-LEVEL ANIMATION ENGINE
════════════════════════════════════════ */

// ── 1. Bio paragraphs: wrap each sentence in a line reveal ──
function initBio() {
  document.querySelectorAll('.js-bio p').forEach((p, pi) => {
    const text = p.textContent.trim();
    const wrapped = `<span class="bio-line" style="transition-delay:${0.1 + pi * 0.12}s"><span class="bio-line-inner">${text}</span></span>`;
    p.innerHTML = wrapped;
    p.style.display = 'block';
    p.style.marginBottom = '1.2rem';
  });
}
initBio();

// ── 2. Stat counters ──
function animateCount(el, target, suffix, duration = 1200) {
  if (target === 0) return;
  const numEl = el.querySelector('.stat-num');
  const suffixSpan = numEl.querySelector('span');
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    numEl.childNodes[0].textContent = value;
    if (progress < 1) requestAnimationFrame(step);
    else numEl.childNodes[0].textContent = target;
  }
  requestAnimationFrame(step);
}

// ── 3. Char scramble on edu-school ──
const glitchCharsAnim = '!<>-_\\/[]{}—=+*^?#░▒';
function scrambleText(el) {
  const original = el.textContent;
  let frame = 0;
  const totalFrames = 20;
  const interval = setInterval(() => {
    el.textContent = original.split('').map((c, i) => {
      if (c === ' ') return ' ';
      if (i < (frame / totalFrames) * original.length) return original[i];
      return glitchCharsAnim[Math.floor(Math.random() * glitchCharsAnim.length)];
    }).join('');
    frame++;
    if (frame > totalFrames) { clearInterval(interval); el.textContent = original; }
  }, 40);
}

// ── 4. Contact words: split into word spans ──
function initContactWords() {
  document.querySelectorAll('.js-contact-words').forEach(el => {
    // Words are already split in HTML, just add inner spans if needed
    el.querySelectorAll('.contact-word').forEach(word => {
      if (!word.querySelector('.contact-word-inner')) {
        word.innerHTML = `<span class="contact-word-inner">${word.textContent}</span>`;
      }
    });
  });
}
initContactWords();

// ── 5. Master IntersectionObserver for rich animations ──
const richObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Bio lines
    el.querySelectorAll('.bio-line').forEach(line => line.classList.add('visible'));

    // About label
    const label = el.querySelector('.about-label');
    if (label) setTimeout(() => label.classList.add('visible'), 200);

    // Stat counters
    el.querySelectorAll('.stat-item[data-count]').forEach((stat, i) => {
      const count = parseInt(stat.dataset.count);
      if (count > 0) setTimeout(() => animateCount(stat, count, stat.dataset.suffix), i * 120);
    });

    // Scramble
    el.querySelectorAll('.js-scramble').forEach(s => setTimeout(() => scrambleText(s), 400));

    // Contact words
    el.querySelectorAll('.contact-word').forEach(w => w.classList.add('visible'));
    el.querySelectorAll('.contact-link, .contact-social-link').forEach(l => l.classList.add('visible'));

    richObserver.unobserve(el);
  });
}, { threshold: 0.15 });

document.querySelectorAll('#about, #skills, #projects, #contact').forEach(s => richObserver.observe(s));

// ── 6. Skill category individual observer ──
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-category').forEach(sc => skillObserver.observe(sc));

// ── 7. Project items individual observer ──
const projObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      projObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.project-item').forEach(p => projObserver.observe(p));

// ── 8. Contact links individual observer ──
const contactObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.contact-link, .contact-social-link').forEach(l => l.classList.add('visible'));
      contactObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.contact-links').forEach(cl => contactObs.observe(cl));

// ── 9. Contact statement words observer ──
const contactWordObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.contact-word').forEach(w => w.classList.add('visible'));
      contactWordObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.contact-statement').forEach(cs => contactWordObs.observe(cs));
