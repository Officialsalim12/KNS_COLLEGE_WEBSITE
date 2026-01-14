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
        console.log('Fetching scholarship with API URL:', apiBaseUrl);
        const response = await fetch(`${apiBaseUrl}/api/scholarships/${scholarshipId}`);
        
        if (!response.ok) {
            console.error('API response not OK:', response.status, response.statusText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Scholarship API response:', result);
        
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
    
    // Log the scholarship data for debugging
    console.log('Scholarship data:', {
        id: scholarship.id,
        title: scholarship.title,
        guide_path: scholarship.guide_path,
        form_path: scholarship.form_path
    });
    
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
    
    // Create download form button if form_path exists
    const downloadButtonContainer = document.getElementById('downloadFormButtonContainer');
    console.log('=== Download Button Debug ===');
    console.log('Download button container:', downloadButtonContainer);
    console.log('Scholarship ID:', scholarship.id);
    console.log('Scholarship form_path:', scholarship.form_path);
    console.log('Form path type:', typeof scholarship.form_path);
    console.log('Form path trimmed:', scholarship.form_path ? scholarship.form_path.trim() : 'null/undefined');
    console.log('Form path check result:', scholarship.form_path && scholarship.form_path.trim() && scholarship.form_path !== '#');
    
    if (!downloadButtonContainer) {
        console.error('ERROR: Download button container not found in DOM!');
        console.error('Looking for element with id: downloadFormButtonContainer');
        return;
    }
    
    // Ensure container is visible
    downloadButtonContainer.style.display = '';
    
    // Check if form_path exists and is valid (not empty, not '#', not null/undefined)
    const hasValidFormPath = scholarship.form_path && 
                            typeof scholarship.form_path === 'string' && 
                            scholarship.form_path.trim() !== '' && 
                            scholarship.form_path.trim() !== '#';
    
    if (hasValidFormPath) {
        const apiBaseUrl = getApiBaseUrl();
        console.log('API Base URL:', apiBaseUrl);
        const downloadUrl = `${apiBaseUrl}/api/scholarships/${scholarship.id}/download/form`;
        console.log('Download URL:', downloadUrl);
        
        // Clear any existing content
        downloadButtonContainer.innerHTML = '';
        
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
        console.log('Download button created and appended successfully');
        console.log('Button element:', downloadButton);
        console.log('Button parent:', downloadButton.parentElement);
        console.log('Container children count:', downloadButtonContainer.children.length);
        console.log('Container display style:', window.getComputedStyle(downloadButtonContainer).display);
        console.log('Button display style:', window.getComputedStyle(downloadButton).display);
        
        // Verify button is in DOM and visible
        setTimeout(() => {
            const verifyButton = document.querySelector('#downloadFormButtonContainer .btn-download');
            if (verifyButton) {
                const computedStyle = window.getComputedStyle(verifyButton);
                console.log('✓ Button verified in DOM');
                console.log('Button computed display:', computedStyle.display);
                console.log('Button computed visibility:', computedStyle.visibility);
                console.log('Button computed opacity:', computedStyle.opacity);
                
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                    console.warn('⚠ Button exists but is hidden by CSS!');
                    verifyButton.style.display = 'inline-flex';
                    verifyButton.style.visibility = 'visible';
                }
            } else {
                console.error('✗ Button NOT found in DOM after creation!');
                console.error('Attempting to recreate button...');
                // Try to recreate if it was removed
                downloadButtonContainer.innerHTML = '';
                downloadButtonContainer.appendChild(downloadButton);
            }
        }, 100);
    } else {
        // Hide the container if no form is available
        console.log('No form_path available, hiding download button container');
        console.log('Form path value:', scholarship.form_path);
        downloadButtonContainer.style.display = 'none';
    }
    console.log('=== End Download Button Debug ===');
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
        console.log('Using CONFIG.API_BASE_URL:', CONFIG.API_BASE_URL);
        return CONFIG.API_BASE_URL;
    }
    
    // Fallback for localhost development
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isLocalhost) {
        console.log('Using localhost fallback');
        return 'http://localhost:3000';
    }
    
    // Final fallback - use window.location.origin
    console.log('Using window.location.origin fallback:', window.location.origin);
    return window.location.origin;
}
