/**
 * Shared behaviour for checkout-success.html and checkout-cancelled.html:
 * reads ?course= and ?price= from the URL to personalise copy and the retry link.
 */
(function () {
    'use strict';

    function safeDecode(v) {
        if (v == null || v === '') return '';
        try {
            return decodeURIComponent(String(v).replace(/\+/g, ' '));
        } catch (e) {
            return String(v);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var courseRaw = params.get('course');
    var priceRaw = params.get('price');
    var course = safeDecode(courseRaw);
    var price = safeDecode(priceRaw);

    var line = document.getElementById('checkout-result-course-line');
    if (line && course) {
        var bits = ['Enrollment: ' + course];
        if (price) bits.push(price);
        line.textContent = bits.join(' · ');
        line.hidden = false;
    }

    var retry = document.getElementById('checkout-cancelled-retry');
    if (retry && course) {
        var href = 'checkout.html?course=' + encodeURIComponent(course);
        if (price) href += '&price=' + encodeURIComponent(price);
        retry.setAttribute('href', href);
    }

    if (course) {
        var isSuccess = document.body.classList.contains('page-checkout-result--success');
        document.title =
            (isSuccess ? 'Payment received' : 'Checkout cancelled') + ' — ' + course + ' | KNS College';
    }
})();

