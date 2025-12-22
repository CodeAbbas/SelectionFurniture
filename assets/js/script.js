'use strict';

// --- MODAL (Newsletter) ---
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

if (modal && modalCloseBtn && modalCloseOverlay) {
  const modalCloseFunc = function() { modal.classList.add('closed') }
  modalCloseOverlay.addEventListener('click', modalCloseFunc);
  modalCloseBtn.addEventListener('click', modalCloseFunc);
}

// --- NOTIFICATION TOAST ---
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

if (notificationToast && toastCloseBtn) {
  toastCloseBtn.addEventListener('click', function() {
    notificationToast.classList.add('closed');
  });
}

// --- MOBILE MENU ---
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

if (mobileMenu.length > 0) {
  for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
    const mobileMenuCloseFunc = function() {
      mobileMenu[i].classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    }
    
    mobileMenuOpenBtn[i].addEventListener('click', function() {
      mobileMenu[i].classList.add('active');
      if (overlay) overlay.classList.add('active');
    });
    
    if (mobileMenuCloseBtn[i]) {
      mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
    }
    
    if (overlay) {
      overlay.addEventListener('click', mobileMenuCloseFunc);
    }
  }
}

// --- ACCORDION (Sidebars) ---
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {
  accordionBtn[i].addEventListener('click', function() {
    const clickedBtn = this.nextElementSibling.classList.contains('active');
    for (let i = 0; i < accordion.length; i++) {
      if (clickedBtn) break;
      if (accordion[i].classList.contains('active')) {
        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');
      }
    }
    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');
  });
}