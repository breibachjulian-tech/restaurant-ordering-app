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
const reviewEl = document.getElementById('review')
const reviewThanksEl = document.getElementById('review-thanks')
const starRatingEl = document.getElementById('star-rating')
const starEls = document.querySelectorAll('.star')
const reviewTextEl = document.getElementById('review-text')
const submitReviewBtn = document.getElementById('submit-review-btn')

let order = []
let activeId = null  // which item's stepper is currently open
let selectedRating = 0

function renderMenu() {
  menuEl.innerHTML = menuArray.map(item => {
    const orderItem = order.find(o => o.id === item.id)
    const qty = orderItem ? orderItem.quantity : 0
    const control = activeId === item.id
      ? `<div class="qty-stepper">
           <button class="btn-decrement" data-id="${item.id}" aria-label="Remove one ${item.name}">−</button>
           <span class="qty-value" data-id="${item.id}">${qty}</span>
           <button class="btn-increment" data-id="${item.id}" aria-label="Add one ${item.name}">+</button>
         </div>`
      : `<button class="btn-add" data-id="${item.id}" aria-label="Add ${item.name}">+</button>`
    return `
      <div class="menu-item">
        <span class="menu-item-emoji">${item.emoji}</span>
        <div class="menu-item-info">
          <p class="menu-item-name">${item.name}</p>
          <p class="menu-item-ingredients">${item.ingredients.join(', ')}</p>
          <p class="menu-item-price">$${item.price}</p>
        </div>
        ${control}
      </div>
    `
  }).join('')
}

// the deal applies to exactly 1 food unit + 1 beer unit regardless of quantities ordered
function getMealDeal() {
  const foodItem = order.find(o => o.id === 0 || o.id === 1)
  const beer = order.find(o => o.id === 2)
  if (foodItem && beer) {
    const discount = Math.round((foodItem.price + beer.price) * 0.15 * 100) / 100
    return { active: true, discount }
  }
  return { active: false, discount: 0 }
}

function renderOrder() {
  if (order.length === 0) {
    orderSection.classList.add('hidden')
    return
  }
  orderSection.classList.remove('hidden')

  const { active, discount } = getMealDeal()

  orderItemsEl.innerHTML = order.map(item => `
    <div class="order-item-row">
      <span class="order-item-name">${item.quantity > 1 ? `${item.quantity}× ` : ''}${item.name}</span>
      <div class="order-item-right">
        <span class="order-item-price">$${item.price * item.quantity}</span>
        <button class="btn-order-decrement" data-id="${item.id}" aria-label="Remove one ${item.name}">−</button>
      </div>
    </div>
  `).join('') + (active ? `
    <div class="order-discount-row">
      <span class="order-discount-label">Meal Deal (15% off)</span>
      <span class="order-discount-value">-$${discount.toFixed(2)}</span>
    </div>
  ` : '')

  const subtotal = order.reduce((sum, item) => sum + item.price * item.quantity, 0)
  orderTotalEl.textContent = `$${(subtotal - discount).toFixed(2)}`
}

// Open stepper for this item (folds any other open stepper), adds 1 unit — full re-render
function openItem(id) {
  activeId = id
  const existing = order.find(o => o.id === id)
  if (existing) {
    existing.quantity++
  } else {
    const item = menuArray.find(m => m.id === id)
    order.push({ ...item, quantity: 1 })
  }
  renderMenu()
  renderOrder()
}

// Increment within the already-open stepper — targeted DOM update only, no re-render
function incrementItem(id) {
  const existing = order.find(o => o.id === id)
  if (!existing) return
  existing.quantity++
  menuEl.querySelector(`.qty-value[data-id="${id}"]`).textContent = existing.quantity
  renderOrder()
}

// Decrement from the order panel — keeps menu stepper in sync without triggering its animation
function decrementFromOrder(id) {
  const existing = order.find(o => o.id === id)
  if (!existing) return
  if (existing.quantity > 1) {
    existing.quantity--
    const menuQtyEl = menuEl.querySelector(`.qty-value[data-id="${id}"]`)
    if (menuQtyEl) menuQtyEl.textContent = existing.quantity
  } else {
    order = order.filter(o => o.id !== id)
    if (activeId === id) {
      activeId = null
      renderMenu()
    }
  }
  renderOrder()
}

// Decrement within the already-open stepper — targeted update; full re-render only if item removed
function decrementItem(id) {
  const existing = order.find(o => o.id === id)
  if (!existing) return
  if (existing.quantity > 1) {
    existing.quantity--
    menuEl.querySelector(`.qty-value[data-id="${id}"]`).textContent = existing.quantity
    renderOrder()
  } else {
    order = order.filter(o => o.id !== id)
    activeId = null
    renderMenu()
    renderOrder()
  }
}

menuEl.addEventListener('click', e => {
  const addBtn = e.target.closest('.btn-add')
  const incBtn = e.target.closest('.btn-increment')
  const decBtn = e.target.closest('.btn-decrement')
  if (addBtn) openItem(Number(addBtn.dataset.id))
  else if (incBtn) incrementItem(Number(incBtn.dataset.id))
  else if (decBtn) decrementItem(Number(decBtn.dataset.id))
})

orderItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-order-decrement')
  if (btn) decrementFromOrder(Number(btn.dataset.id))
})

completeBtn.addEventListener('click', () => {
  paymentForm.reset()
  modal.showModal()
})

paymentForm.addEventListener('submit', e => {
  e.preventDefault()
  if (!paymentForm.reportValidity()) return

  const name = document.getElementById('input-name').value.trim()

  modal.close()
  orderSection.classList.add('hidden')
  successEl.classList.remove('hidden')
  successMsg.textContent = `Thanks, ${name}! The order is on its way!`
  reviewEl.classList.remove('hidden')

  order = []
  activeId = null
  selectedRating = 0
  setStarLit(0)
  renderMenu()
})

modal.addEventListener('click', e => {
  if (e.target === modal) modal.close()
})

function setStarLit(upTo) {
  starEls.forEach(star => {
    star.classList.toggle('star--lit', Number(star.dataset.value) <= upTo)
  })
}

starRatingEl.addEventListener('mouseover', e => {
  const star = e.target.closest('.star')
  if (!star) return
  setStarLit(Number(star.dataset.value))
})

starRatingEl.addEventListener('mouseleave', () => {
  setStarLit(selectedRating)
})

starRatingEl.addEventListener('click', e => {
  const star = e.target.closest('.star')
  if (!star) return
  selectedRating = Number(star.dataset.value)
  setStarLit(selectedRating)
})

submitReviewBtn.addEventListener('click', () => {
  reviewEl.classList.add('hidden')
  reviewThanksEl.classList.remove('hidden')
})

renderMenu()
