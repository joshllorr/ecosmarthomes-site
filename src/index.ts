import { Router } from 'itty-router';

const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

/**
 * Escapes special characters for use in HTML to prevent injection
 */
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to send email notification using Resend
async function sendEmailNotification(data: any, env: any) {
  const { RESEND_API_KEY, EMAIL_FROM, EMAIL_TO } = env;

  if (!RESEND_API_KEY || !EMAIL_FROM || !EMAIL_TO) {
    console.error('Email configuration missing. Please set RESEND_API_KEY, EMAIL_FROM, and EMAIL_TO environment variables.');
    return { success: false, error: 'Configuration missing' };
  }

  const emailBody = {
    from: EMAIL_FROM,
    to: [EMAIL_TO],
    subject: `New Contact Form Submission: ${data.topic || 'General Enquiry'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(data.phone || 'N/A')}</p>
      <p><strong>Topic:</strong> ${escapeHtml(data.topic || 'N/A')}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      <hr />
      <p><small>Submitted at: ${new Date().toISOString()}</small></p>
    `
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify(emailBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  console.log('Email sent successfully via Resend:', result);
  return { success: true, result };
}

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    headers: corsHeaders
  });
});

// Contact form endpoint
router.post('/api/contact', async (request: Request, env: any) => {
  try {
    let data;
    let data: any = {};
    const contentType = request.headers.get('Content-Type') || '';

    // Try to parse the JSON body
    try {
      const text = await request.text();
      console.log('Received body:', text);

      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
      if (contentType.includes('application/json')) {
        data = await request.json();
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
      } else {
        const text = await request.text();
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Empty request body' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          }
        );
      }

      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and message are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Log the contact form submission
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone || 'N/A',
      topic: data.topic || 'N/A',
      message: data.message,
      timestamp: new Date().toISOString()
    });

    // TODO: Send email notification here
    // You can integrate with services like:
    // - SendGrid API
    // - Mailgun API
    // - Resend API
    // - Or store in a database (D1, etc.)
    // Log the contact form submission (redacting PII for privacy)
    console.log('Contact form submission received:', {
      name: data.name ? '[REDACTED]' : 'N/A',
      email: data.email ? '[REDACTED]' : 'N/A',
      phone: data.phone ? '[REDACTED]' : 'N/A',
      topic: data.topic || 'N/A',
      timestamp: new Date().toISOString()
    });

    // Send email notification
    try {
      await sendEmailNotification(data, env);
    } catch (emailError) {
      // We catch errors but don't fail the request to ensure the user gets a success message
      // as the submission was already logged.
      console.error('Failed to send email notification:', emailError);
    }
    
    // For now, just log and return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you! We received your enquiry and will get back to you within 24 hours.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error: any) {
    console.error('Contact form error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request. Please try again later.',
        details: error?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});

// Serve static assets
router.all('*', (request: Request, env: any) => {
  return env.ASSETS.fetch(request);
});

export default {
  fetch: router.fetch
};
