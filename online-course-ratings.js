(function () {    'use strict';

    if (!document.body.classList.contains('page-online-courses')) {
        return;
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.API_BASE_URL || !CONFIG.ENDPOINTS?.ONLINE_COURSE_RATINGS) {
        return;
    }

    const apiUrl =
        typeof CONFIG.buildApiUrl === 'function'
            ? CONFIG.buildApiUrl(CONFIG.ENDPOINTS.ONLINE_COURSE_RATINGS)
            : String(CONFIG.API_BASE_URL || '').replace(/\/+$/, '') + CONFIG.ENDPOINTS.ONLINE_COURSE_RATINGS;

    function parseJsonResponse(res) {
        return res.text().then((text) => {
            let data = {};
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {};
                }
            }
            return { ok: res.ok, status: res.status, data };
        });
    }

    function networkErrorMessage(err) {
        const msg = (err && err.message) || '';
        if (msg === 'Failed to fetch' || err instanceof TypeError) {
            return 'We could not reach the server. Check your connection and try again.';
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
        const n = Number(avg);
        return (Math.round(n * 10) / 10).toFixed(1);
    }

    function applyStatsToCard(card, stats) {
        const badge = card.querySelector('.online-course-card__badge');
        if (!badge) return;
        const avgEl = badge.querySelector('.online-course-card__badge-average');
        const countWrap = badge.querySelector('.online-course-card__badge-count-wrap');
        const countNum = badge.querySelector('.online-course-card__badge-count');
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
            .then((result) => {
                const byKey = {};
                if (result.ok && result.data?.success && Array.isArray(result.data.ratings)) {
                    result.data.ratings.forEach((r) => {
                        if (r.course_key) byKey[r.course_key] = { average: r.average, count: r.count };
                    });
                }
                document.querySelectorAll('.online-course-card').forEach((card) => {
                    const key = getCourseKeyFromCard(card);
                    applyStatsToCard(card, key ? byKey[key] : null);
                });
            })
            .catch(() => {
                document.querySelectorAll('.online-course-card').forEach((card) => {
                    applyStatsToCard(card, null);
                });
            });
    }

    function setModalError(msg) {
        if (!errorEl) return;
        errorEl.textContent = msg || '';
        errorEl.hidden = !msg;
    }

    function resetRatingView() {
        if (formPanel) formPanel.hidden = false;
        if (successPanel) successPanel.hidden = true;
    }

    function showRatingSuccess() {
        if (formPanel) formPanel.hidden = true;
        if (successPanel) successPanel.hidden = false;
        successDoneBtn?.focus?.();
    }

    function buildStarButtons() {
        if (!starRow) return;
        starRow.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const value = i;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'oc-rating-star';
            btn.setAttribute('aria-label', value + ' out of 5 stars');
            btn.dataset.starValue = String(value);
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '36');
            svg.setAttribute('height', '36');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', STAR_PATH);
            path.setAttribute('fill', 'currentColor');
            svg.appendChild(path);
            btn.appendChild(svg);
            btn.addEventListener('click', () => {
                selectedStars = value;
                syncStarHighlight();
                if (submitBtn) submitBtn.disabled = false;
            });
            starRow.appendChild(btn);
        }
    }

    function syncStarHighlight() {
        if (!starRow) return;
        starRow.querySelectorAll('.oc-rating-star').forEach((b) => {
            const v = parseInt(b.getAttribute('data-star-value'), 10);
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
        modalRoot.querySelector('.oc-rating-modal__close')?.focus?.();
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
        lastFocus?.focus?.();
    }

    function submitRating() {
        if (!activeCourseKey || selectedStars < 1 || selectedStars > 5) return;
        setModalError('');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';
        }
        const body = {
            courseKey: activeCourseKey,
            stars: selectedStars,
            comment: commentEl?.value.trim() || undefined,
            email: emailEl?.value.trim() || undefined
        };
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            credentials: 'omit',
            mode: 'cors',
            body: JSON.stringify(body)
        })
            .then(parseJsonResponse)
            .then((result) => {
                if (submitBtn) submitBtn.textContent = 'Submit rating';
                if (!result.ok) {
                    const serverMsg =
                        result.data?.error ||
                        (result.status >= 500 ? 'Server error (' + result.status + '). Try again later.' : null);
                    throw new Error(serverMsg || 'Could not save rating');
                }
                if (result.data?.rating) {
                    const card = Array.from(document.querySelectorAll('.online-course-card')).find(
                        (c) => getCourseKeyFromCard(c) === activeCourseKey
                    );
                    if (card) applyStatsToCard(card, result.data.rating);
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit rating';
                }
                showRatingSuccess();
            })
            .catch((err) => {
                setModalError(networkErrorMessage(err));
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit rating';
                }
            });
    }

    const categoryRoot = document.getElementById('onlineCoursesCategoryRoot');
    if (categoryRoot) {
        categoryRoot.addEventListener('click', (e) => {
            const btn = e.target.closest?.('.online-course-card__rate-btn');
            if (!btn) return;
            const card = btn.closest('.online-course-card');
            if (!card) return;
            e.preventDefault();
            const key = getCourseKeyFromCard(card);
            const title = card.querySelector('.online-course-title')?.textContent.trim() || key;
            openModal(key, title);
        });
    }

    if (modalRoot) {
        modalRoot.addEventListener('click', (e) => {
            if (e.target.hasAttribute?.('data-oc-rating-close')) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalRoot && !modalRoot.hidden) {
            closeModal();
        }
    });

    submitBtn?.addEventListener('click', submitRating);
    successDoneBtn?.addEventListener('click', closeModal);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchRatings);
    } else {
        fetchRatings();
    }

    document.addEventListener('kns-online-courses-loaded', fetchRatings);
})();