// Smooth Scroll for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const scrollTarget = document.querySelector(this.getAttribute('href'));
      scrollTarget.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const mobileToggle = document.querySelector('.mobile-toggle');
mobileToggle.addEventListener('click', function() {
  mobileMenu.classList.toggle('active');
});

// Scroll-Based Navbar Background Change
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('fixed-top', 'shadow-sm');
  } else {
    navbar.classList.remove('fixed-top', 'shadow-sm');
  }
});

// Intersection Observer for Fade-In Animations
const fadeElems = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px 0px 50px 0px'
});
fadeElems.forEach(elem => observer.observe(elem));

// CTA Button Click Handlers
const ctaBtns = document.querySelectorAll('.cta-btn');
ctaBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    console.log('CTA button clicked');
    // Add your custom logic here
  });
});

// Error Handling
window.addEventListener('error', function(event) {
  console.error('Error occurred:', event);
});