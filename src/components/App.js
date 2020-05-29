import { useState, useEffect } from 'react';

const items = [
  { id: 1, name: 'Item 1', price: 1000, discountRate: 0 },
  { id: 2, name: 'Item 2', price: 2000, discountRate: 10 },
  { id: 3, name: 'Item 3', price: 3000, discountRate: 15 },
];

export default function App() {
  const [selectedItemMap, setSelectedItemMap] = useState({});
  const [receipt, setReceipt] = useState();
  const selectedItems = items.filter(item => selectedItemMap[item.id]);

  function handleSelectedItemChange(itemId) {
    const nextSelectedItemMap = {
      ...selectedItemMap,
      [itemId]: !selectedItemMap[itemId],
    };
    setSelectedItemMap(nextSelectedItemMap);
  }

  function computeTotalPrice() {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  }

  async function handlePaymentClick() {
    if (!window.PaymentRequest) {
      window.alert('This browser does not support Payment Request API');
    }

    const paymentRequest = makePaymentRequest();

    try {
      const canPay = await paymentRequest.canMakePayment();

      if (!canPay) {
        throw new Error('cannot pay');
      }

      const paymentResponse = await paymentRequest.show();
      console.log('paymentResponse', paymentResponse);

      try {
        const paymentResult = await fetch('/api/pay', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentResponse.toJSON())
        }).json();
  
        await paymentResponse.complete(paymentResult.success ? 'sucess' : 'fail');
        setReceipt(paymentResponse);
      } catch (error) {
        paymentResponse.complete('fail');
      }
      
    } catch (error) {
      console.error('failed to request the payment', error);
    }
  }

  function makePaymentRequest() {
    const methodData = [
      {
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard'],
        },
      },
      {
        supportedMethods: 'https://apple.com/apple-pay',
        data: {
          version: 3,
          merchantIdentifier: 'merchant.com.example',
          merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
          supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
          countryCode: 'US',
        },
      },
      {
        supportedMethods: 'https://web-payments-playground.now.sh/api/pay',
      },
    ];
    const details = {
      displayItems: selectedItems.map(item => ({
        label: item.name,
        amount: { currency: 'KRW', value : item.price },
      })),
      total:  {
        label: 'Total',
        amount: { currency: 'KRW', value : computeTotalPrice() },
      }
    };
    const options = {
      requestShipping: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestPayerName: true
    };
    const request = new PaymentRequest(
      methodData,
      details,
      options
    );
  
    return request;
  }

  useEffect(() => {
    if (receipt) {
      window.location = '#receipt';
    }
  }, [receipt]);

  return (
    <div className="container">
      <section id="shop" className="shop page">
        <ul className="items">
          {items.map(item => (
            <li key={item.id} className="item">
              <h3>{item.name}</h3>
              <div className="item-option">
                <p className="item-price"><strong>{item.price} 원</strong></p>
                <label>
                  <input type="checkbox" value={selectedItems[item.id] || false} onChange={handleSelectedItemChange.bind(this, item.id)} /> 선택
                </label>
              </div>
            </li>
          ))}
        </ul>
        <div className="navigation">
          <a href="#payment">주문하러 가기</a>
        </div>
      </section>

      <section id="payment" className="payment page">
        <ul>
          {selectedItems.map(item => (
            <li key={item.id}>{item.name} ({item.price} 원)</li>
          ))}
        </ul>
        <h3>총 {computeTotalPrice()} 원</h3>
        
        <div className="navigation">
          <button onClick={handlePaymentClick}>결제하기</button>
          <a href="#shop">취소</a>
        </div>
      </section>

      <section id="receipt" className="receipt page">

      </section>


      <style jsx>{`
        .container {
          max-width: 768px;
          margin: 0 auto;
          padding-top: 40px;
        }
        .page {
          height: 100vh;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 50px;
          padding: 0 20px;
        }

        .item-option {
          display: flex;
          align-items: center;
        }

        .item-price {
           margin-right: 10px;
        }

        .navigation {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .navigation > button, .navigation > a {
          margin: 0 10px;
          font-size: 24px;
          text-align: center;
        }

        
      `}</style>
    </div>
  );
}
