// Navigation scroll effect
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('.nav');
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (nav) {
                    if (window.scrollY > 50) {
                        nav.classList.add('scrolled');
                    } else {
                        nav.classList.remove('scrolled');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Enhanced smooth scrolling for service details
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80; // Account for fixed header
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add highlight effect to the target
                target.classList.add('highlighted');
                setTimeout(() => {
                    target.classList.remove('highlighted');
                }, 2000);
            }
        });
    });

    // Close popup
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const popupContent = document.getElementById('popupContent');

    if (popupOverlay && popupClose && popupContent) {
        function closePopup() {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        popupClose.addEventListener('click', closePopup);

        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closePopup();
            }
        });

        // Close popup with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
                closePopup();
            }
        });

        // Handle contact navigation from popup
        popupContent.addEventListener('click', function(e) {
            if (e.target.matches('.popup-actions a')) {
                e.preventDefault();
                closePopup();
                const target = e.target.getAttribute('href');
                if (target && document.querySelector(target)) {
                    document.querySelector(target).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // FAQ Accordion Logic
    // Popup management
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupClose = document.querySelector('.popup-close');
    const popupContent = document.querySelector('.popup-content');

    function closePopup() {
        if (popupOverlay) {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closePopup();
            }
        });
    }

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('active')) {
            closePopup();
        }
    });

    // Handle contact navigation from popup
    if (popupContent) {
        popupContent.addEventListener('click', function(e) {
            if (e.target.matches('.popup-actions a')) {
                e.preventDefault();
                closePopup();
                const target = e.target.getAttribute('href');
                if (target && document.querySelector(target)) {
                    document.querySelector(target).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
        });
    }

    // FAQ Accordion logic
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            // Close other items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Form submission
    const form = document.getElementById('retrofit-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('.form-submit');
            const originalText = submitButton.textContent;
            const originalBg = submitButton.style.backgroundColor;
            
            try {
                // Get form data
                const formData = new FormData(form);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    property_type: formData.get('property_type'),
                    current_ber_rating: formData.get('current_ber_rating'),
                    budget_range: formData.get('budget_range'),
                    message: formData.get('message')
                };
                
                // Show loading state
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                submitButton.style.backgroundColor = '#666';
                
                // Send data to API
                const response = await fetch('/backend/api/consultations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Success message
                    submitButton.textContent = '✓ Thank you! We\'ll be in touch soon.';
                    submitButton.style.backgroundColor = '#4A7C5B';
                    
                    // Reset form after 3 seconds
                    setTimeout(() => {
                        form.reset();
                        submitButton.textContent = originalText;
                        submitButton.style.backgroundColor = originalBg;
                        submitButton.disabled = false;
                    }, 3000);
                    
                    // Track submission event (analytics)
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Consultation',
                            'event_label': 'Retrofit Form'
                        });
                    }
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                submitButton.textContent = '✗ Error. Please try again.';
                submitButton.style.backgroundColor = '#dc3545';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.backgroundColor = originalBg;
                    submitButton.disabled = false;
                }, 3000);
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navCta = document.querySelector('.nav-cta');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-open');
            navCta.classList.toggle('mobile-open');
        });
    }

    // Load testimonials from API
    async function loadTestimonials() {
        try {
            const response = await fetch('/backend/api/testimonials?limit=6');
            const result = await response.json();
            
            if (result.success && result.testimonials) {
                const testimonialsContainer = document.querySelector('.testimonials-grid');
                if (testimonialsContainer) {
                    testimonialsContainer.innerHTML = '';
                    
                    result.testimonials.forEach(testimonial => {
                        const testimonialCard = createTestimonialCard(testimonial);
                        testimonialsContainer.appendChild(testimonialCard);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
        }
    }
    
    function createTestimonialCard(testimonial) {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        
        const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
        
        const content = document.createElement('div');
        content.className = 'testimonial-content';

        const text = document.createElement('div');
        text.className = 'testimonial-text';
        text.textContent = `"${testimonial.testimonial}"`;

        const rating = document.createElement('div');
        rating.className = 'testimonial-rating';
        rating.textContent = stars;

        const author = document.createElement('div');
        author.className = 'testimonial-author';

        const name = document.createElement('div');
        name.className = 'author-name';
        name.textContent = testimonial.name;

        const location = document.createElement('div');
        location.className = 'author-location';
        location.textContent = testimonial.location;

        author.appendChild(name);
        author.appendChild(location);

        content.appendChild(text);
        content.appendChild(rating);
        content.appendChild(author);

        card.appendChild(content);
        
        return card;
    }
    
    // Load testimonials on page load
    if (document.querySelector('.testimonials-grid')) {
        loadTestimonials();
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Select all elements that should fade in
    const animateElements = document.querySelectorAll(
        '.fade-in, .problem-header, .problem-card, .services-header, .service-card, ' +
        '.process-header, .process-step, .independence-content, .independence-image, ' +
        '.testimonials-header, .testimonial-card, .faq-header, .faq-item, ' +
        '.cta-content'
    );
    
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Add mobile menu styles dynamically
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .nav-links.mobile-open {
            display: flex !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .nav-cta.mobile-open {
            display: block !important;
            position: absolute;
            top: 140px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .nav.scrolled .nav-links.mobile-open {
            background: rgba(255, 255, 255, 0.98);
        }
        
        .nav-links.mobile-open a {
            color: var(--neutral-dark) !important;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
    }
`;
document.head.appendChild(mobileStyles);
