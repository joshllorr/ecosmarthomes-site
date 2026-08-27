document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(contactForm);

      if (!formData.get('name') || !formData.get('email') || !formData.get('message')) {
        showMessage('Please fill in all required fields', 'error');
        return;
      }

      try {
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          showMessage('Thank you! We’ll be in touch within 24 hours.', 'success');
          
          // Trigger Google Ads conversion tracking
          if (typeof gtag === 'function') {
            let userData = {};
            if (data.email) {
              userData.email = data.email.trim().toLowerCase();
            }
            if (data.phone) {
              let phone = data.phone.trim().replace(/[^\d+]/g, '');
              if (phone.startsWith('0')) {
                phone = '+353' + phone.substring(1);
              } else if (!phone.startsWith('+') && phone.length > 0) {
                phone = '+' + phone;
              }
              userData.phone_number = phone;
            }

            gtag('event', 'conversion', {
              'send_to': 'AW-3013797648/7601809802',
              'user_data': userData
            });
          }

          contactForm.reset();
        } else {
          const text = await response.text();
          showMessage(text || 'An error occurred. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again later.', 'error');
      }
    });
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;

    setTimeout(() => {
      formMessage.className = 'form-message';
    }, 5000);
  }
});
