// ================================================
// Arquivo: script.js
// Objetivo: controlar animações, contador e carregamento de produtos.
// Fluxo principal de dados: Supabase -> Fallback para mock.
// Linguagem simples e didática para alunos.
// ================================================

// ------------------------------
// Contador regressivo (Countdown)
// Define uma data futura (3 dias a partir de agora) e
// atualiza os números na tela a cada segundo.
const nowDate = new Date();
let christmas = new Date(nowDate.getFullYear(), 11, 25, 0, 0, 0); // 25/12

// Se o Natal deste ano já passou, pega o próximo ano
if (nowDate > christmas) {
  christmas = new Date(nowDate.getFullYear() + 1, 11, 25, 0, 0, 0);
}

const countdownDate = christmas;

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

  if (distance < 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

updateCountdown();
setInterval(updateCountdown, 1000);

// ------------------------------
// ❄ NOVA ANIMAÇÃO DE NEVE COM FLOCO DE NEVE REAL
// ------------------------------

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 3;
    this.speed = Math.random() * 1 + 0.5;
    this.wind = Math.random() * 1 - 0.5;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 2 - 1;
  }

  update() {
    this.y += this.speed;
    this.x += this.wind;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.2;

    // ❄ floco com 6 pontas
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.size);
      ctx.rotate(Math.PI / 3);
    }
    ctx.stroke();

    ctx.restore();
  }
}

const snowflakes = [];
for (let i = 0; i < 120; i++) {
  snowflakes.push(new Snowflake());
}

function animateSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snowflakes.forEach(flake => {
    flake.update();
    flake.draw();
  });

  requestAnimationFrame(animateSnow);
}

animateSnow();

window.addEventListener('resize', resizeCanvas);

// Update canvas height when content changes
const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(document.body);

// Also update on scroll to ensure full coverage
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(resizeCanvas, 100);
});

// ------------------------------
// Funções Utilitárias
// ------------------------------

function formatBRL(value) {
  // Formata um número para moeda brasileira (R$)
  const num = Number(value);
  if (Number.isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
  // Evita problemas de segurança ao inserir texto no HTML
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  // Exibe uma mensagem de feedback temporária no canto da tela.
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #31EA89;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 2000);
}

function attachBuyButtonHandlers() {
  // Adiciona comportamento ao botão "Comprar Agora"
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.closest('.product-card').querySelector('.product-name').textContent;
      showToast(`${productName} adicionado ao carrinho!`);
    });
  });
}

function renderProducts(products) {
  // Cria os cartões na grade.
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const items = products.slice(0, 3);

  items.forEach(p => {
    const discountCalc = (p && p.old_price && p.new_price)
      ? Math.max(0, Math.round(100 - (Number(p.new_price) / Number(p.old_price)) * 100))
      : (p && typeof p.discount === 'number' ? p.discount : 0);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <span>${escapeHtml(p?.emoji || '🛍️')}</span>
        <div class="discount-badge">-${discountCalc}%</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p?.name || 'Produto')}</h3>
        <div class="price-container">
          <span class="old-price">${formatBRL(p?.old_price)}</span>
          <span class="new-price">${formatBRL(p?.new_price)}</span>
        </div>
        <button class="buy-button">Comprar Agora</button>
      </div>
    `;
    grid.appendChild(card);
  });

  attachBuyButtonHandlers();
}

async function loadProducts() {
  // ---------------------------------
  // Carregamento de produtos (Supabase -> mock)
  // ---------------------------------

  // Produtos de demonstração (fallback)
  const mockProducts = [
    { name: 'Luzes de Natal LED (Pisca-Pisca 10m)', old_price: 35.90, new_price: 25.90, emoji: '💡' },
    { name: 'Caixa de Presente Surpresa Misteriosa', old_price: 150.90, new_price: 99.90, emoji: '📦' },
    { name: 'Kit Bolas Natalinas Vermelhas e Douradas', old_price: 65.00, new_price: 45.00, emoji: '🔮' },
    { name: 'Guirlanda de Porta "Boas Festas', old_price: 89.90, new_price: 79.90, emoji: '🍀' },
    { name: 'Árvore de Natal Canadense (1.80m)', old_price: 349.90, new_price: 249.90, emoji: '🎄' },
  ];

  // Consultar diretamente do Supabase
  try {
    const { createClient } = window.supabase || {};
    const cfg = window.__SUPABASE || {};
    if (typeof createClient === 'function' && cfg.url && cfg.anonKey) {
      const client = createClient(cfg.url, cfg.anonKey);
      const { data, error } = await client
        .from('presentes_natal')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        // Se deu certo e veio conteúdo, exibimos os produtos reais
        renderProducts(data);
        return;
      }
    }
  } catch (errSupabase) {
    console.warn('Falha ao consultar Supabase:', errSupabase);
  }

  // Fallback para mock
  renderProducts(mockProducts);
  showToast('Exibindo produtos de demonstração.');
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// keyframes para toasts
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(toastStyle);