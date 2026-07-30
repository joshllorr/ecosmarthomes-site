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

// Site health endpoint (Harbor SEO / SEO Hub integration)
router.get('/api/site-health', () => {
  return new Response(
    JSON.stringify({
      status: "ok",
      schema: "detected",
      altText: "detected",
      meta: "active",
      h1: "Premium Home Energy Retrofit Advisory in Ireland"
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
});

// Contact form endpoint
router.post('/api/contact', async (request: Request, env: any) => {
  try {
    let data;
    
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

    // Send email using Resend
    const resendApiKey = env.RESEND_API_KEY;
    
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'EcoSmartHome Contact <noreply@ecosmarthomes.ie>', // Using your verified domain!
          to: 'askjoe@ecosmarthomes.ie', // Changed to your Outlook 365 address
          reply_to: data.email, // This makes it so hitting "Reply" in Gmail replies directly to the visitor!
          subject: `New Enquiry from ${data.name}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
            <p><strong>Topic:</strong> ${data.topic || 'N/A'}</p>
            <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, '<br/>')}</p>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Failed to send email:', errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Email service error. Please try again.',
            details: errorText
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
    } else {
      console.warn('RESEND_API_KEY is not set. Email was not sent.');
      return new Response(
          JSON.stringify({ 
            error: 'Email configuration missing. Please contact support.'
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

// Serve static assets or return 404 if not found
router.all('*', async (request: Request, env: any) => {
  try {
    const response = await env.ASSETS.fetch(request);
    
    // Create a new response to allow header modification
    const newResponse = new Response(response.body, response);
    
    // Add Permissions-Policy header for microphone access across origins (Gemini Voice Advisor)
    newResponse.headers.set('Permissions-Policy', 'microphone=(self "https://ais-pre-6v2aqu5hko7j6draj7zjac-95863893871.europe-west1.run.app")');
    
    return newResponse;
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
});

export default {
  fetch: router.fetch
};
