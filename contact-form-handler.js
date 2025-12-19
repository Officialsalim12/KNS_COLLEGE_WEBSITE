/**
 * Contact Form Handler
 * Handles form submission using SendGrid via backend API
 * Sends emails to: admission@kns.edu.sl
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const subject = formData.get('subject');
            const message = formData.get('message');
            const newsletter = formData.get('newsletter') === 'yes';
            
            // Validate required fields
            if (!name || !email || !subject || !message) {
                showFormMessage('error', 'Please fill in all required fields.');
                return;
            }
            
            // Get submit button
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                // Get API base URL from config
                const apiBaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
                    ? CONFIG.API_BASE_URL 
                    : 'http://localhost:3000';
                
                const endpoint = (typeof CONFIG !== 'undefined' && CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.CONTACTS)
                    ? CONFIG.ENDPOINTS.CONTACTS
                    : '/api/contacts';
                
                // Send form data to backend API
                const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone || null,
                        subject: subject,
                        message: message,
                        newsletter: newsletter
                    })
                });
                
                // Check if response is ok before parsing JSON
                if (!response.ok) {
                    let errorText = 'Failed to send message';
                    try {
                        const errorData = await response.json();
                        errorText = errorData.error || errorText;
                    } catch (e) {
                        errorText = `Server error: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorText);
                }
                
                const result = await response.json();
                
                // Check if request was successful
                if (result.success) {
                    // Show success message
                    showFormMessage('success', 'Thank you for contacting us! Your message has been sent successfully. We will get back to you soon.');
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                
                // Handle different types of errors
                const errorMessage = error.message || error.toString() || '';
                const errorName = error.name || '';
                
                // Check for network/fetch errors
                if (errorName === 'TypeError' || 
                    errorMessage.includes('Failed to fetch') || 
                    errorMessage.includes('NetworkError') ||
                    errorMessage.includes('network') ||
                    errorMessage.includes('ECONNREFUSED') ||
                    errorMessage.includes('ERR_CONNECTION_REFUSED')) {
                    showFormMessage('error', 'Cannot connect to server. Please make sure the server is running. If you\'re testing locally, start the server with: npm start');
                } else if (errorMessage.includes('Server error')) {
                    showFormMessage('error', errorMessage);
                } else {
                    showFormMessage('error', 'Sorry, there was an error sending your message. Please try again later or contact us directly at +232 79 422 442.');
                }
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    
    // Function to show form messages
    function showFormMessage(type, message) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.textContent = message;
        
        // Insert before submit button
        const submitBtn = contactForm.querySelector('.submit-btn');
        contactForm.insertBefore(messageDiv, submitBtn);
        
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

