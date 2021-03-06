// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  if (req.method === 'HEAD' || req.method === 'GET') {
    res.setHeader('Link', '<https://web-payments-playground.now.sh/payment-manifest.json>; rel="payment-method-manifest"');
    res.statusCode = 204;
    res.end();
  } else if (req.method === 'POST') {
    res.statusCode = 200;
    res.json({ success: true });
  } else {
    res.statusCode = 405;
    res.end();
  }
};
