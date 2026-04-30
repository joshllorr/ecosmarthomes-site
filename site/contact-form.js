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
        console.log('Sending contact form to:', 'https://ecosmarthomes.ie/api/contact');
        console.log('Sending data:', jsonData);
        
        const response = await fetch('https://ecosmarthomes.ie/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(jsonData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        let responseData;
        try {
          responseData = await response.json();
          console.log('Response data:', responseData);
        } catch (parseErr) {
          console.error('Failed to parse response as JSON:', parseErr);
          responseData = { error: 'Invalid response from server' };
        }

        if (response.ok) {
          showMessage('Thank you! We'll be in touch within 24 hours.', 'success');
          contactForm.reset();
        } else {
          const errorMsg = responseData.error || responseData.details || 'An error occurred. Please try again.';
          showMessage(errorMsg, 'error');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        showMessage('Connection error. Please check your internet and try again.', 'error');
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

