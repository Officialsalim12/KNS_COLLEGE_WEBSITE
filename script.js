document.addEventListener('DOMContentLoaded', function() {
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const body = document.body;
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mainNav) {
                mainNav.classList.toggle('active');
            }
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
            this.classList.toggle('active');
            if (mainNav && mainNav.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }
    
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
    
    if (mainNav) {
        const dropdownParents = mainNav.querySelectorAll('.has-dropdown > a');
        dropdownParents.forEach(parentLink => {
            parentLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = this.parentElement;
                    const dropdown = parent.querySelector('.dropdown-menu');
                    
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
                    
                    if (dropdown) {
                        const isOpen = dropdown.style.display === 'block';
                        dropdown.style.display = isOpen ? 'none' : 'block';
                        parent.classList.toggle('dropdown-open', !isOpen);
                    }
                }
            });
        });
        
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
        
        const dropdownLinks = mainNav.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
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
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
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
    
    const applicationForm = document.querySelector('.application-form');
    
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            // Form submitted
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const hash = href.substring(1);
            
            if (hash === 'diploma' || hash === 'certificate' || hash === 'train-certify') {
                return;
            }
            
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
    
    const programmeSearchInput = document.getElementById('programmeSearch');
    const programmeSearchPageInput = document.getElementById('programmeSearchPage');
    const onlineCourseSearchInput = document.getElementById('onlineCourseSearch');
    const searchButtons = document.querySelectorAll('.search-button');
    
    function performSearch(searchInput) {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const courseCards = document.querySelectorAll('.course-card');
        const schoolCards = document.querySelectorAll('.school-card');
        
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
    
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchInput = this.closest('.search-wrapper')?.querySelector('.programme-search-input');
            if (searchInput) {
                performSearch(searchInput);
            }
        });
    });
    
    function filterProgrammesByType() {
        const hash = window.location.hash.substring(1);
        const courseCards = document.querySelectorAll('.course-card');
        const programmeCategories = document.querySelectorAll('.programme-category');
        const programmeSubcategories = document.querySelectorAll('.programme-subcategory');
        
        programmeCategories.forEach(category => {
            category.style.display = '';
        });
        programmeSubcategories.forEach(subcategory => {
            subcategory.style.display = '';
        });
        
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
            courseCards.forEach(card => {
                card.style.display = '';
            });
        }
        
        programmeSubcategories.forEach(subcategory => {
            const visibleCards = Array.from(subcategory.querySelectorAll('.course-card'))
                .filter(card => card.style.display !== 'none');
            if (visibleCards.length === 0) {
                subcategory.style.display = 'none';
            }
        });
        
        programmeCategories.forEach(category => {
            const visibleSubcategories = Array.from(category.querySelectorAll('.programme-subcategory'))
                .filter(sub => sub.style.display !== 'none');
            if (visibleSubcategories.length === 0) {
                category.style.display = 'none';
            }
        });
        
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
    
    filterProgrammesByType();
    
    window.addEventListener('hashchange', function() {
        filterProgrammesByType();
    });
    
    if (window.location.hash) {
        setTimeout(filterProgrammesByType, 100);
    }
    
    const enrollmentModal = document.getElementById('enrollmentModal');
    const enrollmentForm = document.getElementById('enrollmentForm');
    const enrollCourseInput = document.getElementById('enroll-course');
    const modalClose = document.querySelector('.modal-close');
    const cancelEnrollmentBtn = document.getElementById('cancelEnrollment');
    const applyButtons = document.querySelectorAll('.btn-apply');
    
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseName = this.getAttribute('data-course-name');
            if (enrollCourseInput) {
                enrollCourseInput.value = courseName;
            }
            if (enrollmentModal) {
                enrollmentModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    function closeEnrollmentModal() {
        if (enrollmentModal) {
            enrollmentModal.classList.remove('active');
            document.body.style.overflow = '';
            enrollmentForm.reset();
        }
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeEnrollmentModal);
    }
    
    if (cancelEnrollmentBtn) {
        cancelEnrollmentBtn.addEventListener('click', closeEnrollmentModal);
    }
    
    if (enrollmentModal) {
        enrollmentModal.addEventListener('click', function(e) {
            if (e.target === enrollmentModal) {
                closeEnrollmentModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && enrollmentModal && enrollmentModal.classList.contains('active')) {
            closeEnrollmentModal();
        }
    });
    
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(enrollmentForm);
            const courseName = formData.get('course');
            const firstName = formData.get('first-name');
            const lastName = formData.get('last-name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const paymentMethod = formData.get('payment-method');
            const mobileNumber = formData.get('mobile-number');
            
            const submitBtn = enrollmentForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }
            
            try {
                const apiUrl = (typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'http://localhost:3000') + '/api/enrollments';
                
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
                    alert('Thank you for your enrollment! We will contact you shortly with payment instructions.\n\nCourse: ' + courseName + '\nEnrollment Fee: Le1,000\nPayment Method: ' + paymentMethod);
                    closeEnrollmentModal();
                } else {
                    throw new Error(result.error || 'Failed to submit enrollment');
                }
            } catch (error) {
                console.error('Error submitting enrollment:', error);
                alert('Thank you for your enrollment! We will contact you shortly with payment instructions.\n\nCourse: ' + courseName + '\nEnrollment Fee: Le1,000\nPayment Method: ' + paymentMethod);
                closeEnrollmentModal();
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
    
    const partnersScrollWrapper = document.getElementById('partnersScroll');
    if (partnersScrollWrapper) {
        const partnerLogos = partnersScrollWrapper.querySelectorAll('.partner-logo');
        
        partnerLogos.forEach(logo => {
            logo.addEventListener('mousedown', function() {
                partnersScrollWrapper.classList.add('paused');
            });
            
            logo.addEventListener('touchstart', function() {
                partnersScrollWrapper.classList.add('paused');
            });
            
            logo.addEventListener('mouseup', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
            
            logo.addEventListener('touchend', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
            
            logo.addEventListener('mouseleave', function() {
                partnersScrollWrapper.classList.remove('paused');
            });
        });
        
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

