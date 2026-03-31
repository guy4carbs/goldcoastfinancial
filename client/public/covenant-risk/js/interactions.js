(function() {
  'use strict';

  // ========================================
  // 1. MAGNETIC CTA BUTTONS
  // ========================================
  document.querySelectorAll('.btn-primary').forEach(function(btn) {
    var RADIUS = 80;
    var STRENGTH = 12;

    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      var dist = Math.sqrt(x * x + y * y);

      if (dist < RADIUS) {
        var pull = (1 - dist / RADIUS) * STRENGTH;
        btn.style.transform = 'translate(' + (x * pull / RADIUS) + 'px, ' + (y * pull / RADIUS - 2) + 'px)';
      }
    });

    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });

  // ========================================
  // 2. CUSTOM CURSOR (removed — using default)
  // ========================================

  // ========================================
  // 3. PARALLAX HERO
  // ========================================
  var heroContent = document.querySelector('.hero-content');
  var heroGrid = document.querySelector('.hero-grid');
  var heroCompass = document.querySelector('.hero-compass');

  if (heroContent && window.innerWidth > 767) {
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scrollY * 0.25) + 'px)';
        heroContent.style.opacity = String(1 - (scrollY / (window.innerHeight * 0.8)));
        if (heroGrid) {
          heroGrid.style.transform = 'translateY(' + (scrollY * 0.1) + 'px)';
        }
        if (heroCompass) {
          heroCompass.style.transform = 'translateY(calc(-50% + ' + (scrollY * 0.08) + 'px))';
          heroCompass.style.opacity = String(0.08 * (1 - (scrollY / (window.innerHeight * 1.2))));
        }
      }
    }, { passive: true });
  }

  // ========================================
  // 4. ANIMATED LINK UNDERLINES IN NAV
  // ========================================
  document.querySelectorAll('.nav-links a:not(.btn-nav)').forEach(function(link) {
    link.classList.add('animated-underline');
  });

  // ========================================
  // 5. TILT EFFECT ON CARDS
  // ========================================
  if (window.innerWidth > 1024) {
    document.querySelectorAll('.card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = (0.5 - y) * 6;
        var rotateY = (x - 0.5) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ========================================
  // 6. COUNTER ANIMATION FOR STATS
  // ========================================
  var counted = false;
  var statsSection = document.getElementById('stats');

  if (statsSection) {
    var statsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !counted) {
          counted = true;
          document.querySelectorAll('[data-count]').forEach(function(el) {
            var target = parseInt(el.dataset.count);
            var current = 0;
            var step = Math.max(1, Math.floor(target / 30));
            var timer = setInterval(function() {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = current;
            }, 40);
          });
          statsObserver.unobserve(statsSection);
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  // ========================================
  // 7. SCROLL PROGRESS BAR
  // ========================================
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ========================================
  // 8. FAQ ACCORDION
  // ========================================
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function() {
      var isOpen = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(function(other) {
        other.classList.remove('active');
        var otherBtn = other.querySelector('.faq-question');
        var otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.setAttribute('hidden', '');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });

})();
