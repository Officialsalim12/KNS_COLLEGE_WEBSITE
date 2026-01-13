// Wait for config to load if it hasn't already
function waitForConfig(callback, maxAttempts = 10) {
    let attempts = 0;
    const checkConfig = () => {
        attempts++;
        if (typeof CONFIG !== 'undefined' || attempts >= maxAttempts) {
            callback();
        } else {
            setTimeout(checkConfig, 100);
        }
    };
    checkConfig();
}

document.addEventListener('DOMContentLoaded', async function() {
    const scholarshipsGrid = document.getElementById('scholarshipsGrid');
    if (!scholarshipsGrid) {
        console.error('Scholarships grid element not found');
        return;
    }
    
    // Wait for CONFIG to be available (config.js should load first, but just in case)
    waitForConfig(async () => {
        await loadScholarships(scholarshipsGrid);
    });
});

async function loadScholarships(scholarshipsGrid) {
    
    try {
        // Get API base URL from config
        // CONFIG should be loaded before this script (config.js must be included first)
        let apiBaseUrl;
        if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
            apiBaseUrl = CONFIG.API_BASE_URL;
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
            apiBaseUrl = 'http://localhost:3000';
        } else {
            // Fallback: Use Render backend if CONFIG is not available
            apiBaseUrl = 'https://kns-college-website.onrender.com';
            console.warn('CONFIG not found, using fallback Render backend URL');
        }
        
        const endpoint = (typeof CONFIG !== 'undefined' && CONFIG.ENDPOINTS && CONFIG.ENDPOINTS.SCHOLARSHIPS)
            ? CONFIG.ENDPOINTS.SCHOLARSHIPS
            : '/api/scholarships';
        
        const fullUrl = `${apiBaseUrl}${endpoint}`;
        console.log('=== Scholarships Fetch Debug ===');
        console.log('Fetching scholarships from:', fullUrl);
        console.log('Current origin:', window.location.origin);
        console.log('CONFIG available:', typeof CONFIG !== 'undefined');
        console.log('CONFIG.API_BASE_URL:', typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'N/A');
        console.log('===============================');
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Add credentials for CORS if needed
            credentials: 'omit'
        });
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
                const errorJson = JSON.parse(errorText);
                console.error('API response error:', response.status, response.statusText, errorJson);
                throw new Error(errorJson.error || errorJson.details || `API request failed: ${response.status} ${response.statusText}`);
            } catch (parseError) {
                errorText = await response.text().catch(() => 'Unknown error');
                console.error('API response error (non-JSON):', response.status, response.statusText, errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
            }
        }
        
        const result = await response.json();
        console.log('Scholarships API response:', result); // Debug log
        
        if (!result.success) {
            console.error('API returned success: false', result);
            const errorMsg = result.error || result.details || 'Failed to fetch scholarships';
            throw new Error(errorMsg);
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
        
        // Provide more helpful error messages
        let errorMessage = 'Unable to load scholarships. Please try again later.';
        let errorDetails = error.message;
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('CORS')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
            errorDetails = 'Network error: ' + error.message;
        } else if (error.message.includes('404')) {
            errorMessage = 'API endpoint not found. Please contact support.';
            errorDetails = 'The scholarships API endpoint could not be found.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error occurred. Please try again later.';
            errorDetails = 'Server error: ' + error.message;
        }
        
        scholarshipsGrid.innerHTML = `
            <div class="error-message">
                <p>${escapeHtml(errorMessage)}</p>
                <p style="font-size: 0.9em; color: #666; margin-top: 0.5em;">Error: ${escapeHtml(errorDetails)}</p>
                <p style="font-size: 0.8em; color: #999; margin-top: 0.5em;">If this problem persists, please contact us at admissions@kns.edu.sl</p>
                <p style="font-size: 0.8em; color: #999; margin-top: 0.5em;">Debug: Check browser console (F12) for more details.</p>
            </div>
        `;
    }
}

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

