// Careers page specific functionality
class CareersManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupApplicationForm();
        this.setupFileUpload();
        this.setupJobApplications();
    }

    setupApplicationForm() {
        const form = document.getElementById('applicationForm');
        if (!form) return;

        form.addEventListener('submit', this.handleApplicationSubmit.bind(this));
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateApplicationField(input));
        });
    }

    setupFileUpload() {
        const fileInput = document.getElementById('cv');
        const fileUpload = document.querySelector('.file-upload');
        const uploadText = document.querySelector('.upload-text');
        
        if (fileInput && fileUpload) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                
                if (file) {
                    // Validate file
                    if (!this.validateFile(file)) {
                        return;
                    }
                    
                    fileUpload.classList.add('has-file');
                    uploadText.textContent = `Selected: ${file.name}`;
                } else {
                    fileUpload.classList.remove('has-file');
                    uploadText.textContent = 'Choose file or drag here';
                }
            });
            
            // Drag and drop functionality
            fileUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUpload.classList.add('drag-over');
            });
            
            fileUpload.addEventListener('dragleave', () => {
                fileUpload.classList.remove('drag-over');
            });
            
            fileUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUpload.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    setupJobApplications() {
        document.querySelectorAll('.job-apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const position = e.target.dataset.position;
                this.prefillPosition(position);
                document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    prefillPosition(position) {
        const positionSelect = document.getElementById('position');
        if (positionSelect) {
            positionSelect.value = position;
        }
    }

    validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB', 'error');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Please upload a PDF, DOC, or DOCX file', 'error');
            return false;
        }
        
        return true;
    }

    validateApplicationField(field) {
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
            const phoneRegex = /^(\+971|971|0)?[1-9]\d{8}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid UAE phone number';
            }
        }
        
        // File validation
        else if (field.type === 'file' && field.files.length > 0) {
            if (!this.validateFile(field.files[0])) {
                isValid = false;
                errorMessage = 'Please upload a valid CV file';
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

    async handleApplicationSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validate all fields
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateApplicationField(input)) {
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
        submitBtn.textContent = 'Submitting Application...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const applicationData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                position: formData.get('position'),
                experience: formData.get('experience'),
                coverLetter: formData.get('coverLetter'),
                cv: formData.get('cv')
            };
            
            // Simulate API call
            await this.submitApplication(applicationData);
            
            // Show success message
            this.showNotification('Application submitted successfully! We\'ll review your application and get back to you within 3-5 business days.', 'success');
            
            // Reset form
            form.reset();
            document.querySelector('.file-upload').classList.remove('has-file');
            document.querySelector('.upload-text').textContent = 'Choose file or drag here';
            
            // Clear validation states
            form.querySelectorAll('.field-valid, .field-invalid').forEach(field => {
                field.classList.remove('field-valid', 'field-invalid');
            });
            
        } catch (error) {
            this.showNotification('Something went wrong. Please try again or email your CV to careers@mcconeproperties.com', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    async submitApplication(data) {
        // In a real application, this would upload the CV and submit to API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve(data);
                } else {
                    reject(new Error('Network error'));
                }
            }, 3000);
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
        
        // Auto remove after 10 seconds for success, 15 for error
        const autoRemoveTime = type === 'error' ? 15000 : 10000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, autoRemoveTime);
    }
}

// Enhanced file upload styles
const fileUploadStyles = `
.file-upload.drag-over .file-upload-label {
    border-color: var(--primary-500);
    background: var(--primary-100);
    transform: scale(1.02);
}

.file-upload.has-file .file-upload-label {
    border-color: var(--success-400);
    background: var(--success-50);
}

.file-upload.has-file .upload-text {
    color: var(--success-700);
    font-weight: 600;
}

.file-upload.has-file .upload-icon {
    color: var(--success-500);
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

// Add careers-specific styles
const careersStyleSheet = document.createElement('style');
careersStyleSheet.textContent = fileUploadStyles;
document.head.appendChild(careersStyleSheet);

// Initialize careers manager
document.addEventListener('DOMContentLoaded', () => {
    window.CareersManager = new CareersManager();
});