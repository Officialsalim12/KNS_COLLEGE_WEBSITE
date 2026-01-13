document.addEventListener('DOMContentLoaded', async function() {
    const scholarshipsGrid = document.getElementById('scholarshipsGrid');
    if (!scholarshipsGrid) return;
    
    try {
        // Get API base URL from config
        const apiBaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
            ? CONFIG.API_BASE_URL 
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '')
                ? 'http://localhost:3000'
                : window.location.origin;
        
        const endpoint = (typeof CONFIG !== 'undefined' && CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.SCHOLARSHIPS)
            ? CONFIG.ENDPOINTS.SCHOLARSHIPS
            : '/api/scholarships';
        
        const fullUrl = `${apiBaseUrl}${endpoint}`;
        console.log('Fetching scholarships from:', fullUrl); // Debug log
        
        const response = await fetch(fullUrl);
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', response.status, response.statusText, errorText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Scholarships API response:', result); // Debug log
        
        if (!result.success) {
            console.error('API returned success: false', result);
            throw new Error(result.error || 'Failed to fetch scholarships');
        }
        
        if (!result.scholarships || result.scholarships.length === 0) {
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
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        scholarshipsGrid.innerHTML = `
            <div class="error-message">
                <p>Unable to load scholarships. Please try again later.</p>
                <p style="font-size: 0.9em; color: #666; margin-top: 0.5em;">Error: ${escapeHtml(error.message)}</p>
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

