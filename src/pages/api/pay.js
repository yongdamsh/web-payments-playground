// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  if (req.method === 'POST') {
    console.log(req.body);
    res.statusCode = 200;
    res.json({ success: true });
  } else {
    res.setHeader('link', '<https://web-payments-playground.now.sh/p/payment_method_manifest.json>; rel="payment-method-manifest"');
    res.status = 200;
    res.end();
  }
};
