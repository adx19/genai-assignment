document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const ctaButtons = document.querySelectorAll('.cta-btn');

    // Sticky Navbar
    const handleStickyNav = () => {
        if (window.scrollY > 50) {
            header.classList.add('header-sticky');
        } else {
            header.classList.remove('header-sticky');
        }
    };

    // Mobile Navbar Toggle
    const toggleMobileMenu = () => {
        navToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
        document.body.classList.toggle('overflow-hidden');
    };

    const closeMobileMenu = () => {
        navToggle.classList.remove('is-active');
        navMenu.classList.remove('is-active');
        document.body.classList.remove('overflow-hidden');
    };

    // Smooth Scrolling
    const handleSmoothScroll = (e) => {
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                closeMobileMenu();
            }
        }
    };

    // CTA Interactions (Ripple Effect)
    const createRipple = (e) => {
        const button = e.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    };

    // Event Listeners
    window.addEventListener('scroll', handleStickyNav);
    
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });

    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            createRipple(e);
            // Example action for Scaler's callback mechanism
            console.log('CTA Clicked: Initiating flow...');
        });
    });

    // Close menu on resize if desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navMenu.classList.contains('is-active')) {
            closeMobileMenu();
        }
    });

    // Initial check
    handleStickyNav();
});