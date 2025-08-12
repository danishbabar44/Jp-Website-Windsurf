// Contact page specific functionality
class ContactManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupCharacterCounter();
        this.setupPhoneFormatting();
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', this.handleContactSubmit.bind(this));
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateContactField(input));
        });
    }

    setupCharacterCounter() {
        const messageTextarea = document.getElementById('message');
        const counter = document.getElementById('messageCount');
        
        if (messageTextarea && counter) {
            messageTextarea.addEventListener('input', () => {
                const currentLength = messageTextarea.value.length;
                const maxLength = 500;
                
                counter.textContent = currentLength;
                
                if (currentLength > maxLength) {
                    counter.style.color = 'var(--error-500)';
                    messageTextarea.value = messageTextarea.value.substring(0, maxLength);
                } else if (currentLength > maxLength * 0.9) {
                    counter.style.color = 'var(--warning-500)';
                } else {
                    counter.style.color = 'var(--gray-500)';
                }
            });
        }
    }

    setupPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Auto-add UAE country code if not present
            if (value.length > 0 && !value.startsWith('971')) {
                if (value.startsWith('0')) {
                    value = '971' + value.substring(1);
                } else if (value.length === 9) {
                    value = '971' + value;
                }
            }
            
            // Format the number
            if (value.startsWith('971')) {
                const formatted = value.replace(/(\d{3})(\d{1})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
                e.target.value = formatted;
            }
        });
    }

    validateContactField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (field.type === 'tel' && value) {
            const phoneRegex = /^\+971\s\d\s\d{3}\s\d{4}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid UAE phone number';
            }
        }

        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');
        
        // Remove existing error
        if (existingError) {
            existingError.remove();
        }
        
        if (isValid) {
            field.classList.remove('field-invalid');
            field.classList.add('field-valid');
        } else {
            field.classList.remove('field-valid');
            field.classList.add('field-invalid');
            
            if (message) {
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.textContent = message;
                formGroup.appendChild(errorElement);
            }
        }
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validate all fields
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateContactField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Please fix the errors before submitting', 'error');
            return;
        }

        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending Message...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const contactData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                interest: formData.get('interest'),
                location: formData.get('location'),
                budget: formData.get('budget'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            // Simulate API call
            await this.submitContactForm(contactData);
            
            // Show success message
            this.showNotification('Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            document.getElementById('messageCount').textContent = '0';
            
            // Clear validation states
            form.querySelectorAll('.field-valid, .field-invalid').forEach(field => {
                field.classList.remove('field-valid', 'field-invalid');
            });
            
        } catch (error) {
            this.showNotification('Something went wrong. Please try again or call us directly.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    async submitContactForm(data) {
        // In a real application, this would make an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve(data);
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 8 seconds for success, 10 for error
        const autoRemoveTime = type === 'error' ? 10000 : 8000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, autoRemoveTime);
    }
}

// Enhanced notification styles
const contactNotificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 320px;
    max-width: 500px;
    padding: 16px;
    border-radius: 12px;
    color: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(600px);
    transition: transform 0.3s ease;
    z-index: 10000;
    backdrop-filter: blur(10px);
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.notification-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
}

.notification-message {
    flex: 1;
    line-height: 1.5;
}

.notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    margin-left: 8px;
    transition: color 0.2s ease;
}

.notification-close:hover {
    color: white;
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

.field-valid {
    border-color: var(--success-500) !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.field-invalid {
    border-color: var(--error-500) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-error {
    color: var(--error-500);
    font-size: var(--font-size-xs);
    margin-top: var(--space-2);
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.field-error::before {
    content: '⚠️';
    font-size: 12px;
}
`;

// Add contact-specific styles
const contactStyleSheet = document.createElement('style');
contactStyleSheet.textContent = contactNotificationStyles;
document.head.appendChild(contactStyleSheet);

// Initialize contact manager
document.addEventListener('DOMContentLoaded', () => {
    window.ContactManager = new ContactManager();
});