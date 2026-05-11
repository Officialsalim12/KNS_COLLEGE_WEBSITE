(function () {
    'use strict';

    if (!document.body.classList.contains('page-online-courses')) {
        return;
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.API_BASE_URL || !CONFIG.ENDPOINTS || !CONFIG.ENDPOINTS.ONLINE_COURSE_RATINGS) {
        return;
    }

    const apiUrl =
        typeof CONFIG.buildApiUrl === 'function'
            ? CONFIG.buildApiUrl(CONFIG.ENDPOINTS.ONLINE_COURSE_RATINGS)
            : String(CONFIG.API_BASE_URL || '').replace(/\/+$/, '') + CONFIG.ENDPOINTS.ONLINE_COURSE_RATINGS;

    function parseJsonResponse(res) {
        return res.text().then(function (text) {
            var data = {};
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (ignore) {
                    data = {};
                }
            }
            return { ok: res.ok, status: res.status, data: data };
        });
    }

    function networkErrorMessage(err) {
        var msg = (err && err.message) || '';
        if (msg === 'Failed to fetch' || err instanceof TypeError) {
            return 'We could not reach the server. Check your internet connection and try again in a moment.';
        }
        return msg || 'We could not save your rating. Please try again later.';
    }

    const modalRoot = document.getElementById('ocRatingModalRoot');
    const modalCourseName = document.getElementById('ocRatingModalCourseName');
    const starRow = document.getElementById('ocRatingStarRow');
    const commentEl = document.getElementById('ocRatingComment');
    const emailEl = document.getElementById('ocRatingEmail');
    const errorEl = document.getElementById('ocRatingModalError');
    const submitBtn = document.getElementById('ocRatingSubmit');
    const formPanel = document.getElementById('ocRatingFormPanel');
    const successPanel = document.getElementById('ocRatingSuccessPanel');
    const successDoneBtn = document.getElementById('ocRatingSuccessDone');

    let activeCourseKey = '';
    let activeDisplayTitle = '';
    let selectedStars = 0;
    let lastFocus = null;

    const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

    function getCourseKeyFromCard(card) {
        const enroll = card.querySelector('.online-course-card__enroll[data-course-name]');
        return (enroll && enroll.getAttribute('data-course-name')) || '';
    }

    function formatAverage(avg) {
        if (avg == null || Number.isNaN(avg)) return '—';
        var n = Number(avg);
        return (Math.round(n * 10) / 10).toFixed(1);
    }

    function applyStatsToCard(card, stats) {
        var badge = card.querySelector('.online-course-card__badge');
        if (!badge) return;
        var avgEl = badge.querySelector('.online-course-card__badge-average');
        var countWrap = badge.querySelector('.online-course-card__badge-count-wrap');
        var countNum = badge.querySelector('.online-course-card__badge-count');
        if (!stats || !stats.count) {
            if (avgEl) avgEl.textContent = '—';
            if (countWrap) countWrap.hidden = true;
            if (countNum) countNum.textContent = '0';
            badge.setAttribute('aria-label', 'Course rating: not yet rated');
            return;
        }
        if (avgEl) avgEl.textContent = formatAverage(stats.average);
        if (countNum) countNum.textContent = String(stats.count);
        if (countWrap) countWrap.hidden = false;
        badge.setAttribute(
            'aria-label',
            'Course rating: ' + formatAverage(stats.average) + ' out of 5, ' + stats.count + ' ratings'
        );
    }

    function fetchRatings() {
        return fetch(apiUrl, { method: 'GET', credentials: 'omit', mode: 'cors' })
            .then(parseJsonResponse)
            .then(function (result) {
                var data = result.data;
                var byKey = {};
                if (result.ok && data && data.success && Array.isArray(data.ratings)) {
                    data.ratings.forEach(function (r) {
                        if (r.course_key) byKey[r.course_key] = { average: r.average, count: r.count };
                    });
                }
                document.querySelectorAll('.online-course-card').forEach(function (card) {
                    var key = getCourseKeyFromCard(card);
                    applyStatsToCard(card, key ? byKey[key] : null);
                });
            })
            .catch(function () {
                document.querySelectorAll('.online-course-card').forEach(function (card) {
                    applyStatsToCard(card, null);
                });
            });
    }

    function setModalError(msg) {
        if (!errorEl) return;
        if (msg) {
            errorEl.textContent = msg;
            errorEl.hidden = false;
        } else {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }
    }

    function resetRatingView() {
        if (formPanel) formPanel.hidden = false;
        if (successPanel) successPanel.hidden = true;
    }

    function showRatingSuccess() {
        if (formPanel) formPanel.hidden = true;
        if (successPanel) successPanel.hidden = false;
        if (successDoneBtn && typeof successDoneBtn.focus === 'function') {
            successDoneBtn.focus();
        }
    }

    function buildStarButtons() {
        if (!starRow) return;
        starRow.innerHTML = '';
        for (var i = 1; i <= 5; i++) {
            (function (value) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'oc-rating-star';
                btn.setAttribute('aria-label', value + ' out of 5 stars');
                btn.dataset.starValue = String(value);
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '36');
                svg.setAttribute('height', '36');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('aria-hidden', 'true');
                var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', STAR_PATH);
                path.setAttribute('fill', 'currentColor');
                svg.appendChild(path);
                btn.appendChild(svg);
                btn.addEventListener('click', function () {
                    selectedStars = value;
                    syncStarHighlight();
                    if (submitBtn) submitBtn.disabled = false;
                });
                starRow.appendChild(btn);
            })(i);
        }
    }

    function syncStarHighlight() {
        if (!starRow) return;
        var buttons = starRow.querySelectorAll('.oc-rating-star');
        buttons.forEach(function (b) {
            var v = parseInt(b.getAttribute('data-star-value'), 10);
            b.classList.toggle('is-selected', v <= selectedStars);
        });
    }

    function openModal(courseKey, displayTitle) {
        if (!modalRoot || !courseKey) return;
        lastFocus = document.activeElement;
        activeCourseKey = courseKey;
        activeDisplayTitle = displayTitle || courseKey;
        selectedStars = 0;
        if (modalCourseName) modalCourseName.textContent = activeDisplayTitle;
        if (commentEl) commentEl.value = '';
        if (emailEl) emailEl.value = '';
        setModalError('');
        resetRatingView();
        if (submitBtn) submitBtn.disabled = true;
        buildStarButtons();
        modalRoot.hidden = false;
        modalRoot.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var closeBtn = modalRoot.querySelector('.oc-rating-modal__close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        if (!modalRoot) return;
        modalRoot.hidden = true;
        modalRoot.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeCourseKey = '';
        resetRatingView();
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submit rating';
        }
        if (lastFocus && typeof lastFocus.focus === 'function') {
            lastFocus.focus();
        }
    }

    function submitRating() {
        if (!activeCourseKey || selectedStars < 1 || selectedStars > 5) return;
        setModalError('');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';
        }
        var body = {
            courseKey: activeCourseKey,
            stars: selectedStars,
            comment: (commentEl && commentEl.value.trim()) || undefined,
            email: (emailEl && emailEl.value.trim()) || undefined
        };
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            credentials: 'omit',
            mode: 'cors',
            body: JSON.stringify(body)
        })
            .then(parseJsonResponse)
            .then(function (result) {
                if (submitBtn) submitBtn.textContent = 'Submit rating';
                if (!result.ok) {
                    var serverMsg =
                        (result.data && result.data.error) ||
                        (result.status >= 500 ? 'Server error (' + result.status + '). Try again later.' : null);
                    throw new Error(serverMsg || 'Could not save rating');
                }
                if (result.data && result.data.rating) {
                    var card = Array.prototype.find.call(
                        document.querySelectorAll('.online-course-card'),
                        function (c) {
                            return getCourseKeyFromCard(c) === activeCourseKey;
                        }
                    );
                    if (card) applyStatsToCard(card, result.data.rating);
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit rating';
                }
                showRatingSuccess();
            })
            .catch(function (err) {
                setModalError(networkErrorMessage(err));
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit rating';
                }
            });
    }

    document.getElementById('onlineCoursesCategoryRoot') &&
        document.getElementById('onlineCoursesCategoryRoot').addEventListener('click', function (e) {
            var t = e.target;
            if (!t.closest || !t.closest('.online-course-card__rate-btn')) return;
            var btn = t.closest('.online-course-card__rate-btn');
            var card = btn.closest('.online-course-card');
            if (!card) return;
            e.preventDefault();
            var key = getCourseKeyFromCard(card);
            var titleEl = card.querySelector('.online-course-title');
            var title = titleEl ? titleEl.textContent.trim() : key;
            openModal(key, title);
        });

    if (modalRoot) {
        modalRoot.addEventListener('click', function (e) {
            if (e.target.hasAttribute && e.target.hasAttribute('data-oc-rating-close')) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalRoot && !modalRoot.hidden) {
            closeModal();
        }
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', submitRating);
    }

    if (successDoneBtn) {
        successDoneBtn.addEventListener('click', function () {
            closeModal();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchRatings);
    } else {
        fetchRatings();
    }
})();
