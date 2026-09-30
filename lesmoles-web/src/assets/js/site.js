/* Les Moles — lo poco que necesita JavaScript. La web se lee y se navega
   entera sin él; esto solo añade la cabecera que cambia al hacer scroll, el
   menú del móvil, las entradas suaves, el mapa bajo demanda y el envío del
   formulario de eventos. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var header = d.querySelector('[data-header]');

  /* Cabecera: transparente sobre la foto, sólida al bajar. */
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Menú del móvil. */
  var toggle = d.querySelector('.nav-toggle');
  var nav = d.getElementById('site-nav');
  if (header && toggle && nav) {
    var label = toggle.querySelector('.sr-only');
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('is-open', open);
      d.body.classList.toggle('nav-open', open);
      label.textContent = open ? toggle.dataset.closeLabel : toggle.dataset.openLabel;
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    var desktop = window.matchMedia('(min-width: 961px)');
    var onDesktop = function (e) {
      if (e.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
  }

  /* Entrada suave de los bloques. Lo que ya se ve al cargar no se anima. */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    d.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
    root.classList.add('reveal-ready');
  }

  /* Mapa de Google: solo se carga si se pide (sin cookies de terceros antes). */
  d.querySelectorAll('.map').forEach(function (map) {
    var btn = map.querySelector('.map__load');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = map.dataset.mapSrc;
      f.title = map.dataset.mapTitle;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      map.querySelector('.map__placeholder').replaceWith(f);
    });
  });

  /* Formulario de eventos. Con endpoint: se envía sin salir de la página.
     Sin endpoint: se abre el correo del visitante con la petición escrita. */
  d.querySelectorAll('[data-events-form]').forEach(function (form) {
    var status = form.querySelector('.form__status');
    var submit = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      if (data.get('website')) return; // campo trampa: lo rellenan los robots
      data.delete('website');
      status.className = 'form__status';
      var endpoint = form.dataset.endpoint;

      if (!endpoint) {
        var lines = [];
        form.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (!el.name || el.name === 'website' || el.type === 'checkbox') return;
          var v = (el.value || '').trim();
          if (!v) return;
          var lab = form.querySelector('label[for="' + el.id + '"]');
          var name = lab ? lab.firstChild.textContent.trim() : el.name;
          lines.push(name + ': ' + v);
        });
        var mail = d.createElement('a');
        mail.href =
          'mailto:' + form.dataset.mailto +
          '?subject=' + encodeURIComponent(form.dataset.subject) +
          '&body=' + encodeURIComponent(lines.join('\n'));
        mail.hidden = true;
        d.body.appendChild(mail);
        mail.click();
        mail.remove();
        status.textContent = form.dataset.mailOpened;
        return;
      }

      submit.disabled = true;
      status.textContent = form.dataset.sending;
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error(String(res.status));
          form.reset();
          status.textContent = form.dataset.sent;
          status.classList.add('is-ok');
        })
        .catch(function () {
          status.textContent = form.dataset.error;
          status.classList.add('is-error');
        })
        .then(function () {
          submit.disabled = false;
        });
    });
  });
})();
