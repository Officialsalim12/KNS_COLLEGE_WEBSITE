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
    
    setupDownloadLink('guideDownloadLink', scholarship.guide_path);
    setupDownloadLink('sidebarGuideLink', scholarship.guide_path);
    setupDownloadLink('formDownloadLink', scholarship.form_path);
    setupDownloadLink('sidebarFormLink', scholarship.form_path);
    
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

function setupDownloadLink(elementId, filePath) {
    const link = document.getElementById(elementId);
    if (!link) return;
    
    if (filePath && filePath !== '#') {
        link.href = filePath;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = '';
    } else {
        link.style.display = 'none';
    }
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
