/**
 * Loads online course cards from GET /api/online-courses (Supabase via server.js).
 * Run database/supabase_online_courses.sql in Supabase, then edit public.online_courses / online_course_categories.
 */
(function () {
    'use strict';

    if (!document.body.classList.contains('page-online-courses')) {
        return;
    }

    if (typeof CONFIG === 'undefined' || !CONFIG.API_BASE_URL || !CONFIG.ENDPOINTS || !CONFIG.ENDPOINTS.ONLINE_COURSES) {
        return;
    }

    const apiUrl =
        typeof CONFIG.buildApiUrl === 'function'
            ? CONFIG.buildApiUrl(CONFIG.ENDPOINTS.ONLINE_COURSES)
            : String(CONFIG.API_BASE_URL || '').replace(/\/+$/, '') + CONFIG.ENDPOINTS.ONLINE_COURSES;

    const root = document.getElementById('onlineCoursesCategoryRoot');
    const errEl = document.getElementById('onlineCoursesCatalogError');

    function setError(msg) {
        if (!errEl) return;
        if (msg) {
            errEl.textContent = msg;
            errEl.hidden = false;
        } else {
            errEl.textContent = '';
            errEl.hidden = true;
        }
    }

    function svgIconBook() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('aria-hidden', 'true');
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p1.setAttribute('d', 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20');
        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p2.setAttribute('d', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z');
        svg.appendChild(p1);
        svg.appendChild(p2);
        return svg;
    }

    function svgIconClock() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('aria-hidden', 'true');
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', '12');
        c.setAttribute('cy', '12');
        c.setAttribute('r', '10');
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M12 6v6l4 2');
        svg.appendChild(c);
        svg.appendChild(p);
        return svg;
    }

    function svgIconStarSmall() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('aria-hidden', 'true');
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
        svg.appendChild(p);
        return svg;
    }

    function createMetaItem(svgNode, labelText) {
        const span = document.createElement('span');
        span.className = 'online-course-card__meta-item';
        span.appendChild(svgNode);
        const text = document.createElement('span');
        text.textContent = labelText;
        span.appendChild(text);
        return span;
    }

    function createCourseCard(course) {
        const slug = course.categorySlug || '';
        const courseKey = course.courseKey || '';
        const enrollName = course.enrollCourseName || courseKey;
        const title = course.displayTitle || courseKey;
        const price = course.priceLabel || 'NLe 1000';
        const amountMinor =
            course.amountSleMinor != null && Number.isFinite(Number(course.amountSleMinor))
                ? Math.round(Number(course.amountSleMinor))
                : 100000;
        const structured = course.structuredText || 'Structured learning';
        const pace = course.paceText || 'Your pace';

        const card = document.createElement('div');
        card.className = 'online-course-card';
        card.setAttribute('data-online-category', slug);
        card.setAttribute('data-course', courseKey);

        const hero = document.createElement('div');
        hero.className = 'online-course-card__hero';
        const tag = document.createElement('div');
        tag.className = 'online-course-card__price-tag';
        tag.setAttribute('aria-label', 'Course fees');
        const priceSpan = document.createElement('span');
        priceSpan.className = 'online-course-card__price-tag__value';
        priceSpan.textContent = price;
        tag.appendChild(priceSpan);
        hero.appendChild(tag);
        card.appendChild(hero);

        const badge = document.createElement('div');
        badge.className = 'online-course-card__badge';
        badge.setAttribute('aria-live', 'polite');
        badge.setAttribute('aria-label', 'Course rating');
        badge.appendChild(svgIconStarSmall());
        const avg = document.createElement('span');
        avg.className = 'online-course-card__badge-average';
        avg.textContent = '—';
        badge.appendChild(avg);
        const countWrap = document.createElement('span');
        countWrap.className = 'online-course-card__badge-count-wrap';
        countWrap.hidden = true;
        countWrap.appendChild(document.createTextNode('('));
        const countNum = document.createElement('span');
        countNum.className = 'online-course-card__badge-count';
        countNum.textContent = '0';
        countWrap.appendChild(countNum);
        countWrap.appendChild(document.createTextNode(')'));
        badge.appendChild(countWrap);
        const rateBtn = document.createElement('button');
        rateBtn.type = 'button';
        rateBtn.className = 'online-course-card__rate-btn';
        rateBtn.textContent = 'Rate';
        badge.appendChild(rateBtn);
        card.appendChild(badge);

        const body = document.createElement('div');
        body.className = 'online-course-card__body';
        const h3 = document.createElement('h3');
        h3.className = 'online-course-title';
        h3.textContent = title;
        body.appendChild(h3);
        const meta = document.createElement('div');
        meta.className = 'online-course-card__meta';
        meta.appendChild(createMetaItem(svgIconBook(), structured));
        meta.appendChild(createMetaItem(svgIconClock(), pace));
        body.appendChild(meta);
        const enroll = document.createElement('a');
        enroll.className = 'btn btn-primary online-course-card__enroll';
        enroll.setAttribute('data-course-name', enrollName);
        enroll.setAttribute('data-price-label', price);
        enroll.setAttribute('data-amount-sle-minor', String(amountMinor));
        enroll.href = '#';
        enroll.textContent = 'Enroll Now';
        body.appendChild(enroll);
        card.appendChild(body);

        return card;
    }

    function wireEnrollLinks(container) {
        if (!container) return;
        container.querySelectorAll('a.online-course-card__enroll[data-course-name]').forEach(function (link) {
            var name = link.getAttribute('data-course-name');
            if (!name) return;
            var price =
                link.getAttribute('data-price-label') ||
                (typeof CONFIG !== 'undefined' && CONFIG.CHECKOUT_DISPLAY_PRICE) ||
                'NLe 1000';
            var am = link.getAttribute('data-amount-sle-minor');
            var href =
                'checkout.html?course=' +
                encodeURIComponent(name) +
                '&price=' +
                encodeURIComponent(price);
            if (am && /^\d+$/.test(am)) {
                href += '&amount_minor=' + encodeURIComponent(am);
            }
            link.href = href;
        });
    }

    function render(categories, courses) {
        if (!root) return;
        root.textContent = '';
        setError('');

        const byCat = {};
        courses.forEach(function (c) {
            var k = c.categorySlug || 'other';
            if (!byCat[k]) byCat[k] = [];
            byCat[k].push(c);
        });

        const metaBySlug = {};
        (categories && categories.length ? categories : defaultCategories()).forEach(function (c) {
            metaBySlug[c.slug] = c;
        });

        const rendered = {};

        function appendSection(slug, catRow) {
            if (rendered[slug]) return;
            var list = byCat[slug];
            if (!list || !list.length) return;
            rendered[slug] = true;

            var cat = catRow || metaBySlug[slug] || { slug: slug, sectionTitle: slug, sectionLead: '' };

            var section = document.createElement('section');
            section.className = 'online-course-category-block';
            section.setAttribute('data-online-category-section', slug);
            section.setAttribute('aria-labelledby', 'oc-cat-' + slug);

            var head = document.createElement('div');
            head.className = 'online-course-category-block__head';
            var h2 = document.createElement('h2');
            h2.id = 'oc-cat-' + slug;
            h2.className = 'online-course-category-block__title';
            h2.textContent = cat.sectionTitle || slug;
            var lead = document.createElement('p');
            lead.className = 'online-course-category-block__lead';
            lead.textContent = cat.sectionLead || '';
            head.appendChild(h2);
            head.appendChild(lead);
            section.appendChild(head);

            var grid = document.createElement('div');
            grid.className = 'online-courses-grid';
            list.forEach(function (course) {
                grid.appendChild(createCourseCard(course));
            });
            section.appendChild(grid);
            root.appendChild(section);
        }

        if (categories && categories.length) {
            categories.forEach(function (cat) {
                appendSection(cat.slug, cat);
            });
        }
        Object.keys(byCat).forEach(function (slug) {
            appendSection(slug, metaBySlug[slug]);
        });

        wireEnrollLinks(root);
        document.dispatchEvent(
            new CustomEvent('kns-online-courses-loaded', { detail: { count: courses.length } })
        );
    }

    function run() {
        if (!root) return;
        setError('');
        root.textContent = '';
        var loading = document.createElement('p');
        loading.className = 'online-courses-catalog-loading';
        loading.textContent = 'Loading courses…';
        root.appendChild(loading);

        fetch(apiUrl, { method: 'GET', credentials: 'omit', mode: 'cors' })
            .then(function (res) {
                return res.text().then(function (text) {
                    var data = {};
                    if (text) {
                        try {
                            data = JSON.parse(text);
                        } catch (e) {
                            data = {};
                        }
                    }
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (result) {
                root.textContent = '';
                if (!result.ok || !result.data || !result.data.success) {
                    var msg =
                        (result.data && result.data.error) ||
                        'Could not load courses. Confirm the API is running and catalog tables exist in Supabase.';
                    setError(msg);
                    document.dispatchEvent(new CustomEvent('kns-online-courses-loaded', { detail: { count: 0, error: true } }));
                    return;
                }
                var cats = result.data.categories || [];
                var courses = result.data.courses || [];
                if (!courses.length) {
                    setError(
                        result.data.message ||
                            'No courses in the catalog yet. Add rows in Supabase (online_courses) or run database/supabase_online_courses.sql.'
                    );
                    document.dispatchEvent(new CustomEvent('kns-online-courses-loaded', { detail: { count: 0 } }));
                    return;
                }
                render(cats.length ? cats : defaultCategories(), courses);
            })
            .catch(function () {
                root.textContent = '';
                setError('Could not reach the server to load courses. Check your connection and try again.');
                document.dispatchEvent(new CustomEvent('kns-online-courses-loaded', { detail: { count: 0, error: true } }));
            });
    }

    function defaultCategories() {
        return [
            {
                slug: 'business',
                sectionTitle: 'Business & management',
                sectionLead: 'Leadership, finance, marketing, and organisational technology.',
                sortOrder: 10
            },
            {
                slug: 'ict',
                sectionTitle: 'ICT, software & data',
                sectionLead: 'Computing, networks, web development, analytics, and AI skills.',
                sortOrder: 20
            },
            {
                slug: 'microsoft',
                sectionTitle: 'Microsoft certifications',
                sectionLead: 'Microsoft 365, Azure fundamentals, Power Platform, and security fundamentals.',
                sortOrder: 30
            },
            {
                slug: 'cisco',
                sectionTitle: 'Cisco networking & support',
                sectionLead: 'Cisco Certified Support Technician (CCST) pathways.',
                sortOrder: 40
            },
            {
                slug: 'autodesk',
                sectionTitle: 'Autodesk design',
                sectionLead: 'Professional CAD and BIM software credentials.',
                sortOrder: 50
            }
        ];
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
