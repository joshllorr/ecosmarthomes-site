/**
 * EcoSmartHomes Branded WhatsApp Quick-Consult Widget
 * Direct Voice Note & Photo Consultation with Joe
 */
(function() {
  'use strict';

  // Joe's direct business WhatsApp line (international format without +)
  const JOE_WHATSAPP_NUMBER = '353839662197';

  function injectWhatsAppWidget() {
    if (document.getElementById('esh-whatsapp-floating-btn')) return;

    // 1. Floating Launch Button
    const btn = document.createElement('button');
    btn.id = 'esh-whatsapp-floating-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open WhatsApp Quick-Consult with Joe');
    btn.innerHTML = `
      <span class="wa-pulse-ring"></span>
      <span>💬 Send Photo / Voice Note to Joe</span>
    `;
    document.body.appendChild(btn);

    // 2. Modal Overlay
    const modal = document.createElement('div');
    modal.id = 'esh-wa-modal-overlay';
    modal.innerHTML = `
      <div class="esh-wa-card" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title">
        
        <button type="button" class="esh-wa-close-btn" id="esh-wa-close" aria-label="Close modal">✕</button>

        <!-- Profile Header -->
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #003628; border: 2px solid #25D366; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; position: relative;">
            👨‍🔧
            <span style="position: absolute; bottom: 0; right: 0; width: 14px; height: 14px; background: #25D366; border: 2px solid #00241b; border-radius: 50%;"></span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <h3 id="wa-modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;">Joe · Independent Retrofit Lead</h3>
              <span style="font-size: 0.9rem;">🇮🇪</span>
            </div>
            <div style="font-size: 0.75rem; color: #34f5c5; font-weight: 700; margin-top: 2px;">
              ● Online · Replies in &lt;15 mins · 100% Conflict-Free
            </div>
          </div>
        </div>

        <p style="font-size: 0.84rem; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.45;">
          No long forms. Send a quick voice note or snap a photo of your <strong>boiler, fuseboard, or cylinder</strong> to check SEAI grant eligibility.
        </p>

        <!-- Topic Chips -->
        <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; font-family: monospace;">
          What would you like to send Joe?
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <div class="wa-topic-chip active" id="chip-boiler" onclick="window.setWaTopic('boiler')">
            <span>📷</span>
            <span>Send Boiler / Hot Water Cylinder Photo for Viability Check</span>
          </div>
          <div class="wa-topic-chip" id="chip-grant" onclick="window.setWaTopic('grant')">
            <span>🎙️</span>
            <span>Send Voice Note about Eircode & €35,000 SEAI Grants</span>
          </div>
          <div class="wa-topic-chip" id="chip-quote" onclick="window.setWaTopic('quote')">
            <span>📑</span>
            <span>Send Contractor Quote for Independent Red-Line Audit</span>
          </div>
        </div>

        <!-- Inputs: Eircode & Current Heating -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div>
            <label for="wa-eircode" style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">Eircode / County:</label>
            <input type="text" id="wa-eircode" value="V94 (Limerick)" placeholder="e.g. V94 or Dublin" style="width: 100%; padding: 8px 10px; background: #001711; color: #ffffff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;" oninput="window.updateWaPreview()" />
          </div>
          <div>
            <label for="wa-ber" style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">Current BER / Fuel:</label>
            <input type="text" id="wa-ber" value="D1 - Oil Boiler" placeholder="e.g. D1 - Oil" style="width: 100%; padding: 8px 10px; background: #001711; color: #ffffff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;" oninput="window.updateWaPreview()" />
          </div>
        </div>

        <!-- Live Message Preview -->
        <div style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: monospace;">
          Pre-Formatted WhatsApp Message:
        </div>
        <div class="wa-preview-box" id="wa-preview-text"></div>

        <!-- Launch WhatsApp Button -->
        <button type="button" class="btn-launch-wa" id="btn-launch-whatsapp">
          <span>📲 Open WhatsApp & Chat with Joe</span>
        </button>

        <div style="margin-top: 12px; text-align: center; font-size: 0.7rem; color: #64748b;">
          🔒 Zero contractor spam. Private 1-on-1 independent counsel.
        </div>

      </div>
    `;
    document.body.appendChild(modal);

    // Event Bindings
    let currentTopic = 'boiler';

    window.setWaTopic = function(topic) {
      currentTopic = topic;
      ['boiler', 'grant', 'quote'].forEach(t => {
        const el = document.getElementById('chip-' + t);
        if (el) el.classList.toggle('active', t === topic);
      });
      window.updateWaPreview();
    };

    window.updateWaPreview = function() {
      const eircode = document.getElementById('wa-eircode')?.value.trim() || 'Ireland';
      const ber = document.getElementById('wa-ber')?.value.trim() || 'D1';
      let msg = '';

      if (currentTopic === 'boiler') {
        msg = `Hi Joe, I'm looking at upgrading my ${ber} home in ${eircode}. I'd like your independent advice on heat pump readiness. Attached is a photo of my current boiler / cylinder setup...`;
      } else if (currentTopic === 'grant') {
        msg = `Hi Joe, I have a property in ${eircode} (BER: ${ber}) and want to understand how to claim up to €35,000 in SEAI grants. Sending you a quick voice note with details...`;
      } else {
        msg = `Hi Joe, I received a contractor quote for my ${ber} home in ${eircode}. Can you red-line it against fair Irish market benchmarks? Sending the quote details now...`;
      }

      const previewEl = document.getElementById('wa-preview-text');
      if (previewEl) previewEl.textContent = msg;
    };

    // Open / Close Modal
    btn.addEventListener('click', () => {
      modal.style.display = 'flex';
      window.updateWaPreview();
    });

    document.getElementById('esh-wa-close')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Launch WhatsApp
    document.getElementById('btn-launch-whatsapp')?.addEventListener('click', () => {
      const previewText = document.getElementById('wa-preview-text')?.textContent || '';
      const encodedMsg = encodeURIComponent(previewText);
      const url = `https://wa.me/${JOE_WHATSAPP_NUMBER}?text=${encodedMsg}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      modal.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWhatsAppWidget);
  } else {
    injectWhatsAppWidget();
  }
})();
