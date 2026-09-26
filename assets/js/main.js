
(() => {
  const nav = document.querySelector('.site-nav');
  const backTop = document.getElementById('backTop');
  const onScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
    backTop?.classList.toggle('show', window.scrollY > 500);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const desktop = window.matchMedia('(min-width: 992px)');
  const dropdownItems = [...document.querySelectorAll('.mega-dropdown')];

  const closeMobileDropdown = item => {
    const toggle = item.querySelector(':scope > .dropdown-toggle');
    const menu = item.querySelector(':scope > .mega-menu');
    item.classList.remove('show', 'mobile-open');
    toggle?.classList.remove('show');
    menu?.classList.remove('show');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  const closeOtherMobileDropdowns = current => {
    dropdownItems.forEach(item => {
      if (item !== current) closeMobileDropdown(item);
    });
  };

  dropdownItems.forEach(item => {
    let timer;
    const toggle = item.querySelector(':scope > .dropdown-toggle');
    const menu = item.querySelector(':scope > .mega-menu');

    // Desktop: hover to open/close.
    item.addEventListener('mouseenter', () => {
      if (!desktop.matches) return;
      clearTimeout(timer);
      dropdownItems.forEach(x => {
        if (x !== item) x.classList.remove('show');
      });
      item.classList.add('show');
    });

    item.addEventListener('mouseleave', () => {
      if (!desktop.matches) return;
      timer = setTimeout(() => item.classList.remove('show'), 90);
    });

    // Tablet/mobile: click the parent menu item to toggle its submenu.
    // stopPropagation prevents Bootstrap's document-level dropdown handler
    // from running a second toggle on the same tap.
    toggle?.addEventListener('click', e => {
      if (desktop.matches) return;

      e.preventDefault();
      e.stopPropagation();

      const willOpen = !item.classList.contains('mobile-open');
      closeOtherMobileDropdowns(item);

      item.classList.toggle('show', willOpen);
      item.classList.toggle('mobile-open', willOpen);
      toggle.classList.toggle('show', willOpen);
      menu?.classList.toggle('show', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Close an open mobile submenu when tapping outside the navigation item.
  document.addEventListener('click', e => {
    if (desktop.matches) return;
    if (!e.target.closest('.mega-dropdown')) {
      dropdownItems.forEach(closeMobileDropdown);
    }
  });

  // Reset mobile-only state when moving back to desktop width.
  const resetDropdownState = () => {
    if (!desktop.matches) return;
    dropdownItems.forEach(item => {
      item.classList.remove('mobile-open');
      item.querySelector(':scope > .mega-menu')?.classList.remove('show');
      item.querySelector(':scope > .dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };
  desktop.addEventListener?.('change', resetDropdownState);

  document.querySelectorAll('.mega-link, .navbar-nav > .nav-item:not(.dropdown) .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        const el = document.getElementById('mainNav');
        const instance = bootstrap.Collapse.getInstance(el);
        instance?.hide();
      }
    });
  });

  document.querySelectorAll('[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const alert = form.querySelector('.form-status');
      if (alert) {
        alert.classList.remove('d-none');
        alert.textContent = 'Demo only: connect this form to your backend or email service before publishing.';
      }
    });
  });
})();


/* membership application interactions */
(() => {
  const form = document.getElementById('membershipApplicationForm');
  if (!form) return;

  const photoInput = document.getElementById('passportPhoto');
  const photoPreview = document.getElementById('photoPreview');
  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file || !photoPreview) return;
    const reader = new FileReader();
    reader.onload = e => {
      photoPreview.innerHTML = `<img src="${e.target.result}" alt="Applicant passport photo preview">`;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', e => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      form.classList.add('was-validated');
      const firstInvalid = form.querySelector(':invalid');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid?.focus({ preventScroll: true });
    }
  }, true);
})();



/* AHDF homepage interactions */
(() => {
  const counters = document.querySelectorAll('.counter, .counter-decimal');

  const animateCounter = el => {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    const target = Number(el.dataset.target || 0);
    const decimal = el.classList.contains('counter-decimal');
    const duration = 1500;
    const start = performance.now();

    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimal ? value.toFixed(1) : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: .35 });

    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const filterButtons = document.querySelectorAll('[data-gallery-filter]');
  const galleryItems = document.querySelectorAll('.gallery-item[data-gallery-type]');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.galleryFilter;

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      galleryItems.forEach(item => {
        const visible = filter === 'all' || item.dataset.galleryType === filter;
        item.classList.toggle('is-hidden', !visible);
      });
    });
  });
})();

