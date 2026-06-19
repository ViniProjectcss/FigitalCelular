/**
 * Figital Celular — JavaScript Principal
 * Partículas, animações, carregamento de produtos, contadores e interações
 */

// ─── 1. NAVBAR SCROLL ────────────────────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ─── 2. MOBILE MENU ──────────────────────────────────────────────────────────
(function initMobileMenu() {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('mobile-menu');
  const close = document.getElementById('mobile-close');
  const links = document.querySelectorAll('.mobile-menu a');

  if (!burger) return;
  burger.addEventListener('click', () => menu.classList.add('open'));
  close.addEventListener('click', () => menu.classList.remove('open'));
  links.forEach(l => l.addEventListener('click', () => menu.classList.remove('open')));
})();

// ─── 3. CANVAS PARTICLES ─────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let raf;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? '#d4a843' : '#22c55e'
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < 60; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();

      p.x += p.dx;
      p.y += p.dy;
      p.opacity -= 0.0008;

      if (p.y < -5 || p.opacity <= 0) {
        particles[i] = createParticle();
        particles[i].y = canvas.height + 5;
      }
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
})();

// ─── 4. INTERSECTION OBSERVER - REVEAL ANIMATIONS ────────────────────────────
(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Delay por índice para efeito cascata
        const idx = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = i % 6;
    observer.observe(el);
  });
})();

// ─── 5. CARREGAR PRODUTOS VIA API ─────────────────────────────────────────────
(function initProdutos() {
  const grid = document.getElementById('produtos-grid');
  if (!grid) return;

  // Mostrar skeletons enquanto carrega
  function showSkeletons(n = 8) {
    grid.innerHTML = Array.from({ length: n }, () => `
      <div class="produto-card">
        <div class="card-img-wrap"><div class="skeleton" style="width:100%;height:220px;border-radius:0;"></div></div>
        <div class="card-body">
          <div class="skeleton" style="height:12px;width:50%;margin-bottom:10px;"></div>
          <div class="skeleton" style="height:18px;width:85%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:14px;width:100%;margin-bottom:6px;"></div>
          <div class="skeleton" style="height:14px;width:70%;margin-bottom:16px;"></div>
          <div class="skeleton" style="height:28px;width:50%;margin-bottom:14px;"></div>
          <div class="skeleton" style="height:38px;width:100%;"></div>
        </div>
      </div>
    `).join('');
  }

  // Calcular desconto
  function calcDesconto(preco, precoAntigo) {
    if (!precoAntigo || precoAntigo <= preco) return null;
    return Math.round(((precoAntigo - preco) / precoAntigo) * 100);
  }

  // Formatar preço BRL
  function formatPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Badge CSS class
  function badgeClass(badge) {
    if (!badge) return '';
    const map = {
      'Novo': 'badge-novo',
      'Top Vendas': 'badge-top',
      'Oferta': 'badge-oferta',
      'Premium': 'badge-premium',
      'Custo-benefício': 'badge-custo',
      'Mais Vendido': 'badge-mais',
      'Seminovo': 'badge-premium'
    };
    return map[badge] || 'badge-novo';
  }

  // Gerar card HTML
  function renderCard(cel, idx) {
    const desconto = calcDesconto(cel.preco, cel.preco_antigo);
    const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse no ${cel.nome} por ${formatPreco(cel.preco)}. Ainda disponível?`);
    const whatsappLink = `https://wa.me/5511999999999?text=${whatsappMsg}`;

    return `
      <div class="produto-card reveal" data-delay="${idx % 4}" data-categoria="${cel.categoria}" data-condicao="${cel.condicao}" data-id="${cel.id}">
        <div class="card-img-wrap">
          <img src="${cel.imagem}" alt="${cel.nome}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80'">
          ${cel.badge ? `<span class="card-badge ${badgeClass(cel.badge)}">${cel.badge}</span>` : ''}
          <button class="card-wishlist" onclick="toggleWishlist(this, ${cel.id})" title="Favoritar">🤍</button>
        </div>
        <div class="card-body">
          <div class="card-brand">${cel.categoria} · ${cel.condicao}</div>
          <div class="card-name">${cel.nome}</div>
          <div class="card-desc">${cel.descricao}</div>
          <div class="card-pricing">
            <span class="card-price">${formatPreco(cel.preco)}</span>
            ${cel.preco_antigo ? `<span class="card-price-old">${formatPreco(cel.preco_antigo)}</span>` : ''}
            ${desconto ? `<span class="card-discount">-${desconto}%</span>` : ''}
          </div>
          <div class="card-footer">
            <button class="btn-card-buy" onclick="consultarWhatsApp(${cel.id})">Consultar preço</button>
            <a href="${whatsappLink}" target="_blank" class="btn-card-whatsapp" title="WhatsApp">💬</a>
          </div>
        </div>
      </div>
    `;
  }

  // Guardar referência global
  window._todosOsCelulares = [];

  // Filtrar e renderizar (por categoria OU por condição "Seminovo")
  window.filtrarProdutos = function(filtro) {
    let filtrados;
    if (filtro === 'Todos') {
      filtrados = window._todosOsCelulares;
    } else if (filtro === 'Seminovo') {
      filtrados = window._todosOsCelulares.filter(c => c.condicao === 'Seminovo');
    } else {
      filtrados = window._todosOsCelulares.filter(c => c.categoria === filtro);
    }

    if (!filtrados.length) {
      grid.innerHTML = `<div class="no-products"><p>Nenhum produto encontrado.</p></div>`;
      return;
    }

    grid.innerHTML = filtrados.map((c, i) => renderCard(c, i)).join('');

    // Re-observar novos elementos
    const novosReveal = grid.querySelectorAll('.reveal');
    if (window._revealObserver) {
      novosReveal.forEach(el => window._revealObserver.observe(el));
    }

    // Atualizar filtros ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.marca === filtro);
    });
  };

  // Iniciar observer para os novos cards
  window._revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay * 100);
        window._revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Buscar dados da API
  showSkeletons(8);
  fetch('/api/celulares')
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error('API error');
      window._todosOsCelulares = res.data;
      filtrarProdutos('Todos');
    })
    .catch(() => {
      grid.innerHTML = `<div class="no-products">
        <p style="color:var(--text-muted)">⚠️ Não foi possível carregar os produtos.<br>Verifique se o servidor está rodando.</p>
      </div>`;
    });
})();

// ─── 6. WHATSAPP CONSULTA ─────────────────────────────────────────────────────
window.consultarWhatsApp = function(id) {
  const cel = (window._todosOsCelulares || []).find(c => c.id === id);
  if (!cel) return;
  const msg = encodeURIComponent(`Olá! Tenho interesse no ${cel.nome}. Poderia me informar mais detalhes e formas de pagamento?`);
  window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
};

// ─── 7. WISHLIST ──────────────────────────────────────────────────────────────
window.toggleWishlist = function(btn, id) {
  const isFav = btn.textContent === '❤️';
  btn.textContent = isFav ? '🤍' : '❤️';
  showToast(isFav ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos!');
};

// ─── 8. TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'global-toast';
    toast.innerHTML = `<span class="toast-icon">✅</span><span id="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── 9. CONTADORES ANIMADOS ───────────────────────────────────────────────────
(function initContadores() {
  const items = document.querySelectorAll('[data-count]');
  if (!items.length) return;

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * ease;

      el.textContent = prefix + (Number.isInteger(target)
        ? Math.floor(current).toLocaleString('pt-BR')
        : current.toFixed(1)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  items.forEach(el => obs.observe(el));
})();

// ─── 10. COUNTDOWN TIMER ─────────────────────────────────────────────────────
(function initTimer() {
  const horaEl = document.getElementById('timer-hora');
  const minEl = document.getElementById('timer-min');
  const secEl = document.getElementById('timer-sec');
  if (!horaEl) return;

  // Fim da promoção: meia-noite de hoje
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  function update() {
    const diff = Math.max(0, end - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    horaEl.textContent = String(h).padStart(2, '0');
    minEl.textContent  = String(m).padStart(2, '0');
    secEl.textContent  = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
})();

// ─── 11. SMOOTH SCROLL ───────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── 12. HERO TYPING EFFECT ──────────────────────────────────────────────────
(function initTyping() {
  const el = document.getElementById('hero-typing');
  if (!el) return;
  const words = ['Preço Justo.', 'Garantia Real.', 'Suporte Total.', 'Qualidade 100%.'];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1600); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 55 : 90);
  }
  setTimeout(type, 800);
})();

// ─── 13. SECTION LABELS GLOW ON HOVER ────────────────────────────────────────
document.querySelectorAll('.diff-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

// ─── 14. INIT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🚀 Figital Celular', 'color:#22c55e;font-size:1.2rem;font-weight:800;');
  console.log('%cDesenvolvido com ❤️ | v1.0.0', 'color:#9b9baa;');
});