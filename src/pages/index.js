import Head from 'next/head'

import App from '@/components/App'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Playground for Web Payments</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />

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
