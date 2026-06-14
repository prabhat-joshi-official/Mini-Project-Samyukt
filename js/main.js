document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initOpeningHours();
  initCart();
  
  if (document.getElementById('product-search') || document.getElementById('filter-buttons')) {
    initProductFilters();
  }
  
  if (document.getElementById('bakery-contact-form')) {
    initContactForm();
  }
});

function initNavigation() {
  const header = document.getElementById('main-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  
  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      
      // Update hamburger icon visual states if desired
      const isOpen = navMenu.classList.contains('open');
      mobileMenuBtn.innerHTML = isOpen 
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileMenuBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
        }
      }
    });
  }
}

/* ==========================================================================
   2. OPENING HOURS STATUS INDICATOR
   ========================================================================== */
function initOpeningHours() {
  const badge = document.getElementById('opening-status-badge');
  const badgeText = document.getElementById('opening-status-text');
  
  if (!badge || !badgeText) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const decimalTime = hour + minute / 60;
  
  let isOpen = false;
  let scheduleText = '';

  // Match day schedules:
  // Mon: Closed
  // Tue - Thu: 8 AM - 7 PM (8 to 19)
  // Fri - Sat: 8 AM - 8 PM (8 to 20)
  // Sun: 8 AM - 4 PM (8 to 16)
  
  switch(day) {
    case 0: // Sunday
      isOpen = (decimalTime >= 8 && decimalTime < 16);
      scheduleText = 'Sun: 8am - 4pm';
      break;
    case 1: // Monday
      isOpen = false;
      scheduleText = 'Mon: Closed';
      break;
    case 2: // Tuesday
    case 3: // Wednesday
    case 4: // Thursday
      isOpen = (decimalTime >= 8 && decimalTime < 19);
      scheduleText = 'Tue-Thu: 8am - 7pm';
      break;
    case 5: // Friday
    case 6: // Saturday
      isOpen = (decimalTime >= 8 && decimalTime < 20);
      scheduleText = 'Fri-Sat: 8am - 8pm';
      break;
  }

  // Update Status badge
  if (isOpen) {
    badge.className = 'badge badge-open';
    badgeText.textContent = `Open Now • Closes at ${day === 0 ? '4 PM' : (day >= 5 ? '8 PM' : '7 PM')}`;
  } else {
    badge.className = 'badge badge-closed';
    badgeText.textContent = `Closed Now • ${day === 1 ? 'Opens Tue 8 AM' : 'Opens Daily at 8 AM'}`;
  }

  // Highlight Current Day Row if on contact.html
  const dayElements = [
    'hours-sun', // 0
    'hours-mon', // 1
    'hours-tue', // 2
    'hours-wed', // 3
    'hours-thu', // 4
    'hours-fri', // 5
    'hours-sat'  // 6
  ];
  
  const currentDayRow = document.getElementById(dayElements[day]);
  if (currentDayRow) {
    currentDayRow.classList.add('current-day');
  }
}

/* ==========================================================================
   3.persistent SHOPPING CART STATE MANAGEMENT
   ========================================================================== */
let cart = [];

function initCart() {
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const checkoutBtn = document.getElementById('btn-checkout');
  
  // Load Cart from LocalStorage
  const savedCart = localStorage.getItem('bakingo_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch(e) {
      cart = [];
    }
  }
  
  updateCartBadge();
  renderCartItems();

  // Drawer Toggle Handlers
  if (cartToggleBtn && cartDrawer && cartOverlay) {
    cartToggleBtn.addEventListener('click', () => toggleCart(true));
  }
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => toggleCart(false));
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => toggleCart(false));
  }

  function toggleCart(open) {
    if (open) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    } else {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = ''; // Release scroll
    }
  }

  // Handle Add to Cart button clicks (Delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = parseFloat(btn.getAttribute('data-price'));
    const img = btn.getAttribute('data-img');
    
    addToCart(id, name, price, img);
    animateCartBtn();
  });

  // Action listeners inside Cart list (increase, decrease, delete)
  const cartItemsList = document.getElementById('cart-items-list');
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const target = e.target;
      const cartItemRow = target.closest('.cart-item');
      if (!cartItemRow) return;
      
      const id = cartItemRow.getAttribute('data-item-id');
      
      if (target.classList.contains('qty-plus')) {
        updateQty(id, 1);
      } else if (target.classList.contains('qty-minus')) {
        updateQty(id, -1);
      } else if (target.closest('.remove-item-btn')) {
        removeFromCart(id);
      }
    });
  }

  // Checkout trigger
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your basket is empty. Add some goods first!', 'error');
        return;
      }
      showToast('Thank you! Checkout process successfully initiated.', 'success');
      cart = [];
      saveCart();
      updateCartBadge();
      renderCartItems();
      toggleCart(false);
    });
  }
}

function addToCart(id, name, price, img) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast(`Added "${name}" to basket.`, 'success');
}

function updateQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  
  item.qty += delta;
  
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    updateCartBadge();
    renderCartItems();
  }
}

function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;
  
  const name = cart[index].name;
  cart.splice(index, 1);
  
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast(`Removed "${name}" from basket.`, 'success');
}

function saveCart() {
  localStorage.setItem('bakingo_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  
  badges.forEach(badge => {
    badge.textContent = totalItems;
    // Hide count badge if empty
    badge.style.display = totalItems === 0 ? 'none' : 'flex';
  });
}

function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  const emptyMsg = document.getElementById('cart-empty-msg');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  
  if (!list) return;

  // Clear existing items but preserve empty message placeholder structure
  const existingItems = list.querySelectorAll('.cart-item');
  existingItems.forEach(item => item.remove());

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    subtotalEl.textContent = '$0.00';
    totalEl.textContent = '$0.00';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.setAttribute('data-item-id', item.id);
    row.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="qty-btn qty-minus" aria-label="Decrease quantity">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn-icon remove-item-btn" aria-label="Remove item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// Micro-animation for cart trigger badge update removed
function animateCartBtn() {
  // No-op
}

/* ==========================================================================
   4. PRODUCT FILTERS & REAL-TIME SEARCH (LANDING PAGE)
   ========================================================================== */
function initProductFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('product-search');
  const productCards = document.querySelectorAll('.product-card');

  let activeCategory = 'all';
  let searchQuery = '';

  // Bind click handlers to filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeCategory = btn.getAttribute('data-category');
      applyFilters();
    });
  });

  // Bind input handler to search bar
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  function applyFilters() {
    productCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('.product-desc').textContent.toLowerCase();
      
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = (title.includes(searchQuery) || desc.includes(searchQuery));
      
      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

/* ==========================================================================
   5. CONTACT FORM VALIDATION WITH FLOATING LABELS (CONTACT PAGE)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('bakery-contact-form');
  if (!form) return;

  const inputs = form.querySelectorAll('.form-input');

  // Input validation on blur & input events
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  // Submit validation handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    inputs.forEach(input => {
      const isValid = validateField(input);
      if (!isValid) isFormValid = false;
    });

    if (isFormValid) {
      const nameVal = document.getElementById('contact-name').value;
      showToast(`Thank you, ${nameVal}! Message sent. We'll be in touch soon.`, 'success');
      form.reset();
      
      // Reset floating labels by forcing input state refresh
      inputs.forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    } else {
      showToast('Please correct the highlighted errors before submitting.', 'error');
    }
  });

  function validateField(input) {
    const group = input.closest('.form-group');
    const id = input.id;
    let isValid = true;
    let val = input.value.trim();

    if (input.required && val === '') {
      isValid = false;
    } else {
      // Specific Field Validations
      if (id === 'contact-email' && val !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(val);
      } else if (id === 'contact-phone' && val !== '') {
        const phoneRegex = /^[+]?[0-9\s-()]{7,15}$/;
        isValid = phoneRegex.test(val);
      } else if (id === 'contact-name' && val !== '') {
        isValid = val.length >= 2;
      } else if (id === 'contact-message' && val !== '') {
        isValid = val.length >= 5;
      }
    }

    if (isValid) {
      group.classList.remove('has-error');
    } else {
      group.classList.add('has-error');
    }

    return isValid;
  }
}

/* ==========================================================================
   6. PREMIUM TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-wrapper');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-sage);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-rose);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    ${icon}
    <span class="toast-msg">${message}</span>
    <button class="toast-close" aria-label="Dismiss message">&times;</button>
  `;

  container.appendChild(toast);

  // Close toast on click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto remove toast
  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

function removeToast(toast) {
  if (!toast.parentNode) return;
  toast.remove();
}
