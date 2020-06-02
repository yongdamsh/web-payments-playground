import { useState, useEffect } from 'react';

const items = [
  { id: 1, name: '삼다수 2L × 6개', price: 4900 },
  { id: 2, name: '에어팟 프로', price: 300000 },
  { id: 3, name: '아이패드 프로', price: 1500000 },
];

const basicCardPaymentMethod = {
  label: '카드 결제',
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    supportedTypes: ['credit', 'debit'],
  },
};
const googlePayPaymentMethod = {
  label: 'Google Pay',
  supportedMethods: 'https://google.com/pay',
  data: {
    environment: 'TEST',
    apiVersion: 1,
    allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD'],
    paymentMethodTokenizationParameters: {
      tokenizationType: 'PAYMENT_GATEWAY',
      // Check with your payment gateway on the parameters to pass.
      parameters: {}
    },
    cardRequirements: {
      allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
      billingAddressRequired: true,
      billingAddressFormat: 'MIN'
    },
    phoneNumberRequired: true,
    emailRequired: true,
    shippingAddressRequired: true
  },
};
const applePayPaymentMethod = {
  label: 'Apple Pay',
  supportedMethods: 'https://apple.com/apple-pay',
  data: {
    version: 3,
    merchantIdentifier: 'merchant.com.example',
    merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
    countryCode: 'US',
  },
};
const myOwnPaymentMethod = {
  label: 'Sanghyeon Pay',
  supportedMethods: 'https://web-payments-playground.now.sh/api/pay',
};
const bobPayPaymentMethod = {
  label: 'Bob Pay',
  supportedMethods: 'https://bobpay.xyz/pay',
};
const allPaymentMethods = [
  myOwnPaymentMethod,
  bobPayPaymentMethod,
  googlePayPaymentMethod,
  applePayPaymentMethod,
  basicCardPaymentMethod,
];

export default function App() {
  const [selectedItemMap, setSelectedItemMap] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [discountChecked, setDiscountChecked] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(allPaymentMethods);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
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

  function computeDiscountPrice() {
    return discountChecked ? (computeTotalPrice() * -0.1) : 0;
  }

  async function handlePaymentClick() {
    if (!window.PaymentRequest) {
      window.alert('This browser does not support Payment Request API');
    }

    const paymentRequest = makePaymentRequest();

    try {
      const paymentResponse = await paymentRequest.show();

      try {
        const apiResponse = await fetch('/api/pay', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentResponse.toJSON())
        });
        const paymentResult = await apiResponse.json();

        if (paymentResult.success) {
          await paymentResponse.complete('success');
          setReceipt(paymentResponse);
        } else {
          await paymentResponse.complete('fail');
        }
      } catch (error) {
        console.error(error);
        paymentResponse.complete('fail');
      }
      
    } catch (error) {
      console.error('failed to request the payment', error);
    }
  }

  function makePaymentDetails() {
    const displayItems = selectedItems.map(item => ({
      label: item.name,
      amount: { currency: 'KRW', value : item.price },
    }));

    if (discountChecked) {
      displayItems.push({
        label: '쿠폰 할인 (10%)',
        amount: { currency: 'KRW', value : computeDiscountPrice() },
      });
    }

    return {
      displayItems,
      total:  {
        label: 'Total',
        amount: { currency: 'KRW', value: computeTotalPrice() + computeDiscountPrice() },
      },
      shippingOptions: [
        {
          id: 'economy',
          label: '일반 배송 (2 ~ 3일)',
          amount: { currency: 'KRW', value: 0 },
        },
        {
          id: 'same-day',
          label: '당일 배송',
          amount: { currency: 'KRW', value: 2500 },
        },
      ],
    };
  }

  function makePaymentRequest() {
    const details = makePaymentDetails();
    const options = {
      requestShipping: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestPayerName: true,
    };
    const request = new PaymentRequest(
      paymentMethods.filter(method => method.supportedMethods === selectedPaymentMethod),
      details,
      options
    );

    request.addEventListener('shippingaddresschange', event => {
      event.updateWith({
        ...details
      });
    });

    request.addEventListener('shippingoptionchange', event => {
      const { shippingOption } = event.target;
      const details = makePaymentDetails();
      const shipppingOptionsWithSelected = details.shippingOptions.map(option => ({
        ...option,
        selected: option.id === shippingOption,
      }));
      const selectedShippingOption = shipppingOptionsWithSelected.find(option => option.selected);
      let total = { ...details.total };
      let displayItems = [...details.displayItems];

      total.amount.value += selectedShippingOption.amount.value;
      displayItems.push({
        label: selectedShippingOption.label,
        amount: selectedShippingOption.amount,
      });

      event.updateWith({
        total,
        displayItems,
        shippingOptions: shipppingOptionsWithSelected,
      });
    });
  
    return request;
  }

  function handleDiscount(event) {
    setDiscountChecked(event.target.checked);
  }

  function handlePaymentMethodChange(event) {
    setSelectedPaymentMethod(event.target.value);
  }

  useEffect(() => {
    async function filterAvailableMethods() {
      const filteredPaymentMethods = [];
      const detailPlaceholder = {
        total: {
          label: 'total',
          amount: { currency: 'KRW', value: 0 }
        },
      };

      for (let method of paymentMethods) {
        let request = new PaymentRequest([method], detailPlaceholder);

        try {
          const canMake = await request.canMakePayment();

          if (canMake) {
            filteredPaymentMethods.push(method);
          } else {
            console.log(method.label, ' is not supported');
          }
        } catch (error) {
          console.log(method.label, ' is not supported: ', error);
        } finally {
          request = null;
        }
      }

      setPaymentMethods(filteredPaymentMethods);
    }

    filterAvailableMethods();
  }, []);

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
                <p className="item-price"><strong>{item.price.toLocaleString()} 원</strong></p>
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
            <li key={item.id} className="item">
              <h3>{item.name}</h3> 
              <div className="item-option">{item.price.toLocaleString()} 원</div>
            </li>
          ))}
        </ul>
        <label className="coupon"><input type="checkbox" value={discountChecked} onChange={handleDiscount} /> 10% 할인 쿠폰 적용</label>
        <h3 className="total-price">
          총 {(computeTotalPrice() + computeDiscountPrice()).toLocaleString()} 원
        </h3>

        <section className="methods">
          <fieldset>
            <legend>결제 방식</legend>
            <form>
              {paymentMethods.map(method => (
                <label key={method.label}>
                  <input 
                    type="radio"
                    checked={method.supportedMethods === selectedPaymentMethod} 
                    name="payment-method"
                    value={method.supportedMethods}
                    onChange={handlePaymentMethodChange} 
                  /> 
                  {method.label}
                </label>
              ))}
            </form>
          </fieldset>
        </section>
        
        <div className="navigation">
          <button onClick={handlePaymentClick}>결제하기</button>
          <a href="#shop">취소</a>
        </div>
      </section>

      <section id="receipt" className="receipt page">
        {receipt && (
          <>
            <h3>결제가 완료되었습니다.</h3>
            <pre>{JSON.stringify(receipt, null, 2)}</pre>
          </>
        )}
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

        .payment {
          text-align: right;
        }

        .coupon, .total-price {
          margin-top: 10px;
          padding-right: 20px;
        }

        .methods {
          text-align: left;
        }

        .methods label {
          display: block;
          margin-bottom: 10px;
        }

        .methods input[type="radio"] {
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
}
