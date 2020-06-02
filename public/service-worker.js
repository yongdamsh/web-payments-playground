let paymentRequestEvent;

self.addEventListener('canmakepayment', function(e) {
  e.respondWith(true);
});

self.addEventListener('paymentrequest', event => {
  paymentRequestEvent = event;

  const url = 'https://web-payments-playground.now.sh/checkout';

  e.openWindow(url)
    .then(window_client => {
      if (window_client == null) {
        paymentRequestEvent.respondWith(Promise.reject('Failed to open window'));
      }
    })
    .catch(error => {
      paymentRequestEvent.respondWith(Promise.reject(error));
    });
});

self.addEventListener('message', event => {
  if (event.data == 'payment_app_window_ready') {
    sendPaymentRequest();
    return;
  }

  if (event.data.methodName) {
    paymentRequestEvent.respondWith(Promise.resolve(event.data));
  } else {
    paymentRequestEvent.respondWith(Promise.reject(event.data));
  }
});

function sendPaymentRequest() {
  // ref: https://www.w3.org/TR/service-workers-1/#clients-getall
  const options = {
    includeUncontrolled: false,
    type: 'window',
  };

  clients.matchAll(options).then(function(clientList) {
    for (let i = 0; i < clientList.length; i += 1) {
      clientList[i].postMessage({
        total: paymentRequestEvent.total,
        methodData: paymentRequestEvent.methodData,
      });
    }
  });
}
