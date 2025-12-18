/**
 * Enquiry Form Handler
 * Handles enquiry form submission using EmailJS (no database or backend required)
 * 
 * Uses the same EmailJS configuration as the contact form
 */

// EmailJS Configuration (shared with contact form)
// Replace these with your EmailJS credentials
const ENQUIRY_EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',        // Your EmailJS Public Key
    SERVICE_ID: 'YOUR_SERVICE_ID',        // Your EmailJS Service ID (can be same as contact form)
    TEMPLATE_ID: 'YOUR_ENQUIRY_TEMPLATE_ID', // Your EmailJS Template ID for enquiries
    TO_EMAIL: 'admission@kns.edu.sl'     // Recipient email address
};

document.addEventListener('DOMContentLoaded', function() {
    const enquiryForm = document.getElementById('enquiryForm');
    
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                showEnquiryMessage('error', 'Email service is not configured. Please contact the administrator.');
                return;
            }
            
            // Check if EmailJS is configured
            if (ENQUIRY_EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || 
                ENQUIRY_EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
                ENQUIRY_EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_ENQUIRY_TEMPLATE_ID') {
                showEnquiryMessage('error', 'Email service is not configured. Please contact the administrator.');
                console.error('EmailJS is not configured. Please update ENQUIRY_EMAILJS_CONFIG in enquiry-form-handler.js');
                return;
            }
            
            // Get form data
            const formData = new FormData(enquiryForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const programmeInterest = formData.get('programme_interest');
            const preferredIntake = formData.get('preferred_intake');
            const message = formData.get('message');
            const newsletter = formData.get('newsletter') === 'yes';
            
            // Validate required fields
            if (!name || !email || !programmeInterest) {
                showEnquiryMessage('error', 'Please fill in all required fields.');
                return;
            }
            
            // Get submit button
            const submitBtn = enquiryForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                // Initialize EmailJS with public key
                emailjs.init(ENQUIRY_EMAILJS_CONFIG.PUBLIC_KEY);
                
                // Prepare template parameters
                const templateParams = {
                    to_email: ENQUIRY_EMAILJS_CONFIG.TO_EMAIL,
                    from_name: name,
                    from_email: email,
                    phone: phone || 'Not provided',
                    programme_interest: programmeInterest,
                    preferred_intake: preferredIntake || 'Not specified',
                    message: message || 'No additional message',
                    newsletter: newsletter ? 'Yes' : 'No',
                    date: new Date().toLocaleString()
                };
                
                // Send email using EmailJS
                const response = await emailjs.send(
                    ENQUIRY_EMAILJS_CONFIG.SERVICE_ID,
                    ENQUIRY_EMAILJS_CONFIG.TEMPLATE_ID,
                    templateParams
                );
                
                // Check if email was sent successfully
                if (response.status === 200) {
                    // Show success message
                    showEnquiryMessage('success', 'Thank you for your enquiry! Our admissions team will contact you soon with detailed information about the programme.');
                    
                    // Reset form
                    enquiryForm.reset();
                } else {
                    throw new Error('Failed to send email');
                }
            } catch (error) {
                console.error('Error submitting enquiry form:', error);
                
                // Handle different types of errors
                const errorMessage = error.text || error.message || error.toString() || '';
                
                if (errorMessage.includes('Invalid template ID') || errorMessage.includes('Invalid service ID')) {
                    showEnquiryMessage('error', 'Email service configuration error. Please contact the administrator.');
                } else if (errorMessage.includes('Quota') || errorMessage.includes('limit')) {
                    showEnquiryMessage('error', 'Email service quota exceeded. Please try again later or contact us directly at +232 79 422 442.');
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

