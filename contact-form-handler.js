/**
 * Contact Form Handler
 * Handles form submission using EmailJS (no database or backend required)
 * 
 * Setup Instructions:
 * 1. Sign up for a free account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template
 * 4. Get your Public Key, Service ID, and Template ID
 * 5. Update the CONFIG object below with your credentials
 */

// EmailJS Configuration
// Replace these with your EmailJS credentials
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',        // Your EmailJS Public Key
    SERVICE_ID: 'YOUR_SERVICE_ID',       // Your EmailJS Service ID
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID',      // Your EmailJS Template ID
    TO_EMAIL: 'admission@kns.edu.sl'      // Recipient email address
};

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                showFormMessage('error', 'Email service is not configured. Please contact the administrator.');
                return;
            }
            
            // Check if EmailJS is configured
            if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || 
                EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
                EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
                showFormMessage('error', 'Email service is not configured. Please contact the administrator.');
                console.error('EmailJS is not configured. Please update EMAILJS_CONFIG in contact-form-handler.js');
                return;
            }
            
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
                // Initialize EmailJS with public key
                emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                
                // Prepare template parameters
                const templateParams = {
                    to_email: EMAILJS_CONFIG.TO_EMAIL,
                    from_name: name,
                    from_email: email,
                    phone: phone || 'Not provided',
                    subject: subject,
                    message: message,
                    newsletter: newsletter ? 'Yes' : 'No',
                    date: new Date().toLocaleString()
                };
                
                // Send email using EmailJS
                const response = await emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    templateParams
                );
                
                // Check if email was sent successfully
                if (response.status === 200) {
                    // Show success message
                    showFormMessage('success', 'Thank you for contacting us! Your message has been sent successfully. We will get back to you soon.');
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send email');
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                
                // Handle different types of errors
                const errorMessage = error.text || error.message || error.toString() || '';
                
                if (errorMessage.includes('Invalid template ID') || errorMessage.includes('Invalid service ID')) {
                    showFormMessage('error', 'Email service configuration error. Please contact the administrator.');
                } else if (errorMessage.includes('Quota') || errorMessage.includes('limit')) {
                    showFormMessage('error', 'Email service quota exceeded. Please try again later or contact us directly at +232 79 422 442.');
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

