import { Router } from 'itty-router';

const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    headers: corsHeaders
  });
});

// Contact form endpoint
router.post('/api/contact', async (request: Request) => {
  try {
    // Parse the JSON body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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
      phone: data.phone,
      topic: data.topic,
      message: data.message,
      timestamp: new Date().toISOString()
    });

    // TODO: Send email notification here
    // You can integrate with services like:
    // - SendGrid API
    // - Mailgun API
    // - Resend API
    // - Or store in a database (D1, etc.)
    
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

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request. Please try again later.'
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
