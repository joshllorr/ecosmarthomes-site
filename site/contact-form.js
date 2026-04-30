document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(contactForm);

      // Validate required fields
      if (!formData.get('name') || !formData.get('email') || !formData.get('message')) {
        showMessage('Please fill in all required fields', 'error');
        return;
      }

      // Convert FormData to JSON object
      const jsonData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        topic: formData.get('topic'),
        message: formData.get('message')
      };

      try {
        const response = await fetch('https://ecosmarthomes.ie/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonData)
        });

        if (response.ok) {
          showMessage('Thank you! We’ll be in touch within 24 hours.', 'success');
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

