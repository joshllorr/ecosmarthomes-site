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
router.post('/api/contact', async (request: Request, env: any) => {
  try {
    let data;

    // Try to parse the JSON body
    try {
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
      name: data.name ? '[REDACTED]' : 'N/A',
      email: data.email ? '[REDACTED]' : 'N/A',
      phone: data.phone ? '[REDACTED]' : 'N/A',
      topic: data.topic || 'N/A',
      message: data.message ? '[REDACTED]' : 'N/A',
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
