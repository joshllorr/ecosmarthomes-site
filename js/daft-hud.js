/**
 * EcoSmartHomes - Daft.ie & MyHome.ie 1-Click Browser Bookmarklet (EcoSmart HUD)
 * 2026 Irish Statutory Energy Regulation Compliant
 */

(function() {
  'use strict';

  // The Pure Executable Bookmarklet Payload
  const BOOKMARKLET_PAYLOAD = `(function(){
    if(document.getElementById('ecosmart-daft-hud')){
      document.getElementById('ecosmart-daft-hud').classList.toggle('open');
      return;
    }
    var pageText=document.body.innerText||'';
    var priceMatch=pageText.match(/€\\s*(\\d{1,3}(?:,\\d{3})+)/);
    var askingPrice=priceMatch?parseInt(priceMatch[1].replace(/,/g,''),10):450000;
    var berMatch=pageText.match(/BER[:\\s]+([A-G][0-3]?|SI\\s*666)/i);
    var berGrade=berMatch?berMatch[1].toUpperCase():'E1';
    
    var surgeMultiplier=0.07;
    if(berGrade.startsWith('F')||berGrade.startsWith('G')) surgeMultiplier=0.095;
    else if(berGrade.startsWith('D')||berGrade.startsWith('E')) surgeMultiplier=0.075;
    else if(berGrade.startsWith('C')) surgeMultiplier=0.05;
    var equitySurge=Math.round(askingPrice*surgeMultiplier);
    var monthlyMortgageSavings=Math.round((askingPrice*0.8*0.0035)/12);
    
    var hud=document.createElement('div');
    hud.id='ecosmart-daft-hud';
    hud.style.cssText='position:fixed;top:15px;right:15px;width:340px;max-width:calc(100vw - 30px);background:rgba(6,26,20,0.96);border:2px solid #34f5c5;border-radius:18px;box-shadow:0 15px 50px rgba(0,0,0,0.8),0 0 30px rgba(52,245,197,0.3);z-index:2147483647;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;padding:20px;box-sizing:border-box;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);animation:slideInRight 0.3s cubic-bezier(0.16,1,0.3,1);';
    
    hud.innerHTML=\`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(52,245,197,0.3);padding-bottom:8px;">
        <div style="font-weight:900;font-size:1.05rem;color:#fff;display:flex;align-items:center;gap:6px;">
          <span>🏡</span> EcoSmart<strong style="color:#34f5c5;">HUD</strong>
        </div>
        <button onclick="document.getElementById('ecosmart-daft-hud').remove()" style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;padding:0 4px;">✕</button>
      </div>
      <div style="font-size:0.75rem;color:#34f5c5;font-family:monospace;margin-bottom:10px;text-transform:uppercase;">
        ⚡ Auto-Detected: €\${askingPrice.toLocaleString()} · BER \${berGrade}
      </div>
      <div style="background:rgba(52,245,197,0.1);border-left:3px solid #34f5c5;padding:10px;border-radius:6px;margin-bottom:12px;">
        <div style="font-size:0.72rem;color:#94a3b8;text-transform:uppercase;">Capital Equity Surge (to A2):</div>
        <div style="font-size:1.25rem;font-weight:900;color:#34f5c5;">+€\${equitySurge.toLocaleString()}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:0.8rem;">
        <div style="background:#001711;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);">
          <div style="color:#94a3b8;font-size:0.68rem;">SEAI Grant Pot:</div>
          <strong style="color:#fcd34d;">Up to €35,000</strong>
        </div>
        <div style="background:#001711;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);">
          <div style="color:#94a3b8;font-size:0.68rem;">Green Mortgage:</div>
          <strong style="color:#6ee7b7;">-€\${monthlyMortgageSavings}/mo</strong>
        </div>
      </div>
      <a href="https://ecosmarthomes.ie/checkout/?price=\${askingPrice}&ber=\${berGrade}" target="_blank" style="display:block;background:#34f5c5;color:#00241b;font-weight:900;text-align:center;padding:10px;border-radius:8px;text-decoration:none;font-size:0.88rem;box-shadow:0 0 15px rgba(52,245,197,0.4);margin-top:8px;">
        ⭐ Book €49 Pre-Purchase Survey →
      </a>
      <div style="font-size:0.68rem;color:#94a3b8;text-align:center;margin-top:8px;">
        EcoSmartHomes Ireland · 100% Conflict-Free Engineering
      </div>
    \`;
    document.body.appendChild(hud);
  })();`;

  window.getBookmarkletHref = function() {
    return 'javascript:' + encodeURIComponent(BOOKMARKLET_PAYLOAD.replace(/\s+/g, ' '));
  };

  window.copyBookmarkletCode = function() {
    const code = window.getBookmarkletHref();
    navigator.clipboard.writeText(code).then(() => {
      if (window.showEshToast) {
        window.showEshToast('Copied Bookmarklet Code to Clipboard!', '🔖');
      }
    });
  };

  // Live In-Page Simulator Trigger
  window.triggerSimulatorHud = function() {
    eval(BOOKMARKLET_PAYLOAD);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const linkBtn = document.getElementById('drag-bookmarklet-btn');
    if (linkBtn) {
      linkBtn.href = window.getBookmarkletHref();
    }
  });

})();
