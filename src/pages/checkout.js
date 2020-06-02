import Head from 'next/head'

import Checkout from '@/components/Checkout'

export default function CheckoutPage() {
  return (
    <>
      <Head>
        <title>Sanghyeon Pay Checkout Page</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="manifest" href="/manifest.json"></link>
      </Head>
      <main>
        <Checkout />
      </main>
    </>
  );
}
