import Head from 'next/head'

import App from '@/components/App'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    async function registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        // Register a service worker
        const registration = await navigator.serviceWorker.register(
          'service-worker.js'
        );
        // Check if Payment Handler is available
        if (!registration.paymentManager) {
          console.log('PaymentManager API not found.');
          return;
        }

        if (!registration.paymentManager.enableDelegations) {
          console.log('PaymentManager does not support enableDelegations method');
          return;
        }
      
        registration.paymentManager.userHint = 'Made by Sanghyeon Lee';

        registration.paymentManager.enableDelegations([
          'shippingAddress',
          'payerEmail',
          'payerPhone',
          'payerName',
        ]);

        registration.paymentManager.instruments.set(
          // Payment instrument key can be any string.
          'sanghyeonpay-payment-method',
          // Payment instrument detail
          {
            name: 'Sanghyeon Pay',
            method: 'https://web-payments-playground.now.sh/api/pay',
          }
        );
      }
    }

    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Playground for Web Payments</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json"></link>

        <script src="https://storage.googleapis.com/prshim/v1/payment-shim.js"></script>
      </Head>

      <main>
        <h1>This is a playground for <a href="https://www.w3.org/TR/payment-request" target="_blank" rel="noreferrer noopener">Web Payments</a>.</h1>
        <hr />
        <App />
      </main>

      <style jsx>{`
        h1 {
          text-align: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        h1, h2, h3, h4, h5, h6, p {
          margin: 0;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
