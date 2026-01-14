document.addEventListener('DOMContentLoaded', async function() {
    // Wait for CONFIG to be available (config.js should load before this script)
    let retries = 0;
    const maxRetries = 10;
    while (typeof CONFIG === 'undefined' && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (typeof CONFIG === 'undefined') {
        console.warn('CONFIG not available after waiting, using fallback');
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const scholarshipId = urlParams.get('id');
    
    if (!scholarshipId) {
        showError('No scholarship ID provided. Please select a scholarship from the <a href="scholarships.html">scholarships page</a>.');
        return;
    }
    
    try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/scholarships/${scholarshipId}`);
        
        if (!response.ok) {
            console.error('API response not OK:', response.status, response.statusText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.scholarship) {
            showError('Scholarship not found. Please return to the <a href="scholarships.html">scholarships page</a>.');
            return;
        }
        
        populateScholarshipDetails(result.scholarship);
    } catch (error) {
        console.error('Error loading scholarship:', error);
        showError('Unable to load scholarship details. Please try again later.');
    }
});

function populateScholarshipDetails(scholarship) {
    document.getElementById('scholarshipTitle').textContent = scholarship.title;
    document.getElementById('scholarshipAward').textContent = scholarship.award_summary;
    document.title = `${scholarship.title} - Scholarships - KNS College`;
    
    const eligibilityContent = document.getElementById('eligibilityContent');
    if (scholarship.eligibility && scholarship.eligibility.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'content-list eligibility-list';
        scholarship.eligibility.forEach(req => {
            const li = document.createElement('li');
            li.textContent = req;
            ul.appendChild(li);
        });
        eligibilityContent.innerHTML = '';
        eligibilityContent.appendChild(ul);
    } else {
        eligibilityContent.innerHTML = '<p class="content-text">Eligibility requirements are being updated. Please contact the scholarships office for more information.</p>';
    }
    
    const deadlineDate = new Date(scholarship.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    
    document.getElementById('deadlineDate').innerHTML = `<span class="deadline-highlight">${formattedDeadline}</span>`;
    
    // Setup live countdown to the deadline
    const countdownElement = document.getElementById('deadlineCountdown');
    if (countdownElement) {
        function formatTimePart(value, label) {
            return `${value} ${label}${value === 1 ? '' : 's'}`;
        }
        
        function updateCountdown() {
            const now = new Date();
            const diffMs = deadlineDate.getTime() - now.getTime();
            
            if (isNaN(deadlineDate.getTime())) {
                countdownElement.textContent = 'Deadline date is being updated. Please check back later.';
                return;
            }
            
            if (diffMs <= 0) {
                countdownElement.textContent = 'The application deadline has passed.';
                countdownElement.classList.add('deadline-passed');
                return;
            }
            
            const totalSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;
            
            const parts = [];
            if (days > 0) parts.push(formatTimePart(days, 'day'));
            if (hours > 0 || days > 0) parts.push(formatTimePart(hours, 'hour'));
            if (minutes > 0 || hours > 0 || days > 0) parts.push(formatTimePart(minutes, 'minute'));
            parts.push(formatTimePart(seconds, 'second'));
            
            countdownElement.textContent = `Time remaining: ${parts.join(', ')}`;
        }
        
        // Initial render and interval
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    const subjectLineExample = document.querySelector('.subject-line-example code');
    if (subjectLineExample) {
        subjectLineExample.textContent = `Application: ${scholarship.title} - [Your Full Name]`;
    }
    
    // Create application options (download form)
    const downloadButtonContainer = document.getElementById('downloadFormButtonContainer');
    const googleFormLinkElement = document.getElementById('googleFormLink');
    
    if (!downloadButtonContainer) {
        console.error('ERROR: Download button container not found in DOM!');
        return;
    }
    
    // Ensure container is visible
    downloadButtonContainer.style.display = '';
    
    // Check if form_path exists and is valid (not empty, not '#', not null/undefined)
    const hasValidFormPath = scholarship.form_path && 
                            typeof scholarship.form_path === 'string' && 
                            scholarship.form_path.trim() !== '' && 
                            scholarship.form_path.trim() !== '#';
    
    // Check if google_form_url exists and is valid
    const hasValidGoogleFormUrl = scholarship.google_form_url && 
                                  typeof scholarship.google_form_url === 'string' && 
                                  scholarship.google_form_url.trim() !== '' && 
                                  scholarship.google_form_url.trim() !== '#';
    
    // Clear existing content
    downloadButtonContainer.innerHTML = '';
    
    // Create download button if form_path exists
    if (hasValidFormPath) {
        const apiBaseUrl = getApiBaseUrl();
        const downloadUrl = `${apiBaseUrl}/api/scholarships/${scholarship.id}/download/form`;
        
        const downloadButton = document.createElement('a');
        downloadButton.href = downloadUrl;
        downloadButton.className = 'btn btn-download btn-download-primary btn-block';
        downloadButton.style.marginBottom = 'var(--spacing-md)';
        downloadButton.style.display = 'inline-flex';
        downloadButton.style.alignItems = 'center';
        downloadButton.style.justifyContent = 'center';
        downloadButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Application Form
        `;
        downloadButton.setAttribute('download', '');
        downloadButton.setAttribute('title', 'Download the scholarship application form');
        
        downloadButtonContainer.appendChild(downloadButton);
    } else {
        // Hide the container if no form is available
        downloadButtonContainer.style.display = 'none';
    }
    
    // Update Google Form link in the text if google_form_url exists
    if (googleFormLinkElement && hasValidGoogleFormUrl) {
        googleFormLinkElement.href = scholarship.google_form_url.trim();
    } else if (googleFormLinkElement && !hasValidGoogleFormUrl) {
        // If no Google Form URL in database, use the hardcoded URL
        googleFormLinkElement.href = 'https://docs.google.com/forms/d/e/1FAIpQLSd2hRoPx7ISJe6KWJM5eKWJTT6mntqw74hG6PEfnPTInnClxg/viewform';
    }
    
    // If neither option is available, show a message
    if (!hasValidFormPath && !hasValidGoogleFormUrl) {
        const noOptionsMessage = document.createElement('p');
        noOptionsMessage.className = 'content-text';
        noOptionsMessage.style.color = '#666';
        noOptionsMessage.textContent = 'Application form options will be available soon.';
        downloadButtonContainer.appendChild(noOptionsMessage);
    }
}
    
function getFileNameFromUrl(url, fileType) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = pathname.split('/').pop();
        if (fileName && fileName.includes('.')) {
            return fileName;
        }
    } catch (e) {
        // If URL parsing fails, try to extract from path
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) {
            return lastPart;
        }
    }
    // Fallback filename based on type
    return `${fileType.toLowerCase()}-${Date.now()}.pdf`;
}

function showError(message) {
    const mainContent = document.querySelector('.content-main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="error-message">
                <h2 class="content-heading">Error</h2>
                <p class="content-text">${message}</p>
            </div>
        `;
    }
}

function getApiBaseUrl() {
    // Use CONFIG.API_BASE_URL from config.js if available (handles all production scenarios)
    if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.API_BASE_URL) {
        return CONFIG.API_BASE_URL;
    }
    
    // Fallback for localhost development
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isLocalhost) {
        return 'http://localhost:3000';
    }
    
    // Final fallback - use window.location.origin
    return window.location.origin;
}
