import { menuArray } from './data.js' // import menu items from data file

// grab all DOM elements needed
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
const starEls = document.querySelectorAll('.star') // all 5 star spans
const reviewTextEl = document.getElementById('review-text')
const submitReviewBtn = document.getElementById('submit-review-btn')

let order = [] // holds the items the customer has added
let selectedRating = 0 // tracks the star rating the customer has clicked

// build and inject a menu item row for each item in menuArray
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

// check if a food item (pizza/burger) AND beer are both in the order
function getMealDeal() {
  const foodItem = order.find(o => o.id === 0 || o.id === 1) // pizza or hamburger
  const beer = order.find(o => o.id === 2) // beer
  if (foodItem && beer) {
    const discount = Math.round((foodItem.price + beer.price) * 0.15 * 100) / 100 // 15% off both items
    return { active: true, discount }
  }
  return { active: false, discount: 0 } // no deal applies
}

// rebuild the order panel with current items, discount row (if any), and total
function renderOrder() {
  if (order.length === 0) {
    orderSection.classList.add('hidden') // hide panel when cart is empty
    return
  }

  orderSection.classList.remove('hidden') // show panel once an item is added

  const { active, discount } = getMealDeal() // check whether meal deal is active

  // render each ordered item with its price and a remove button
  orderItemsEl.innerHTML = order.map(item => `
    <div class="order-item-row">
      <div class="order-item-left">
        <span class="order-item-name">${item.name}</span>
        <button class="btn-remove" data-id="${item.id}">Remove</button>
      </div>
      <span class="order-item-price">$${item.price}</span>
    </div>
  `).join('') + (active ? `
    <div class="order-discount-row">
      <span class="order-discount-label">Meal Deal (15% off)</span>
      <span class="order-discount-value">-$${discount.toFixed(2)}</span>
    </div>
  ` : '') // append discount row only when meal deal is active

  const subtotal = order.reduce((sum, item) => sum + item.price, 0) // sum all item prices
  orderTotalEl.textContent = `$${(subtotal - discount).toFixed(2)}` // subtract discount from total
}

// add item to order if not already present, then re-render
function addItem(id) {
  const item = menuArray.find(m => m.id === id) // find the matching menu item
  if (!order.find(o => o.id === id)) { // prevent duplicates
    order.push({ ...item }) // add a copy to the order
  }
  renderOrder()
}

// remove item from order by id, then re-render
function removeItem(id) {
  order = order.filter(o => o.id !== id)
  renderOrder()
}

// listen for + button clicks on the menu using event delegation
menuEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add') // find the clicked add button
  if (!btn) return
  addItem(Number(btn.dataset.id)) // parse id from data attribute and add item
})

// listen for remove button clicks inside the order panel
orderItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-remove')
  if (!btn) return
  removeItem(Number(btn.dataset.id))
})

// open payment modal and reset the form when complete order is clicked
completeBtn.addEventListener('click', () => {
  paymentForm.reset() // clear any previous input
  modal.showModal() // open the native dialog
})

// handle payment form submission
paymentForm.addEventListener('submit', e => {
  e.preventDefault() // stop default form navigation
  if (!paymentForm.reportValidity()) return // trigger browser's built-in required field validation

  const name = document.getElementById('input-name').value.trim() // read the customer's name

  modal.close() // close the payment modal
  orderSection.classList.add('hidden') // hide the order panel
  successEl.classList.remove('hidden') // show the success message
  successMsg.textContent = `Thanks, ${name}! The order is on its way!`
  reviewEl.classList.remove('hidden') // reveal the review section below the success message

  order = [] // reset the cart
  selectedRating = 0 // reset the star rating for next order
  setStarLit(0) // clear any lit stars from a previous session
})

// close modal when clicking on the backdrop
modal.addEventListener('click', e => {
  if (e.target === modal) modal.close() // only close when clicking outside the modal card
})

// light up all stars up to the given value, clear the rest
function setStarLit(upTo) {
  starEls.forEach(star => {
    star.classList.toggle('star--lit', Number(star.dataset.value) <= upTo)
  })
}

// hover over a star: preview the rating by lighting up stars temporarily
starRatingEl.addEventListener('mouseover', e => {
  const star = e.target.closest('.star')
  if (!star) return
  setStarLit(Number(star.dataset.value))
})

// mouse leaves the star group: revert to the locked selection
starRatingEl.addEventListener('mouseleave', () => {
  setStarLit(selectedRating)
})

// click a star: lock in the selected rating
starRatingEl.addEventListener('click', e => {
  const star = e.target.closest('.star')
  if (!star) return
  selectedRating = Number(star.dataset.value)
  setStarLit(selectedRating) // keep the clicked stars lit
})

// submit review: hide the review form and show the thank you message
submitReviewBtn.addEventListener('click', () => {
  reviewEl.classList.add('hidden')
  reviewThanksEl.classList.remove('hidden')
})

renderMenu() // kick off the app by rendering the menu on page load
