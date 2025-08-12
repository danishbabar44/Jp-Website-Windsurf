// Jiya Properties Main JavaScript functionality
class JiyaPropertiesApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupAnimations();
        this.setupFormValidation();
        this.setupSearchWidget();
        this.setupMarketTicker();
        this.setupDropdownAccessibility();
        this.setupStickyHeader();
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (mobileToggle && nav) {
            mobileToggle.addEventListener('click', () => {
                nav.classList.toggle('nav-open');
                mobileToggle.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.stat-card, .guide-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupSearchWidget() {
        const searchTabs = document.querySelectorAll('.search-tab');
        const searchBtn = document.querySelector('.search-btn');
        
        // Handle search tab switching
        searchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                searchTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update search button text based on active tab
                const tabType = tab.dataset.tab;
                const btnText = {
                    'buy': 'View Properties',
                    'rent': 'Find Rentals',
                    'off-plan': 'View Projects'
                };
                searchBtn.textContent = btnText[tabType] || 'View Properties';
            });
        });

        // Handle search form submission
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePropertySearch();
            });
        }
    }

    handlePropertySearch() {
        const activeTab = document.querySelector('.search-tab.active')?.dataset.tab || 'buy';
        const propertyType = document.getElementById('propertyType')?.value || '';
        const location = document.getElementById('locationInput')?.value.trim() || '';
        const priceRange = document.getElementById('priceRange')?.value || '';
        
        // Build search URL with parameters
        const searchParams = new URLSearchParams();
        if (propertyType) searchParams.set('type', propertyType);
        if (location) searchParams.set('location', location);
        if (priceRange) searchParams.set('price', priceRange);
        
        // Navigate to appropriate search page
        const searchPages = {
            'buy': 'buy.html',
            'rent': 'rent.html',
            'off-plan': 'off-plan.html'
        };
        
        const searchUrl = `${searchPages[activeTab]}?${searchParams.toString()}`;
        window.location.href = searchUrl;
    }

    setupDropdownAccessibility() {
        const dropdowns = document.querySelectorAll('.nav .dropdown');
        if (!dropdowns.length) return;

        const closeAll = () => {
            dropdowns.forEach(d => {
                const trigger = d.querySelector('.nav-link');
                const menu = d.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateY(-10px)';
                }
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        };

        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!trigger || !menu) return;

            const open = () => {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
                trigger.setAttribute('aria-expanded', 'true');
            };

            const close = () => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
                trigger.setAttribute('aria-expanded', 'false');
            };

            dropdown.addEventListener('mouseenter', open);
            dropdown.addEventListener('mouseleave', close);

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const expanded = trigger.getAttribute('aria-expanded') === 'true';
                if (expanded) {
                    close();
                } else {
                    closeAll();
                    open();
                }
            });

            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    close();
                    trigger.focus();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstLink = menu.querySelector('a, button');
                    if (firstLink) firstLink.focus();
                }
            });

            menu.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    close();
                    trigger.focus();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!(e.target.closest && e.target.closest('.dropdown'))) {
                closeAll();
            }
        });
    }

    setupStickyHeader() {
        const header = document.getElementById('site-header');
        if (!header) return;
        const onScroll = () => {
            if (window.scrollY > 10) {
                header.classList.add('is-sticky');
            } else {
                header.classList.remove('is-sticky');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    setupMarketTicker() {
        const ticker = document.querySelector('.ticker-content');
        if (!ticker) return;

        // Clone ticker content for seamless loop
        const tickerItems = ticker.innerHTML;
        ticker.innerHTML = tickerItems + tickerItems;
        
        // Pause animation on hover
        ticker.addEventListener('mouseenter', () => {
            ticker.style.animationPlayState = 'paused';
        });
        
        ticker.addEventListener('mouseleave', () => {
            ticker.style.animationPlayState = 'running';
        });
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const isValid = this.validateForm(form);
        
        if (isValid) {
            this.submitForm(form);
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (type === 'tel' && value) {
            const phoneRegex = /^(\+971|971|0)?[1-9]\d{8}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid UAE phone number';
            }
        }

        this.setFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    setFieldError(field, message) {
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (message) {
            field.classList.add('field-invalid');
            if (errorElement) {
                errorElement.textContent = message;
            } else {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = message;
                field.parentNode.appendChild(error);
            }
        } else {
            field.classList.remove('field-invalid');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('field-invalid');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            
        } catch (error) {
            this.showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Utility functions
    formatPrice(price) {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    formatArea(area) {
        return new Intl.NumberFormat('en-AE').format(area) + ' sqft';
    }

    // WhatsApp Integration
    openWhatsApp(phone, message = '') {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // Phone Call Integration
    makeCall(phone) {
        window.location.href = `tel:${phone}`;
    }

    // Email Integration
    sendEmail(email, subject = '', body = '') {
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    }
}

// Notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    color: white;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 10000;
    max-width: 400px;
    border: 1px solid #E0E0E0;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: linear-gradient(135deg, #10b981, #059669);
}

.notification-error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.notification-info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}
`;

// Add notification styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.JiyaApp = new JiyaPropertiesApp();
});

// Handle dropdowns
document.addEventListener('DOMContentLoaded', function() {
    // Dropdown behavior is handled inside JiyaPropertiesApp.setupDropdownAccessibility()
});

// Add field error styles
const fieldErrorStyles = `
.field-invalid {
    border-color: var(--primary-500) !important;
    box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
}

.field-error {
    color: var(--primary-500);
    font-size: var(--font-size-xs);
    margin-top: var(--space-1);
}
`;

const fieldStyleSheet = document.createElement('style');
fieldStyleSheet.textContent = fieldErrorStyles;
document.head.appendChild(fieldStyleSheet);