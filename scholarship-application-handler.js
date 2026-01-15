/**
 * Scholarship Application Form Handler
 * Handles scholarship application form submission
 * Note: Supporting documents must be submitted in person at the office
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Scholarship application form handler loading...');
    
    const form = document.getElementById('scholarshipApplicationForm');
    const personalStatement = document.getElementById('personal_statement');
    const wordCountElement = document.getElementById('word_count');
    const previousApplication = document.getElementById('previous_application');
    const previousApplicationDetailsGroup = document.getElementById('previous_application_details_group');
    const previousApplicationDetails = document.getElementById('previous_application_details');
    
    // Debug: Check if form exists
    if (!form) {
        console.error('ERROR: Scholarship application form not found! Form ID: scholarshipApplicationForm');
        return;
    }
    console.log('✓ Scholarship application form found');
    
    // Get scholarship ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const scholarshipId = urlParams.get('scholarship_id') || urlParams.get('id');
    if (scholarshipId) {
        const scholarshipIdField = document.getElementById('scholarship_id');
        if (scholarshipIdField) {
            scholarshipIdField.value = scholarshipId;
        }
    }
    
    // Word count for personal statement
    if (personalStatement && wordCountElement) {
        function updateWordCount() {
            const text = personalStatement.value.trim();
            const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
            const wordCount = words.length;
            wordCountElement.textContent = wordCount;
            
            // Update styling based on word count
            if (wordCount < 300) {
                wordCountElement.style.color = 'var(--error-color)';
                personalStatement.setCustomValidity(`Personal statement must be at least 300 words. Currently: ${wordCount} words.`);
            } else {
                wordCountElement.style.color = 'var(--success-color)';
                personalStatement.setCustomValidity('');
            }
        }
        
        personalStatement.addEventListener('input', updateWordCount);
        personalStatement.addEventListener('paste', function() {
            setTimeout(updateWordCount, 10);
        });
        updateWordCount(); // Initial count
    }
    
    // Show/hide previous application details
    if (previousApplication && previousApplicationDetailsGroup) {
        previousApplication.addEventListener('change', function() {
            if (this.value === 'Yes') {
                previousApplicationDetailsGroup.style.display = 'block';
                previousApplicationDetails.required = true;
            } else {
                previousApplicationDetailsGroup.style.display = 'none';
                previousApplicationDetails.required = false;
                previousApplicationDetails.value = '';
            }
        });
    }
    
    // File upload fields removed - documents must be submitted in person at the office
    
    // Form submission
    console.log('Setting up form submission handler...');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submit event triggered');
        
        // Validate personal statement word count
        if (!personalStatement) {
            showFormMessage('error', 'Personal statement field not found. Please refresh the page and try again.');
            console.error('ERROR: Personal statement field not found');
            return;
        }
        
        const statementText = personalStatement.value.trim();
        const words = statementText ? statementText.split(/\s+/).filter(word => word.length > 0) : [];
        console.log(`Personal statement word count: ${words.length}`);
        
        if (words.length < 300) {
            showFormMessage('error', `Personal statement must be at least 300 words. Currently: ${words.length} words.`);
            personalStatement.focus();
            return;
        }
        
        // Validate declaration checkbox
        const declaration = document.getElementById('declaration');
        if (!declaration) {
            showFormMessage('error', 'Declaration checkbox not found. Please refresh the page and try again.');
            console.error('ERROR: Declaration checkbox not found');
            return;
        }
        
        if (!declaration.checked) {
            showFormMessage('error', 'You must accept the declaration to submit your application.');
            declaration.focus();
            return;
        }
        
        console.log('Form validation passed, proceeding with submission...');
            
            // Get submit button
            const submitBtn = form.querySelector('.submit-btn');
            if (!submitBtn) {
                showFormMessage('error', 'Submit button not found. Please refresh the page and try again.');
                console.error('ERROR: Submit button not found');
                return;
            }
            
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            console.log('Submit button disabled, sending request...');
            
            try {
                // Get API base URL from config
                let apiBaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
                    ? CONFIG.API_BASE_URL 
                    : 'http://localhost:3000';
                
                const endpoint = (typeof CONFIG !== 'undefined' && CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.SCHOLARSHIP_APPLICATIONS)
                    ? CONFIG.ENDPOINTS.SCHOLARSHIP_APPLICATIONS
                    : '/api/scholarship-applications';
                
                // Check if we're trying to use same-origin API in production
                const isProduction = window.location.hostname !== 'localhost' && 
                                    window.location.hostname !== '127.0.0.1' && 
                                    window.location.hostname !== '';
                const isSameOrigin = apiBaseUrl === window.location.origin;
                
                // If in production and same-origin, use PRODUCTION_API_URL instead
                if (isProduction && isSameOrigin) {
                    if (typeof CONFIG !== 'undefined' && CONFIG.PRODUCTION_API_URL) {
                        apiBaseUrl = CONFIG.PRODUCTION_API_URL;
                    } else {
                        throw new Error('Backend API not configured. Please set PRODUCTION_API_URL in config.js to your deployed backend server URL.');
                    }
                }
                
                // Create JSON object from form data (no file uploads)
                const formData = {
                    scholarship_id: document.getElementById('scholarship_id').value || null,
                    surname: document.getElementById('surname').value,
                    first_name: document.getElementById('first_name').value,
                    other_names: document.getElementById('other_names').value || null,
                    gender: document.getElementById('gender').value,
                    date_of_birth: document.getElementById('date_of_birth').value,
                    nationality: document.getElementById('nationality').value,
                    national_id: document.getElementById('national_id').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    highest_qualification: document.getElementById('highest_qualification').value,
                    school_institution: document.getElementById('school_institution').value,
                    year_of_completion: document.getElementById('year_of_completion').value,
                    credits: document.getElementById('credits').value || null,
                    programme: document.getElementById('programme').value,
                    scholarship_type: document.getElementById('scholarship_type').value,
                    previous_application: document.getElementById('previous_application').value,
                    previous_application_details: document.getElementById('previous_application_details').value || null,
                    personal_statement: document.getElementById('personal_statement').value,
                    declaration: document.getElementById('declaration').checked ? 'on' : ''
                };
                
                // Send form data to backend API as JSON
                const fullUrl = `${apiBaseUrl}${endpoint}`;
                console.log('Sending request to:', fullUrl);
                console.log('Form data:', formData);
                
                const response = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                // Check if response is ok before parsing JSON
                if (!response.ok) {
                    console.error('API response not OK:', response.status, response.statusText);
                    let errorText = 'Failed to submit application';
                    let errorDetails = '';
                    try {
                        const errorData = await response.json();
                        console.error('Error response data:', errorData);
                        console.error('Full error response:', JSON.stringify(errorData, null, 2));
                        errorText = errorData.error || errorText;
                        errorDetails = errorData.details || errorData.message || '';
                        // Also check for common error fields
                        if (errorData.code) {
                            errorDetails += ` (Error Code: ${errorData.code})`;
                        }
                    } catch (e) {
                        const responseText = await response.text();
                        console.error('Response text:', responseText);
                        errorText = `Server error: ${response.status} ${response.statusText}`;
                        if (responseText) {
                            errorDetails = responseText;
                        }
                    }
                    const fullError = errorDetails ? `${errorText}. ${errorDetails}` : errorText;
                    console.error('Throwing error:', fullError);
                    throw new Error(fullError);
                }
                
                const result = await response.json();
                
                // Check if request was successful
                if (result.success) {
                    // Show success message
                    showFormMessage('success', 'Thank you for your scholarship application! Your application has been submitted successfully. We will review your application and contact you soon.');
                    
                    // Reset form
                    form.reset();
                    
                    // Reset word count
                    if (wordCountElement) {
                        wordCountElement.textContent = '0';
                    }
                    
                    // Hide previous application details
                    if (previousApplicationDetailsGroup) {
                        previousApplicationDetailsGroup.style.display = 'none';
                    }
                    
                    // Scroll to top to show success message
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Server returned success: false
                    const serverError = result.error || result.message || 'Failed to submit application';
                    const serverDetails = result.details || '';
                    const fullError = serverDetails ? `${serverError}. Details: ${serverDetails}` : serverError;
                    console.error('Server returned error:', fullError);
                    console.error('Full result object:', result);
                    throw new Error(fullError);
                }
            } catch (error) {
                console.error('Error submitting scholarship application:', error);
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                
                // Handle different types of errors
                const errorMessage = error.message || error.toString() || '';
                const errorName = error.name || '';
                
                // Always log the full error for debugging
                console.error('Full error for debugging:', {
                    name: errorName,
                    message: errorMessage,
                    fullError: error
                });
                
                // Check for network/fetch errors
                if (errorName === 'TypeError' || 
                    errorMessage.includes('Failed to fetch') || 
                    errorMessage.includes('NetworkError') ||
                    errorMessage.includes('network') ||
                    errorMessage.includes('ECONNREFUSED') ||
                    errorMessage.includes('ERR_CONNECTION_REFUSED')) {
                    if (errorMessage.includes('Backend API not configured')) {
                        showFormMessage('error', errorMessage + ' For now, please contact us directly at admissions@kns.edu.sl or +232 79 422 442.');
                    } else {
                        showFormMessage('error', 'Cannot connect to server. Please make sure the backend server is running. Error: ' + errorMessage);
                    }
                } else if (errorMessage.includes('404')) {
                    showFormMessage('error', 'Backend API endpoint not found (404). Please check the server configuration. Error: ' + errorMessage);
                } else {
                    // For all other errors, show the actual error message
                    // Always show the error message if it exists and is meaningful
                    if (errorMessage && errorMessage.trim().length > 0 && errorMessage.trim() !== 'Error') {
                        // Show the actual error message
                        showFormMessage('error', errorMessage);
                        console.log('Displaying error message:', errorMessage);
                    } else {
                        // Only show generic message if we truly don't have an error message
                        console.warn('No meaningful error message found, showing generic message');
                        showFormMessage('error', 'Sorry, there was an error submitting your application. Please check the browser console (F12) for details or contact us directly at +232 79 422 442.');
                    }
                }
            } finally {
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    console.log('✓ Form submission handler attached');
    
    // Also add click handler to submit button as backup
    const submitBtn = form.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            console.log('Submit button clicked directly');
            // Let the form's submit event handle it, but log for debugging
        });
        console.log('✓ Submit button click handler attached');
    } else {
        console.warn('WARNING: Submit button not found');
    }
    
    // Function to show form messages
    function showFormMessage(type, message) {
        console.log(`Showing ${type} message:`, message);
        
        // Remove existing messages
        const existingMessage = document.querySelector('.scholarship-form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `scholarship-form-message scholarship-form-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.padding = '15px';
        messageDiv.style.marginBottom = '20px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.fontWeight = '500';
        
        // Add inline styles for visibility
        if (type === 'error') {
            messageDiv.style.backgroundColor = '#fee';
            messageDiv.style.color = '#c33';
            messageDiv.style.border = '1px solid #fcc';
        } else if (type === 'success') {
            messageDiv.style.backgroundColor = '#efe';
            messageDiv.style.color = '#3c3';
            messageDiv.style.border = '1px solid #cfc';
        }
        
        // Insert before form
        const form = document.getElementById('scholarshipApplicationForm');
        if (form && form.parentElement) {
            form.parentElement.insertBefore(messageDiv, form);
            console.log('Message inserted before form');
        } else {
            // Fallback: try to insert at the top of the content section
            const contentSection = document.querySelector('.content-section');
            if (contentSection) {
                const container = contentSection.querySelector('.container');
                if (container) {
                    container.insertBefore(messageDiv, container.firstChild);
                    console.log('Message inserted at top of content section');
                } else {
                    // Last resort: append to body
                    document.body.insertBefore(messageDiv, document.body.firstChild);
                    console.log('Message inserted at top of body (fallback)');
                }
            } else {
                // Last resort: append to body
                document.body.insertBefore(messageDiv, document.body.firstChild);
                console.log('Message inserted at top of body (fallback)');
            }
        }
        
        // Scroll to message
        setTimeout(() => {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        // Remove message after 10 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.3s';
                setTimeout(() => messageDiv.remove(), 300);
            }, 10000); // Show success message for 10 seconds
        }
    }
});
