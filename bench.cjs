const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('site/index.html', 'utf-8');

const dom = new JSDOM(html);
const document = dom.window.document;

// Polyfill IntersectionObserver
class IntersectionObserver {
    constructor(cb, options) {}
    observe(el) {}
    unobserve(el) {}
    disconnect() {}
}

function runOld() {
    const observer = new IntersectionObserver(() => {}, {});
    const start = performance.now();

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    const animateElements = document.querySelectorAll(
        '.problem-header, .problem-card, .services-header, .service-card, ' +
        '.process-header, .process-step, .independence-content, .independence-image, ' +
        '.testimonials-header, .testimonial-card, .faq-header, .faq-item, ' +
        '.cta-content'
    );

    animateElements.forEach(el => {
        el.classList.add('fade-in');
    });

    return performance.now() - start;
}

function runNew() {
    const observer = new IntersectionObserver(() => {}, {});
    const start = performance.now();

    const animateElements = document.querySelectorAll(
        '.fade-in, .problem-header, .problem-card, .services-header, .service-card, ' +
        '.process-header, .process-step, .independence-content, .independence-image, ' +
        '.testimonials-header, .testimonial-card, .faq-header, .faq-item, ' +
        '.cta-content'
    );

    animateElements.forEach(el => {
        if (!el.classList.contains('fade-in')) {
            el.classList.add('fade-in');
        }
        observer.observe(el);
    });

    return performance.now() - start;
}

// Prepare
runOld(); // ensure classes are added

// Warm up
for (let i = 0; i < 1000; i++) {
    runOld();
    runNew();
}

// Measure Old
let oldTotal = 0;
const iterations = 50000;

for (let i = 0; i < iterations; i++) {
    oldTotal += runOld();
}

// Measure New
let newTotal = 0;
for (let i = 0; i < iterations; i++) {
    newTotal += runNew();
}

console.log(`Baseline: ${(oldTotal / iterations).toFixed(4)} ms`);
console.log(`New: ${(newTotal / iterations).toFixed(4)} ms`);
console.log(`Improvement: ${((oldTotal - newTotal) / oldTotal * 100).toFixed(2)}%`);
