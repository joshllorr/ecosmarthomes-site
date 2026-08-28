/**
 * EcoSmartHomes Smart Scroll Navigation & Off-Canvas Side Drawer Controller
 */
(function() {
  'use strict';

  let lastScrollY = window.scrollY;
  let ticking = false;
  const SCROLL_THRESHOLD = 50;

  function initSmartNav() {
    const header = document.querySelector('.main-nav-bar') || document.querySelector('.header');
    
    // 1. Create Side Tab Floating Toggle if not present
    if (!document.getElementById('esh-side-tab-toggle')) {
      const sideTab = document.createElement('button');
      sideTab.id = 'esh-side-tab-toggle';
      sideTab.type = 'button';
      sideTab.setAttribute('aria-label', 'Open Tools Navigation Drawer');
      sideTab.innerHTML = `
        <span style="font-size: 1rem;">☰</span>
        <span style="writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 0.08em;">TOOLS</span>
      `;
      sideTab.onclick = window.openToolsDrawer;
      document.body.appendChild(sideTab);
    }

    // 2. Create Drawer Overlay and Panel if not present
    if (!document.getElementById('esh-drawer-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'esh-drawer-overlay';
      overlay.onclick = window.closeToolsDrawer;
      document.body.appendChild(overlay);

      const drawer = document.createElement('aside');
      drawer.id = 'esh-side-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'All EcoSmartHome Independent Tools');
      drawer.innerHTML = `
        <div class="drawer-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">🏡</span>
            <strong style="font-size: 1.15rem; color: #ffffff;">EcoSmart<span style="color: #34f5c5;">Homes</span></strong>
          </div>
          <button type="button" class="drawer-close-btn" onclick="window.closeToolsDrawer()" aria-label="Close drawer">✕</button>
        </div>

        <div style="margin-bottom: 14px;">
          <a href="/checkout/" class="btn-book-nav" style="display: block; text-align: center; padding: 12px; font-size: 0.92rem; border-radius: 8px;">
            💳 Book Joe's €49 Survey →
          </a>
        </div>

        <div class="drawer-section-title">⚡ ENERGY CALCULATORS & SIMULATORS</div>
        <a href="/solar/" class="drawer-link-item">
          <span class="tool-icon">☀️</span>
          <div>
            <div>Solar PV & CEG Simulator</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Eircode irradiance & 24c export cash</div>
          </div>
        </a>
        <a href="/battery-arbitrage/" class="drawer-link-item">
          <span class="tool-icon">🔋</span>
          <div>
            <div>Smart Battery Arbitrage</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Charge at 7c, slash 38c peak bills</div>
          </div>
        </a>
        <a href="/radiator-sizer/" class="drawer-link-item">
          <span class="tool-icon">📐</span>
          <div>
            <div>Radiator Low-Flow Sizer</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">NSAI SR50-2:2024 heat pump compliance</div>
          </div>
        </a>
        <a href="/retrofit-loan/" class="drawer-link-item">
          <span class="tool-icon">💶</span>
          <div>
            <div>0% Loan & Grant Stacker</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">SBCI 3.55% subsidized cashflow</div>
          </div>
        </a>
        <a href="/ber-matrix/" class="drawer-link-item">
          <span class="tool-icon">🏡</span>
          <div>
            <div>Simplified BER Matrix (A0-G)</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">May 2026 SEAI scale & value surge</div>
          </div>
        </a>
        <a href="/carbon-tax/" class="drawer-link-item">
          <span class="tool-icon">⚡</span>
          <div>
            <div>Carbon Tax Ticker</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">2026–2030 fossil fuel penalty audit</div>
          </div>
        </a>
        <a href="/green-mortgage/" class="drawer-link-item">
          <span class="tool-icon">🏛️</span>
          <div>
            <div>Green Mortgage Arbitrage</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Unlock 3.45% discounted interest</div>
          </div>
        </a>

        <div class="drawer-section-title">🛡️ AUDITING & TENDERING</div>
        <a href="/quote-auditor/" class="drawer-link-item">
          <span class="tool-icon">🛡️</span>
          <div>
            <div>Contractor Quote Speedometer</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Anti-scam quote red-liner & PDF</div>
          </div>
        </a>
        <a href="/tender-generator/" class="drawer-link-item">
          <span class="tool-icon">📋</span>
          <div>
            <div>Contractor Tender RFP</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">NSAI SR50 tender spec & milestone terms</div>
          </div>
        </a>
        <a href="/contractors/" class="drawer-link-item">
          <span class="tool-icon">👔</span>
          <div>
            <div>For Registered Installers</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">SEAI compliance & pre-screened jobs</div>
          </div>
        </a>

        <div class="drawer-section-title">📍 DIRECTORY & SUPPORT</div>
        <a href="/locations/" class="drawer-link-item">
          <span class="tool-icon">📍</span>
          <div>
            <div>33 Irish Towns SEO Hub</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Local micro-climate & survey directory</div>
          </div>
        </a>
        <a href="/tools/voice-aoife.html" class="drawer-link-item">
          <span class="tool-icon">🎙️</span>
          <div>
            <div>Ask Aoife (Voice AI)</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">Interactive voice energy advisor</div>
          </div>
        </a>
        <a href="/support/faq.html" class="drawer-link-item">
          <span class="tool-icon">❓</span>
          <div>
            <div>Knowledgebase & FAQ</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 500;">SEAI grant guides & conflict-free charter</div>
          </div>
        </a>
      `;
      document.body.appendChild(drawer);
    }

    // 3. Global Drawer Open/Close Handlers
    window.openToolsDrawer = function() {
      const overlay = document.getElementById('esh-drawer-overlay');
      const drawer = document.getElementById('esh-side-drawer');
      if (overlay && drawer) {
        overlay.classList.add('active');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeToolsDrawer = function() {
      const overlay = document.getElementById('esh-drawer-overlay');
      const drawer = document.getElementById('esh-side-drawer');
      if (overlay && drawer) {
        overlay.classList.remove('active');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.closeToolsDrawer();
    });

    // 4. Smart Scroll Event Listener (Hides header & side tab on deep scroll-down, brings back on scroll-up)
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const currentScrollY = window.scrollY;
          const sideTab = document.getElementById('esh-side-tab-toggle');

          if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
            // Scrolling DOWN -> Hide header smoothly
            if (header) header.classList.add('nav-hidden');
            if (sideTab) sideTab.classList.remove('tab-hidden');
          } else {
            // Scrolling UP -> Reveal header smoothly
            if (header) header.classList.remove('nav-hidden');
          }

          lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNav);
  } else {
    initSmartNav();
  }
})();
