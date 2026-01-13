document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const scholarshipId = urlParams.get('id');
    
    if (!scholarshipId) {
        showError('No scholarship ID provided. Please select a scholarship from the <a href="scholarships.html">scholarships page</a>.');
        return;
    }
    
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/scholarships/${scholarshipId}`);
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
    
    // Log the scholarship data for debugging
    console.log('Scholarship data:', {
        id: scholarship.id,
        title: scholarship.title,
        guide_path: scholarship.guide_path,
        form_path: scholarship.form_path
    });
    
    const scholarshipId = new URLSearchParams(window.location.search).get('id');
    
    setupDownloadLink('guideDownloadLink', scholarship.guide_path, 'Guide', scholarshipId);
    setupDownloadLink('sidebarGuideLink', scholarship.guide_path, 'Guide', scholarshipId);
    setupDownloadLink('formDownloadLink', scholarship.form_path, 'Form', scholarshipId);
    setupDownloadLink('sidebarFormLink', scholarship.form_path, 'Form', scholarshipId);
    
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
    
    const subjectLineExample = document.querySelector('.subject-line-example code');
    if (subjectLineExample) {
        subjectLineExample.textContent = `Application: ${scholarship.title} - [Your Full Name]`;
    }
}

function setupDownloadLink(elementId, filePath, fileType, scholarshipId) {
    const link = document.getElementById(elementId);
    if (!link) {
        console.warn(`Download link element not found: ${elementId}`);
        return;
    }
    
    if (!filePath || filePath === '#' || filePath.trim() === '') {
        console.warn(`No file path provided for ${elementId}`);
        link.style.display = 'none';
        return;
    }
    
    // Construct the proper download URL
    let downloadUrl;
    const trimmedPath = filePath.trim();
    
    // If it's already a full URL (http:// or https://), use it as is
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
        downloadUrl = trimmedPath;
    } 
    // If we have a scholarship ID, always use the API endpoint for better reliability
    else if (scholarshipId) {
        const apiBaseUrl = getApiBaseUrl();
        const downloadType = fileType.toLowerCase();
        downloadUrl = `${apiBaseUrl}/api/scholarships/${scholarshipId}/download/${downloadType}`;
    }
    // Otherwise, try static file path
    else {
        // If it starts with /, it's an absolute path - use it as is
        if (trimmedPath.startsWith('/')) {
            downloadUrl = trimmedPath;
        }
        // If it contains 'scholarships/', normalize it
        else if (trimmedPath.includes('scholarships/')) {
            downloadUrl = '/' + trimmedPath.replace(/^\/+/, '');
        }
        // Otherwise, assume it's a filename and prepend /scholarships/
        else {
            // Remove any leading slashes or 'scholarships/' prefix
            const cleanPath = trimmedPath.replace(/^\/+/, '').replace(/^scholarships\//, '');
            downloadUrl = `/scholarships/${cleanPath}`;
        }
    }
    
    // Set the href for fallback
    link.href = downloadUrl;
    link.style.display = '';
    
    // Remove target="_blank" to prevent opening in new tab
    link.removeAttribute('target');
    
    // Add click handler to programmatically download the file
    link.addEventListener('click', async function(e) {
        e.preventDefault(); // Prevent default navigation
        e.stopPropagation();
        
        console.log(`Download button clicked: ${fileType}`);
        console.log(`Download URL: ${downloadUrl}`);
        
        try {
            // For external URLs (http/https), use direct download
            if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
                // Check if it's an external URL (not our API)
                const isExternalUrl = !downloadUrl.includes('/api/scholarships/');
                if (isExternalUrl) {
                    // For external URLs, open in new tab (they handle their own download)
                    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                    return;
                }
            }
            
            // For API endpoints or same-origin files, fetch and download programmatically
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }
            
            // Get the blob from the response
            const blob = await response.blob();
            
            // Get filename from Content-Disposition header or use default
            let filename = `${fileType.toLowerCase()}-${scholarshipId || 'file'}.pdf`;
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Create a temporary URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log(`Download started: ${filename}`);
        } catch (error) {
            console.error('Download error:', error);
            alert(`Failed to download ${fileType.toLowerCase()}. Please try again or contact support.`);
        }
    });
    
    console.log(`Download link configured for ${elementId} (${fileType}): ${downloadUrl}`);
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
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isLocalhost) {
        return 'http://localhost:3000';
    }
    
    if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
        if (CONFIG.API_BASE_URL.startsWith('http://') || CONFIG.API_BASE_URL.startsWith('https://')) {
            return CONFIG.API_BASE_URL;
        }
        return `https://${CONFIG.API_BASE_URL}`;
    }
    
    return window.location.origin;
}
