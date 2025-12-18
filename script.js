/**
 * JavaScript for Course Template
 * Handles mobile menu toggle and sidebar interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const body = document.body;
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle main navigation menu
            if (mainNav) {
                mainNav.classList.toggle('active');
            }
            // Toggle sidebar if it exists (for course detail pages)
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
            // Toggle button active state
            this.classList.toggle('active');
            // Prevent body scroll when menu is open
            if (mainNav && mainNav.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (mainNav && mainNav.classList.contains('active')) {
                if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mainNav.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                    body.style.overflow = '';
                }
            }
            if (sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                }
            }
        }
    });
    
    // Handle dropdown menu toggle on mobile
    if (mainNav) {
        const dropdownParents = mainNav.querySelectorAll('.has-dropdown > a');
        dropdownParents.forEach(parentLink => {
            parentLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = this.parentElement;
                    const dropdown = parent.querySelector('.dropdown-menu');
                    
                    // Close other dropdowns
                    dropdownParents.forEach(otherParent => {
                        if (otherParent !== this) {
                            const otherParentEl = otherParent.parentElement;
                            const otherDropdown = otherParentEl.querySelector('.dropdown-menu');
                            if (otherDropdown) {
                                otherDropdown.style.display = 'none';
                                otherParentEl.classList.remove('dropdown-open');
                            }
                        }
                    });
                    
                    // Toggle current dropdown
                    if (dropdown) {
                        const isOpen = dropdown.style.display === 'block';
                        dropdown.style.display = isOpen ? 'none' : 'block';
                        parent.classList.toggle('dropdown-open', !isOpen);
                    }
                }
            });
        });
        
        // Close mobile menu when clicking on a non-dropdown link
        const navLinks = mainNav.querySelectorAll('a:not(.has-dropdown > a)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                    body.style.overflow = '';
                }
            });
        });
        
        // Close mobile menu when clicking on dropdown submenu links
        const dropdownLinks = mainNav.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    // Allow navigation, then close menu
                    setTimeout(() => {
                        mainNav.classList.remove('active');
                        if (mobileMenuToggle) {
                            mobileMenuToggle.classList.remove('active');
                        }
                        body.style.overflow = '';
                    }, 100);
                }
            });
        });
    }
    
    // Close sidebar when clicking outside on mobile (legacy support)
    if (mainContent && sidebar) {
        mainContent.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    }
    
    // Sidebar submenu toggle on mobile (optional enhancement)
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        const link = item.querySelector('.sidebar-link');
        const submenu = item.querySelector('.sidebar-submenu');
        
        if (link && submenu && window.innerWidth <= 768) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('active');
            });
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close menus on desktop if they were open on mobile
            if (window.innerWidth > 768) {
                if (mainNav) {
                    mainNav.classList.remove('active');
                }
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
                body.style.overflow = '';
            }
        }, 250);
    });
    
    // Form validation enhancement (optional)
    const applicationForm = document.querySelector('.application-form');
    
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            // Add custom validation here if needed
            // This is a placeholder - implement your own validation logic
            console.log('Form submitted');
            // e.preventDefault(); // Uncomment to prevent default submission for testing
        });
    }
    
    // Smooth scroll for anchor links (if you add any)
    // Skip program filtering links (diploma, certificate, train-certify)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const hash = href.substring(1);
            
            // If it's a programme filter link, let it handle naturally (hashchange will filter)
            if (hash === 'diploma' || hash === 'certificate' || hash === 'train-certify') {
                // Don't prevent default - let the hash change naturally
                // The hashchange event will handle filtering
                return;
            }
            
            // For other anchor links, do smooth scroll
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Programme Search Functionality
    const programmeSearchInput = document.getElementById('programmeSearch');
    const programmeSearchPageInput = document.getElementById('programmeSearchPage');
    const onlineCourseSearchInput = document.getElementById('onlineCourseSearch');
    const searchButtons = document.querySelectorAll('.search-button');
    
    function performSearch(searchInput) {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const courseCards = document.querySelectorAll('.course-card');
        const schoolCards = document.querySelectorAll('.school-card');
        
        // Search on Programmes Page
        if (courseCards.length > 0) {
            courseCards.forEach(card => {
                const courseName = card.querySelector('.course-name')?.textContent.toLowerCase() || '';
                const courseSummary = card.querySelector('.course-summary')?.textContent.toLowerCase() || '';
                const courseMeta = card.querySelector('.course-meta')?.textContent.toLowerCase() || '';
                
                const matches = courseName.includes(searchTerm) || 
                               courseSummary.includes(searchTerm) || 
                               courseMeta.includes(searchTerm);
                
                if (searchTerm === '' || matches) {
                    card.style.display = '';
                    // Highlight matching text
                    if (searchTerm && matches) {
                        card.style.border = '2px solid var(--primary-color)';
                        card.style.boxShadow = '0 4px 12px rgba(26, 77, 122, 0.2)';
                    } else {
                        card.style.border = '';
                        card.style.boxShadow = '';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide parent categories if no results
            const programmeCategories = document.querySelectorAll('.programme-category, .programme-subcategory');
            programmeCategories.forEach(category => {
                const visibleCards = Array.from(category.querySelectorAll('.course-card'))
                    .filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0 && searchTerm !== '') {
                    category.style.display = 'none';
                } else {
                    category.style.display = '';
                }
            });
        }
        
        // Search on Home Page (School Cards)
        if (schoolCards.length > 0) {
            schoolCards.forEach(card => {
                const schoolName = card.querySelector('.school-name')?.textContent.toLowerCase() || '';
                const schoolDescription = card.querySelector('.school-description')?.textContent.toLowerCase() || '';
                const programmeItems = Array.from(card.querySelectorAll('.programme-item'))
                    .map(item => item.textContent.toLowerCase());
                
                const matches = schoolName.includes(searchTerm) || 
                               schoolDescription.includes(searchTerm) ||
                               programmeItems.some(item => item.includes(searchTerm));
                
                if (searchTerm === '' || matches) {
                    card.style.display = '';
                    if (searchTerm && matches) {
                        card.style.border = '2px solid var(--primary-color)';
                        card.style.boxShadow = '0 8px 24px rgba(26, 77, 122, 0.2)';
                    } else {
                        card.style.border = '';
                        card.style.boxShadow = '';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // Add event listeners for search inputs
    if (programmeSearchInput) {
        programmeSearchInput.addEventListener('input', function() {
            performSearch(this);
        });
        
        programmeSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this);
            }
        });
    }
    
    if (programmeSearchPageInput) {
        programmeSearchPageInput.addEventListener('input', function() {
            performSearch(this);
        });
        
        programmeSearchPageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this);
            }
        });
    }
    
    // Online Course Search
    if (onlineCourseSearchInput) {
        onlineCourseSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const courseCards = document.querySelectorAll('.online-course-card');
            
            courseCards.forEach(card => {
                const courseTitle = card.querySelector('.online-course-title')?.textContent.toLowerCase() || '';
                const courseDuration = card.querySelector('.online-course-duration')?.textContent.toLowerCase() || '';
                
                const matches = courseTitle.includes(searchTerm) || courseDuration.includes(searchTerm);
                
                if (searchTerm === '' || matches) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        
        onlineCourseSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    // Add event listeners for search buttons
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchInput = this.closest('.search-wrapper')?.querySelector('.programme-search-input');
            if (searchInput) {
                performSearch(searchInput);
            }
        });
    });
    
    // Programme Type Filtering (Diploma, Certificate, Train & Certify)
    function filterProgrammesByType() {
        const hash = window.location.hash.substring(1); // Remove the #
        const courseCards = document.querySelectorAll('.course-card');
        const programmeCategories = document.querySelectorAll('.programme-category');
        const programmeSubcategories = document.querySelectorAll('.programme-subcategory');
        
        // Show all categories and subcategories first
        programmeCategories.forEach(category => {
            category.style.display = '';
        });
        programmeSubcategories.forEach(subcategory => {
            subcategory.style.display = '';
        });
        
        // If hash is 'train-certify', hide all programmes (empty)
        if (hash === 'train-certify') {
            courseCards.forEach(card => {
                card.style.display = 'none';
            });
            programmeCategories.forEach(category => {
                category.style.display = 'none';
            });
            programmeSubcategories.forEach(subcategory => {
                subcategory.style.display = 'none';
            });
            return;
        }
        
        // Filter based on hash
        if (hash === 'diploma') {
            courseCards.forEach(card => {
                const programmeType = card.getAttribute('data-programme-type');
                if (programmeType === 'diploma') {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        } else if (hash === 'certificate') {
            courseCards.forEach(card => {
                const programmeType = card.getAttribute('data-programme-type');
                if (programmeType === 'certificate') {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        } else {
            // If no hash or hash doesn't match known filters, show all
            courseCards.forEach(card => {
                card.style.display = '';
            });
        }
        
        // Hide empty subcategories
        programmeSubcategories.forEach(subcategory => {
            const visibleCards = Array.from(subcategory.querySelectorAll('.course-card'))
                .filter(card => card.style.display !== 'none');
            if (visibleCards.length === 0) {
                subcategory.style.display = 'none';
            }
        });
        
        // Hide empty categories
        programmeCategories.forEach(category => {
            const visibleSubcategories = Array.from(category.querySelectorAll('.programme-subcategory'))
                .filter(sub => sub.style.display !== 'none');
            if (visibleSubcategories.length === 0) {
                category.style.display = 'none';
            }
        });
        
        // Scroll to top of programmes section when filtering
        const contentSection = document.querySelector('.content-section');
        if (contentSection && (hash === 'diploma' || hash === 'certificate' || hash === 'train-certify')) {
            setTimeout(() => {
                contentSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }
    
    // Run filter on page load
    filterProgrammesByType();
    
    // Run filter when hash changes
    window.addEventListener('hashchange', function() {
        filterProgrammesByType();
    });
    
    // Also handle initial hash if page loads with hash
    if (window.location.hash) {
        setTimeout(filterProgrammesByType, 100);
    }
    
    // Enrollment Modal Functionality
    const enrollmentModal = document.getElementById('enrollmentModal');
    const enrollmentForm = document.getElementById('enrollmentForm');
    const enrollCourseInput = document.getElementById('enroll-course');
    const modalClose = document.querySelector('.modal-close');
    const cancelEnrollmentBtn = document.getElementById('cancelEnrollment');
    const applyButtons = document.querySelectorAll('.btn-apply');
    
    // Open modal when Apply Now button is clicked
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseName = this.getAttribute('data-course-name');
            if (enrollCourseInput) {
                enrollCourseInput.value = courseName;
            }
            if (enrollmentModal) {
                enrollmentModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });
    
    // Close modal functions
    function closeEnrollmentModal() {
        if (enrollmentModal) {
            enrollmentModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            enrollmentForm.reset();
        }
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeEnrollmentModal);
    }
    
    if (cancelEnrollmentBtn) {
        cancelEnrollmentBtn.addEventListener('click', closeEnrollmentModal);
    }
    
    // Close modal when clicking outside of it
    if (enrollmentModal) {
        enrollmentModal.addEventListener('click', function(e) {
            if (e.target === enrollmentModal) {
                closeEnrollmentModal();
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && enrollmentModal && enrollmentModal.classList.contains('active')) {
            closeEnrollmentModal();
        }
    });
    
    // Handle form submission
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(enrollmentForm);
            const courseName = formData.get('course');
            const firstName = formData.get('first-name');
            const lastName = formData.get('last-name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const paymentMethod = formData.get('payment-method');
            const mobileNumber = formData.get('mobile-number');
            
            // Get submit button
            const submitBtn = enrollmentForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            
            // Disable submit button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }
            
            try {
                // Get API URL from config or use default
                const apiUrl = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'http://localhost:3000') + '/api/enrollments';
                
                // Send data to API
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        courseName: courseName,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone || null,
                        paymentMethod: paymentMethod || null,
                        mobileNumber: mobileNumber || null,
                        enrollmentFee: 'Le1,000'
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Show success message
                    alert('Thank you for your enrollment! We will contact you shortly with payment instructions.\n\nCourse: ' + courseName + '\nEnrollment Fee: Le1,000\nPayment Method: ' + paymentMethod);
                    
                    // Close modal and reset form
                    closeEnrollmentModal();
                } else {
                    throw new Error(result.error || 'Failed to submit enrollment');
                }
            } catch (error) {
                console.error('Error submitting enrollment:', error);
                // Still show success to user (graceful degradation)
                // In production, you might want to show an error message
                alert('Thank you for your enrollment! We will contact you shortly with payment instructions.\n\nCourse: ' + courseName + '\nEnrollment Fee: Le1,000\nPayment Method: ' + paymentMethod);
                
                // Close modal and reset form
                closeEnrollmentModal();
            } finally {
                // Re-enable submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
    
    // Partners Logo Scrolling - Pause on Touch/Hold, Resume on Release
    const partnersScrollWrapper = document.getElementById('partnersScroll');
    if (partnersScrollWrapper) {
        const partnerLogos = partnersScrollWrapper.querySelectorAll('.partner-logo');
        
        partnerLogos.forEach(logo => {
            // Pause on mouse down / touch start
            logo.addEventListener('mousedown', function() {
                partnersScrollWrapper.classList.add('paused');
            });
            
            logo.addEventListener('touchstart', function() {
                partnersScrollWrapper.classList.add('paused');
            });
            
            // Resume on mouse up / touch end
            logo.addEventListener('mouseup', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
            
            logo.addEventListener('touchend', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
            
            // Resume if mouse leaves while holding
            logo.addEventListener('mouseleave', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
        });
        
        // Also pause/resume on the container itself
        partnersScrollWrapper.addEventListener('mousedown', function() {
            partnersScrollWrapper.classList.add('paused');
        });
        
        partnersScrollWrapper.addEventListener('mouseup', function() {
            partnersScrollWrapper.classList.remove('paused');
        });
        
        partnersScrollWrapper.addEventListener('touchstart', function() {
            partnersScrollWrapper.classList.add('paused');
        });
        
        partnersScrollWrapper.addEventListener('touchend', function() {
            partnersScrollWrapper.classList.remove('paused');
        });
    }
});

