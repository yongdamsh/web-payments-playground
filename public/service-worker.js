// Ref: https://developers.google.com/web/fundamentals/payments/payment-apps-developer-guide/web-payment-apps#locate_a_web_app_manifest

const origin = 'https://web-payments-playground.now.sh';
const methodName = `${origin}/api/pay`;
const checkoutURL = `${origin}/checkout`;
let resolver;
let paymentRequestEvent;

self.addEventListener('canmakepayment', e => {
  e.respondWith(true);
});

self.addEventListener('paymentrequest', e => {
  // Preserve the event for future use
  paymentRequestEvent = e;
  resolver = new PromiseResolver();

  e.respondWith(resolver.promise);
  e.openWindow(checkoutURL).then(client => {
    if (client === null) {
      resolver.reject('Failed to open window');
    }
  }).catch(err => {
    resolver.reject(err);
  });
});

self.addEventListener('message', e => {
  console.log('A message received:', e);
  if (e.data === 'payment_app_window_ready') {
    sendPaymentRequest();
    return;
  }

  if (e.data.methodName === methodName) {  
    resolver.resolve(e.data);  
  } else {  
    resolver.reject(e.data);  
  }  
});

const sendPaymentRequest = () => {
  if (!paymentRequestEvent) {
    return;
  }

  clients.matchAll({
    includeUncontrolled: false,
    type: 'window'
  }).then(clientList => {
    for (let client of clientList) {
      client.postMessage({
        total: paymentRequestEvent.total,
        methodData: paymentRequestEvent.methodData,
      });
    }
  });
}

function PromiseResolver() {
  this.resolve_;

  this.reject_;

  this.promise_ = new Promise(function(resolve, reject) {
    this.resolve_ = resolve;
    this.reject_ = reject;
  }.bind(this));
}

PromiseResolver.prototype = {
  get promise() {
    return this.promise_;
  },

  get resolve() {
    return this.resolve_;
  },

  get reject() {
    return this.reject_;
  },
};
