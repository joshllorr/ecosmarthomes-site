const handler = require('../../../../api/cron/monday-report.js');

export async function GET(req) {
  // Adapt Next.js App Router request to the handler's expected format
  const res = {
    status: (code) => ({
      json: (body) => new Response(JSON.stringify(body), {
        status: code,
        headers: { 'Content-Type': 'application/json' }
      }),
      end: () => new Response(null, { status: code })
    })
  };

  const adaptedReq = {
    headers: {
      authorization: req.headers.get('authorization') || ''
    },
    method: 'GET'
  };

  return await handler(adaptedReq, res);
}
