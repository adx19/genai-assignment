document.addEventListener('DOMContentLoaded', () => {
    
    // FAQ Accordion logic
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Close other items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            
            const icon = header.querySelector('.icon');
            if (item.classList.contains('active')) {
                icon.textContent = '−';
            } else {
                icon.textContent = '+';
            }
        });
    });

    // Mobile menu toggle (simple version)
    const mobileToggle = document.querySelector('.mobile-toggle');
    mobileToggle.addEventListener('click', () => {
        alert('Mobile menu clicked! In a full implementation, this would open a sidebar or overlay.');
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Change header background on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(10, 16, 29, 0.98)';
        } else {
            header.style.padding = '20px 0';
            header.style.background = 'rgba(10, 16, 29, 0.95)';
        }
    });
});
