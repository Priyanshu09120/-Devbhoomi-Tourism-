// Enhanced Uttarakhand Tourism Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initFormValidation();
    initCardInteractions();
    initScrollEffects();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show-menu');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile menu first
            if (navMenu) {
                navMenu.classList.remove('show-menu');
            }
            if (navToggle) {
                navToggle.classList.remove('active');
            }
            
            // Handle smooth scrolling
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                smoothScrollTo(targetSection);
            }
        });
    });

    // Hero CTA button functionality
    const heroCTA = document.querySelector('.hero__cta');
    if (heroCTA) {
        heroCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const bookingSection = document.querySelector('#booking');
            if (bookingSection) {
                smoothScrollTo(bookingSection);
            }
        });
    }

    // Header background on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });
    }
}

// Enhanced form validation
function initFormValidation() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const fields = {
        name: {
            element: document.getElementById('name'),
            validators: [
                { fn: (val) => val.trim().length >= 2, msg: 'Name must be at least 2 characters long' },
                { fn: (val) => /^[a-zA-Z\s]+$/.test(val.trim()), msg: 'Name should only contain letters and spaces' }
            ]
        },
        email: {
            element: document.getElementById('email'),
            validators: [
                { fn: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), msg: 'Please enter a valid email address' }
            ]
        },
        phone: {
            element: document.getElementById('phone'),
            validators: [
                { fn: (val) => /^[0-9]{10}$/.test(val.replace(/\D/g, '')), msg: 'Please enter a valid 10-digit phone number' }
            ]
        },
        location: {
            element: document.getElementById('location'),
            validators: [
                { fn: (val) => val.trim() !== '', msg: 'Please select a destination' }
            ]
        },
        checkin: {
            element: document.getElementById('checkin'),
            validators: [
                { fn: (val) => val.trim() !== '', msg: 'Please select a check-in date' },
                { fn: (val) => {
                    if (!val) return false;
                    const selectedDate = new Date(val);
                    const today = new Date();
                    // Set today to start of day for accurate comparison
                    today.setHours(0, 0, 0, 0);
                    return selectedDate >= today;
                }, msg: 'Check-in date must be today or in the future' }
            ]
        },
        checkout: {
            element: document.getElementById('checkout'),
            validators: [
                { fn: (val) => val.trim() !== '', msg: 'Please select a check-out date' },
                { fn: (val, fields) => {
                    const checkin = fields.checkin.element.value;
                    if (!checkin || !val) return false;
                    const checkinDate = new Date(checkin);
                    const checkoutDate = new Date(val);
                    return checkoutDate > checkinDate;
                }, msg: 'Check-out date must be after check-in date' }
            ]
        },
        people: {
            element: document.getElementById('people'),
            validators: [
                { fn: (val) => val.trim() !== '', msg: 'Please select number of people' }
            ]
        }
    };

    // Set minimum dates
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    if (fields.checkin.element) {
        fields.checkin.element.setAttribute('min', minDate);
    }
    if (fields.checkout.element) {
        fields.checkout.element.setAttribute('min', minDate);
    }

    // Add real-time validation
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        if (field.element) {
            field.element.addEventListener('blur', () => validateField(fieldName, fields));
            field.element.addEventListener('input', () => {
                // Clear error state on input
                clearFieldError(fieldName);
                // Validate after a short delay for better UX
                clearTimeout(field.timeout);
                field.timeout = setTimeout(() => validateField(fieldName, fields), 300);
            });
        }
    });

    // Special handling for checkout date when checkin changes
    if (fields.checkin.element && fields.checkout.element) {
        fields.checkin.element.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const minCheckout = nextDay.toISOString().split('T')[0];
            fields.checkout.element.setAttribute('min', minCheckout);
            
            // Clear checkout if it's now invalid
            const currentCheckout = fields.checkout.element.value;
            if (currentCheckout && new Date(currentCheckout) <= checkinDate) {
                fields.checkout.element.value = '';
                clearFieldError('checkout');
            }
            
            // Revalidate checkout field
            if (currentCheckout) {
                setTimeout(() => validateField('checkout', fields), 100);
            }
        });
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission(fields);
    });
}

function validateField(fieldName, fields) {
    const field = fields[fieldName];
    if (!field || !field.element) return true;

    const value = field.element.value;
    const validators = field.validators || [];

    for (let validator of validators) {
        if (!validator.fn(value, fields)) {
            showFieldError(fieldName, validator.msg);
            field.element.classList.add('invalid');
            field.element.classList.remove('valid');
            return false;
        }
    }

    clearFieldError(fieldName);
    field.element.classList.add('valid');
    field.element.classList.remove('invalid');
    return true;
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function validateAllFields(fields) {
    let isValid = true;
    Object.keys(fields).forEach(fieldName => {
        if (!validateField(fieldName, fields)) {
            isValid = false;
        }
    });
    return isValid;
}

function handleFormSubmission(fields) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const messageDiv = document.getElementById('form-message');

    // Hide any existing messages
    messageDiv.classList.remove('show');

    // Validate all fields
    if (!validateAllFields(fields)) {
        showFormMessage('Please fix the errors above before submitting.', 'error');
        // Focus on first invalid field
        const firstInvalid = document.querySelector('.form-control.invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');

    // Collect form data
    const formData = {};
    Object.keys(fields).forEach(fieldName => {
        if (fields[fieldName].element) {
            formData[fieldName] = fields[fieldName].element.value;
        }
    });
    
    // Add message if provided
    const messageField = document.getElementById('message');
    if (messageField) {
        formData.message = messageField.value;
    }

    // Simulate API call
    setTimeout(() => {
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');

        // Show success message
        const locationName = getLocationName(formData.location);
        const checkinDate = formatDate(formData.checkin);
        const checkoutDate = formatDate(formData.checkout);
        const peopleText = formData.people === '1' ? '1 person' : `${formData.people} people`;

        const successMessage = `🎉 Thank you, ${formData.name}! We've found amazing packages for ${locationName} from ${checkinDate} to ${checkoutDate} for ${peopleText}. Our travel expert will contact you at ${formData.email} within 2 hours with personalized recommendations!`;
        
        showFormMessage(successMessage, 'success');

        // Reset form
        document.getElementById('booking-form').reset();
        
        // Clear all field states
        Object.keys(fields).forEach(fieldName => {
            if (fields[fieldName].element) {
                fields[fieldName].element.classList.remove('valid', 'invalid');
                clearFieldError(fieldName);
            }
        });

        // Reset date minimums
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        if (fields.checkin.element) fields.checkin.element.setAttribute('min', minDate);
        if (fields.checkout.element) fields.checkout.element.setAttribute('min', minDate);

        // Scroll to success message
        setTimeout(() => {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);

    }, 2000);
}

function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type} show`;
        
        // Auto-hide after 10 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, 10000);
        } else {
            // Auto-hide error messages after 5 seconds
            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, 5000);
        }
    }
}

// Card interactions
function initCardInteractions() {
    // Destination cards
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.destination-card__title')?.textContent;
            const price = this.querySelector('.destination-card__price')?.textContent;
            const destination = this.getAttribute('data-destination');
            
            if (title && price) {
                showTemporaryMessage(`✨ ${title} package starting from ${price}! Fill the booking form above to get detailed information and personalized recommendations.`, 'info');
                
                // Pre-fill destination if possible
                const locationSelect = document.getElementById('location');
                if (locationSelect && destination) {
                    const locationMap = {
                        'harshil-valley': 'tehri',
                        'panch-kedar': 'kedarnath',
                        'tungnath-chopta': 'kedarnath',
                        'valley-of-flowers': 'nainital'
                    };
                    const locationValue = locationMap[destination];
                    if (locationValue) {
                        locationSelect.value = locationValue;
                        locationSelect.classList.add('valid');
                        clearFieldError('location');
                    }
                }
                
                smoothScrollTo(document.querySelector('#booking'));
            }
        });
    });

    // Trek cards
    const trekCards = document.querySelectorAll('.trek-card');
    trekCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.trek-card__title')?.textContent;
            const price = this.querySelector('.trek-card__price')?.textContent;
            
            if (title && price) {
                showTemporaryMessage(`🥾 ${title} available at ${price}! Book now through our form to secure your adventure in the Himalayas.`, 'info');
                smoothScrollTo(document.querySelector('#booking'));
            }
        });
    });

    // Explore items
    const exploreItems = document.querySelectorAll('.explore__item');
    exploreItems.forEach(item => {
        item.addEventListener('click', function() {
            const destination = this.textContent.trim();
            showTemporaryMessage(`🗺️ Exploring ${destination}... Check out our curated packages in the destinations section above!`, 'info');
            smoothScrollTo(document.querySelector('#destinations'));
        });
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for fade-in animation
    const sections = document.querySelectorAll('.destinations, .treks, .explore');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });
}

function initAnimations() {
    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-card__number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Utility functions
function smoothScrollTo(element) {
    if (!element) return;
    
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 70;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function showTemporaryMessage(message, type = 'info') {
    // Create temporary message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'temp-message';
    messageDiv.textContent = message;
    
    // Style the message
    Object.assign(messageDiv.style, {
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? 'rgba(192, 21, 47, 0.95)' : 'rgba(33, 128, 141, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        maxWidth: '90vw',
        width: 'auto',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        opacity: '0',
        transition: 'all 0.3s ease',
        pointerEvents: 'none'
    });
    
    document.body.appendChild(messageDiv);
    
    // Show message
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Hide and remove message
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 4000);
}

function getLocationName(value) {
    const locations = {
        'rishikesh': 'Rishikesh',
        'mussorie': 'Mussorie', 
        'tehri': 'Tehri',
        'nainital': 'Nainital',
        'kedarnath': 'Kedarnath',
        'badrinath': 'Badrinath'
    };
    return locations[value] || value;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function animateCounter(element) {
    const text = element.textContent;
    const target = parseInt(text.replace(/[^\d]/g, ''));
    const suffix = text.replace(/[\d]/g, '');
    let current = 0;
    const increment = target / 60;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 25);
}

// Additional event listeners
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

window.addEventListener('resize', function() {
    // Close mobile menu on resize to larger screen
    if (window.innerWidth > 768) {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        if (navMenu) navMenu.classList.remove('show-menu');
        if (navToggle) navToggle.classList.remove('active');
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        if (navMenu && navMenu.classList.contains('show-menu')) {
            navMenu.classList.remove('show-menu');
            if (navToggle) navToggle.classList.remove('active');
        }
        
        // Also hide any temporary messages
        const tempMessages = document.querySelectorAll('.temp-message');
        tempMessages.forEach(msg => msg.remove());
        
        // Hide form message if it's an error
        const formMessage = document.getElementById('form-message');
        if (formMessage && formMessage.classList.contains('error')) {
            formMessage.classList.remove('show');
        }
    }
});

// Enhanced error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Failed to load image:', e.target.src);
        
        // Show fallback content
        const parent = e.target.parentElement;
        if (parent && !parent.querySelector('.image-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: var(--color-bg-1);
                    color: var(--color-text-secondary);
                    font-size: 24px;
                ">
                    🏔️
                </div>
            `;
            parent.appendChild(fallback);
        }
    }
}, true);