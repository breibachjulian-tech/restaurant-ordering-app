import { menuArray } from './data.js'

const menuEl = document.getElementById('menu')
const orderSection = document.getElementById('order')
const orderItemsEl = document.getElementById('order-items')
const orderTotalEl = document.getElementById('order-total')
const completeBtn = document.getElementById('complete-order-btn')
const modal = document.getElementById('payment-modal')
const paymentForm = document.getElementById('payment-form')
const successEl = document.getElementById('success')
const successMsg = document.getElementById('success-message')

let order = []

// ── Render menu ──────────────────────────────────────────────
function renderMenu() {
  menuEl.innerHTML = menuArray.map(item => `
    <div class="menu-item">
      <span class="menu-item-emoji">${item.emoji}</span>
      <div class="menu-item-info">
        <p class="menu-item-name">${item.name}</p>
        <p class="menu-item-ingredients">${item.ingredients.join(', ')}</p>
        <p class="menu-item-price">$${item.price}</p>
      </div>
      <button class="btn-add" data-id="${item.id}" aria-label="Add ${item.name}">+</button>
    </div>
  `).join('')
}

// ── Render order panel ───────────────────────────────────────
function renderOrder() {
  if (order.length === 0) {
    orderSection.classList.add('hidden')
    return
  }

  orderSection.classList.remove('hidden')

  orderItemsEl.innerHTML = order.map(item => `
    <div class="order-item-row">
      <div class="order-item-left">
        <span class="order-item-name">${item.name}</span>
        <button class="btn-remove" data-id="${item.id}">remove</button>
      </div>
      <span class="order-item-price">$${item.price}</span>
    </div>
  `).join('')

  const total = order.reduce((sum, item) => sum + item.price, 0)
  orderTotalEl.textContent = `$${total}`
}

// ── Cart actions ─────────────────────────────────────────────
function addItem(id) {
  const item = menuArray.find(m => m.id === id)
  if (!order.find(o => o.id === id)) {
    order.push({ ...item })
  }
  renderOrder()
}

function removeItem(id) {
  order = order.filter(o => o.id !== id)
  renderOrder()
}

// ── Event delegation — menu ──────────────────────────────────
menuEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add')
  if (!btn) return
  addItem(Number(btn.dataset.id))
})

// ── Event delegation — order panel ──────────────────────────
orderItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-remove')
  if (!btn) return
  removeItem(Number(btn.dataset.id))
})

// ── Open payment modal ───────────────────────────────────────
completeBtn.addEventListener('click', () => {
  paymentForm.reset()
  modal.showModal()
})

// ── Handle payment form submit ───────────────────────────────
paymentForm.addEventListener('submit', e => {
  e.preventDefault()

  // Trigger native browser validation
  if (!paymentForm.reportValidity()) return

  const name = document.getElementById('input-name').value.trim()

  modal.close()
  orderSection.classList.add('hidden')
  successEl.classList.remove('hidden')
  successMsg.textContent = `Thanks, ${name}! The order is on its way!`

  order = []
})

// ── Close modal on backdrop click ────────────────────────────
modal.addEventListener('click', e => {
  if (e.target === modal) modal.close()
})

// ── Init ─────────────────────────────────────────────────────
renderMenu()
