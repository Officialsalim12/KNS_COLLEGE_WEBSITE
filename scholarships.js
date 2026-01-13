document.addEventListener('DOMContentLoaded', async function() {
    const scholarshipsGrid = document.getElementById('scholarshipsGrid');
    if (!scholarshipsGrid) return;
    
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/scholarships`);
        const result = await response.json();
        
        if (!result.success || !result.scholarships || result.scholarships.length === 0) {
            scholarshipsGrid.innerHTML = `
                <div class="no-scholarships-message">
                    <p>No scholarships are currently available. Please check back later.</p>
                </div>
            `;
            return;
        }
        
        scholarshipsGrid.innerHTML = '';
        result.scholarships.forEach(scholarship => {
            scholarshipsGrid.appendChild(createScholarshipCard(scholarship));
        });
    } catch (error) {
        console.error('Error loading scholarships:', error);
        scholarshipsGrid.innerHTML = `
            <div class="error-message">
                <p>Unable to load scholarships. Please try again later.</p>
            </div>
        `;
    }
});

function createScholarshipCard(scholarship) {
    const card = document.createElement('div');
    card.className = 'scholarship-card';
    
    const deadlineDate = new Date(scholarship.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        <div class="scholarship-card-header">
            <h3 class="scholarship-card-title">${escapeHtml(scholarship.title)}</h3>
        </div>
        <div class="scholarship-card-body">
            <div class="scholarship-award-summary">
                <p class="award-amount">${escapeHtml(scholarship.award_summary)}</p>
            </div>
            <div class="scholarship-deadline">
                <strong>Deadline:</strong> ${formattedDeadline}
            </div>
        </div>
        <div class="scholarship-card-footer">
            <a href="scholarship-detail.html?id=${scholarship.id}" class="btn btn-primary btn-view-details">
                View Details
            </a>
        </div>
    `;
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
