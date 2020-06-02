import { useEffect, useState } from 'react'

export default function Checkout() {
  const [client, setClient] = useState();

  useEffect(() => {
    if (!navigator.serviceWorker) {
      return;
    }

    function handleMessageEvent(event) {
      setClient(event.source);
    }

    navigator.serviceWorker.addEventListener('message', handleMessageEvent);
    navigator.serviceWorker.controller.postMessage('payment_app_window_ready');

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessageEvent);
    };
  }, []);

  function onPay() {
    if (!client) {
      return;
    }
    
    const response = {
      methodName: 'https://web-payments-playground.now.sh/api/pay',
      details: { id: '123456' }
    };
    client.postMessage(response);
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  function onCancel() {
    if (!client) {
      return;
    }

    client.postMessage('The payment request is cancelled by user');
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  return (
    <section>
      <header>
        <h1>Sanghyeon Pay</h1>
      </header>
      <section>
        {client && (
          <h2>Total: {client.total}</h2>
        )}
      </section>
      <footer>
        <button onClick={onCancel}>취소</button>
        <button onClick={onPay}>결제</button>
      </footer>
    </section>
  )
}
