/**
 * Enquiry Form Handler
 * Handles enquiry form submission using SendGrid via backend API
 * Sends emails to: enquiry@kns.sl
 */

document.addEventListener('DOMContentLoaded', function() {
    const enquiryForm = document.getElementById('enquiryForm');
    
    // Handle mutual exclusivity for course selection fields
    const courseSelectFields = document.querySelectorAll('.course-select-field');
    const programmeInterestHidden = document.getElementById('programme_interest');
    
    // Ensure dropdowns open downward on desktop
    function ensureDownwardDropdown() {
        if (window.innerWidth >= 1025) {
            courseSelectFields.forEach(select => {
                // Ensure the select field and its container have proper positioning
                const formGroup = select.closest('.form-group');
                if (formGroup) {
                    formGroup.style.position = 'relative';
                    formGroup.style.overflow = 'visible';
                }
                
                // On focus/click, ensure dropdown opens downward
                select.addEventListener('mousedown', function(e) {
                    // Check available space
                    const rect = this.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const spaceBelow = viewportHeight - rect.bottom;
                    const spaceAbove = rect.top;
                    
                    // If there's significantly more space above than below, 
                    // scroll slightly to encourage downward opening
                    if (spaceAbove > spaceBelow && spaceBelow < 400) {
                        // Small scroll adjustment to ensure dropdown opens downward
                        setTimeout(() => {
                            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                            window.scrollTo({
                                top: currentScroll + 50,
                                behavior: 'smooth'
                            });
                        }, 10);
                    }
                });
            });
        }
    }
    
    // Run on load and resize
    ensureDownwardDropdown();
    window.addEventListener('resize', function() {
        ensureDownwardDropdown();
    });
    
    if (courseSelectFields.length > 0) {
        courseSelectFields.forEach(field => {
            field.addEventListener('change', function() {
                const selectedValue = this.value;
                
                // If a value is selected in this field
                if (selectedValue) {
                    // Clear and disable all other course selection fields
                    courseSelectFields.forEach(otherField => {
                        if (otherField !== this) {
                            otherField.value = '';
                            otherField.disabled = true;
                        }
                    });
                    
                    // Update the hidden field with the selected value
                    if (programmeInterestHidden) {
                        programmeInterestHidden.value = selectedValue;
                    }
                } else {
                    // If this field is cleared, enable all fields
                    courseSelectFields.forEach(otherField => {
                        otherField.disabled = false;
                    });
                    
                    // Clear the hidden field
                    if (programmeInterestHidden) {
                        programmeInterestHidden.value = '';
                    }
                }
            });
        });
    }
    
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(enquiryForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const preferredIntake = formData.get('preferred_intake');
            const message = formData.get('message');
            const newsletter = formData.get('newsletter') === 'yes';
            
            // Get the selected programme from the hidden field or from any selected course field
            let programmeInterest = programmeInterestHidden ? programmeInterestHidden.value : '';
            if (!programmeInterest) {
                // Fallback: check each course field to find the selected one
                courseSelectFields.forEach(field => {
                    if (field.value) {
                        programmeInterest = field.value;
                    }
                });
            }
            
            // Validate required fields
            if (!name || !email || !programmeInterest) {
                showEnquiryMessage('error', 'Please fill in all required fields and select a programme from one of the course fields.');
                return;
            }
            
            // Get submit button
            const submitBtn = enquiryForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                // Get API base URL from config
                const apiBaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
                    ? CONFIG.API_BASE_URL 
                    : 'http://localhost:3000';
                
                const endpoint = (typeof CONFIG !== 'undefined' && CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.ENQUIRIES)
                    ? CONFIG.ENDPOINTS.ENQUIRIES
                    : '/api/enquiries';
                
                // Check if we're trying to use same-origin API in production (which won't work on static hosting)
                const isProduction = window.location.hostname !== 'localhost' && 
                                    window.location.hostname !== '127.0.0.1' && 
                                    window.location.hostname !== '';
                const isSameOrigin = apiBaseUrl === window.location.origin;
                
                if (isProduction && isSameOrigin) {
                    throw new Error('Backend API not configured. Please set PRODUCTION_API_URL in config.js to your deployed backend server URL.');
                }
                
                // Send form data to backend API
                const fullUrl = `${apiBaseUrl}${endpoint}`;
                console.log('Submitting enquiry form to:', fullUrl); // Debug log
                
                const response = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone || null,
                        programme_interest: programmeInterest,
                        preferred_intake: preferredIntake || null,
                        message: message || null,
                        newsletter: newsletter
                    })
                });
                
                // Check if response is ok before parsing JSON
                if (!response.ok) {
                    console.error('API response not OK:', response.status, response.statusText);
                    let errorText = 'Failed to submit enquiry';
                    try {
                        const errorData = await response.json();
                        console.error('Error response data:', errorData);
                        errorText = errorData.error || errorText;
                    } catch (e) {
                        const responseText = await response.text();
                        console.error('Response text:', responseText);
                        errorText = `Server error: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorText);
                }
                
                const result = await response.json();
                
                // Check if request was successful
                if (result.success) {
                    // Show success message
                    showEnquiryMessage('success', 'Thank you for your enquiry! Our admissions team will contact you soon with detailed information about the programme.');
                    
                    // Reset form
                    enquiryForm.reset();
                    
                    // Re-enable all course selection fields after reset
                    courseSelectFields.forEach(field => {
                        field.disabled = false;
                    });
                } else {
                    throw new Error(result.error || 'Failed to submit enquiry');
                }
            } catch (error) {
                console.error('Error submitting enquiry form:', error);
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                
                // Handle different types of errors
                const errorMessage = error.message || error.toString() || '';
                const errorName = error.name || '';
                
                // Check for network/fetch errors
                if (errorName === 'TypeError' || 
                    errorMessage.includes('Failed to fetch') || 
                    errorMessage.includes('NetworkError') ||
                    errorMessage.includes('network') ||
                    errorMessage.includes('ECONNREFUSED') ||
                    errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                    errorMessage.includes('404')) {
                    if (errorMessage.includes('Backend API not configured')) {
                        showEnquiryMessage('error', errorMessage + ' For now, please contact us directly at admissions@kns.edu.sl or +232 79 422 442.');
                    } else if (errorMessage.includes('404')) {
                        showEnquiryMessage('error', 'Backend API endpoint not found (404). Please configure PRODUCTION_API_URL in config.js. For now, please contact us directly at admissions@kns.edu.sl or +232 79 422 442.');
                    } else {
                        showEnquiryMessage('error', 'Cannot connect to server. Please make sure the backend server is running and PRODUCTION_API_URL is set correctly in config.js. For now, please contact us directly at admissions@kns.edu.sl or +232 79 422 442.');
                    }
                } else if (errorMessage.includes('Server error')) {
                    showEnquiryMessage('error', errorMessage);
                } else {
                    showEnquiryMessage('error', 'Sorry, there was an error submitting your enquiry. Please try again later or contact us directly at +232 79 422 442.');
                }
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    
    // Function to show form messages
    function showEnquiryMessage(type, message) {
        // Remove existing messages
        const existingMessage = document.querySelector('.enquiry-form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `enquiry-form-message enquiry-form-message-${type}`;
        messageDiv.textContent = message;
        
        // Insert before submit button
        const submitBtn = enquiryForm.querySelector('.submit-btn');
        enquiryForm.insertBefore(messageDiv, submitBtn);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove message after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.3s';
                setTimeout(() => messageDiv.remove(), 300);
            }, 5000);
        }
    }
});

