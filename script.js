(() => {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const mobileCta = document.getElementById('mobileCta');
  const form = document.getElementById('consultForm');
  const submitBtn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');

  // Header scroll state
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  let closeMenu = () => {};
  if (menuToggle && mainNav) {
    closeMenu = () => {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('open');
    };
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      mainNav.classList.toggle('open', open);
    });
    mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Mobile sticky CTA
  if (mobileCta) {
    const hero = document.getElementById('hero');
    const leadForm = document.getElementById('lead-form');
    const updateCta = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      if (!mobile) { mobileCta.classList.remove('visible'); return; }
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const formRect = leadForm ? leadForm.getBoundingClientRect() : null;
      const formVisible = formRect ? (formRect.top < window.innerHeight && formRect.bottom > 0) : false;
      const show = heroBottom < 0 && !formVisible;
      mobileCta.classList.toggle('visible', show);
    };
    window.addEventListener('scroll', updateCta, { passive: true });
    window.addEventListener('resize', updateCta);
    updateCta();
  }

  // Phone formatting
  const phoneInput = document.getElementById('phone');
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    let d = digits;
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d.startsWith('9')) d = '7' + d;
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = '+7';
    if (p.length > 0) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    return { formatted: out, digits: d };
  };
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const { formatted } = formatPhone(e.target.value);
      e.target.value = formatted;
      clearError(phoneInput, 'phoneError');
    });
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value.trim()) phoneInput.value = '+7 (';
    });
  }

  function setError(input, errorId, message) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = message;
    if (input && input.type !== 'checkbox') input.classList.add('invalid');
  }
  function clearError(input, errorId) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = '';
    if (input && input.type !== 'checkbox') input.classList.remove('invalid');
  }

  // Lead dialog
  const leadDialog = document.getElementById('leadDialog');
  const openLead = () => { if (leadDialog?.showModal) leadDialog.showModal(); };
  const closeLead = () => { if (leadDialog?.close) leadDialog.close(); };
  document.querySelectorAll('[data-open-lead]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); openLead(); }));
  document.querySelectorAll('[data-close-lead]').forEach((el) => el.addEventListener('click', closeLead));
  document.querySelectorAll('a[href="#lead-form"]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenu();
    openLead();
  }));
  if (leadDialog) {
    leadDialog.addEventListener('click', (e) => {
      const rect = leadDialog.getBoundingClientRect();
      const inDialog = rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
      if (!inDialog) closeLead();
    });
  }

  // Privacy dialog
  const privacyDialog = document.getElementById('privacyDialog');
  const openPrivacy = () => { if (privacyDialog?.showModal) privacyDialog.showModal(); };
  const closePrivacy = () => { if (privacyDialog?.close) privacyDialog.close(); };
  document.querySelectorAll('[data-open-privacy]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); openPrivacy(); }));
  document.querySelectorAll('[data-close-privacy]').forEach((el) => el.addEventListener('click', closePrivacy));
  if (privacyDialog) {
    privacyDialog.addEventListener('click', (e) => {
      const rect = privacyDialog.getBoundingClientRect();
      const inDialog = rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
      if (!inDialog) closePrivacy();
    });
  }

  // Form validation & submit
  if (form) {
    const nameInput = document.getElementById('name');
    const methodInput = document.getElementById('contactMethod');
    const consentInput = document.getElementById('consent');

    const validate = () => {
      let ok = true;
      const name = nameInput.value.trim();
      if (!name) { setError(nameInput, 'nameError', 'Пожалуйста, укажите ваше имя.'); ok = false; }
      else if (name.length < 2) { setError(nameInput, 'nameError', 'Имя должно содержать не менее 2 символов.'); ok = false; }
      else clearError(nameInput, 'nameError');

      const phoneDigits = phoneInput.value.replace(/\D/g, '');
      if (!phoneDigits || phoneDigits.length < 11) { setError(phoneInput, 'phoneError', 'Введите корректный номер телефона.'); ok = false; }
      else clearError(phoneInput, 'phoneError');

      if (!methodInput.value) { setError(methodInput, 'contactMethodError', 'Выберите удобный способ связи.'); ok = false; }
      else clearError(methodInput, 'contactMethodError');

      if (!consentInput.checked) { setError(consentInput, 'consentError', 'Необходимо согласие на обработку персональных данных.'); ok = false; }
      else clearError(consentInput, 'consentError');

      return ok;
    };

    [nameInput, methodInput, consentInput].forEach((el) => {
      if (!el) return;
      const event = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(event, () => {
        if (el === nameInput) clearError(nameInput, 'nameError');
        if (el === methodInput) clearError(methodInput, 'contactMethodError');
        if (el === consentInput) clearError(consentInput, 'consentError');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      success.hidden = true;
      if (!validate()) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';
      try {
        // Simulate form submission. In production, replace with a real endpoint.
        await new Promise((r) => setTimeout(r, 900));
        form.reset();
        if (phoneInput) phoneInput.value = '';
        success.hidden = false;
        submitBtn.textContent = 'Заявка отправлена';
        setTimeout(() => { submitBtn.disabled = false; submitBtn.textContent = 'Записаться на консультацию'; }, 3000);
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Записаться на консультацию';
        setError(phoneInput, 'phoneError', 'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь по телефону.');
      }
    });
  }
})();
