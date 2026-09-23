/* AnyBizHub. No trackers, cookies, browser storage, external requests or dependencies. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (menu && nav) {
    const closeMenu = (restoreFocus = false) => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
      if (restoreFocus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !isOpen);
      menu.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 650) closeMenu();
    }, { passive: true });
  }

  document.querySelectorAll('.print-button').forEach(button => {
    button.addEventListener('click', () => window.print());
  });

  // Table-of-contents highlighting is an enhancement; links work without JavaScript.
  const sections = document.querySelectorAll('.legal-section[id]');
  const toc = document.querySelector('.policy-sidebar nav');
  if (toc && sections.length && 'IntersectionObserver' in window) {
    const setActive = id => {
      toc.querySelectorAll('a').forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    setActive(sections[0].id);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) {
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActive(visible[0].target.id);
      }
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  document.querySelectorAll('.email-form').forEach(form => {
    const result = form.querySelector('.email-result');
    const status = form.querySelector('.email-status');
    const copyButton = form.querySelector('.copy-email');
    const manualCopy = form.querySelector('.manual-copy');
    const copyText = form.querySelector('.email-copy-text');
    const recipient = form.dataset.email;
    let preparedMessage = '';

    const prepare = () => {
      const data = new FormData(form);
      const text = key => String(data.get(key) || '').trim();
      const topic = text('topic');
      const isDeletion = topic === 'Account / data deletion';
      const subject = isDeletion ? 'My BNI account / data deletion request' : `AnyBizHub — ${topic}`;
      const body = [
        'Hello Soance Innovations LLP,', '',
        `Name: ${text('name')}`, `Account / contact email: ${text('email')}`,
        `Topic: ${topic}`, '', text('message'), '',
        isDeletion
          ? 'I understand that identity verification may be required, and that account deletion does not cancel an app-store subscription.'
          : 'Please help me with this enquiry.', '',
        'Prepared on AnyBizHub. This email is sent only when I send it from my email application.'
      ].join('\n');
      preparedMessage = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
      copyText.value = preparedMessage;
      return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const mailto = prepare();
      result.hidden = false;
      status.textContent = 'Your email application should open with a draft. Review and send it there. No request has been submitted from this page. If it does not open, copy the message below.';
      // This is a mailto navigation, never an HTTP form submission.
      window.location.href = mailto;
    });

    copyButton.addEventListener('click', async () => {
      if (!form.reportValidity()) return;
      prepare();
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(preparedMessage);
          status.textContent = `Message copied. Paste it into a new email addressed to ${recipient}, review it, and send. No request has been submitted from this website.`;
          return;
        } catch (_) {
          // Clipboard permissions can be denied. Offer manual selection instead.
        }
      }
      manualCopy.hidden = false;
      copyText.focus();
      copyText.select();
      status.textContent = `Copy the selected text into your email application, address it to ${recipient}, and send it there. No request has been submitted from this website.`;
    });
  });
})();
