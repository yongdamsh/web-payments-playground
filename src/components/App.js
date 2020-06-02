import { useState, useEffect } from 'react';

const items = [
  { id: 1, name: '삼다수 2L × 6개', price: 4900 },
  { id: 2, name: '에어팟 프로', price: 300000 },
  { id: 3, name: '아이패드 프로', price: 1500000 },
];

const basicCardPaymentMethod = {
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    supportedTypes: ['credit', 'debit'],
  },
};
const googlePayPaymentMethod = {
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
  supportedMethods: 'https://web-payments-playground.now.sh/api/pay',
};
const bobPayPaymentMethod = {
  supportedMethods: 'https://bobpay.xyz/pay',
};

export default function App() {
  const [selectedItemMap, setSelectedItemMap] = useState({});
  const [receipt, setReceipt] = useState();
  const [discountChecked, setDiscountChecked] = useState(false);
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
        amount: { currency: 'KRW', value : computeTotalPrice() + computeDiscountPrice() },
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
    const methodData = [
      // bobPayPaymentMethod,
      // myOwnPaymentMethod,
      // googlePayPaymentMethod,
      // applePayPaymentMethod,
      basicCardPaymentMethod,
    ];
    const details = makePaymentDetails();
    const options = {
      requestShipping: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestPayerName: true,
    };
    const request = new PaymentRequest(
      methodData,
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
        
        <div className="navigation">
          <button onClick={handlePaymentClick}>결제하기</button>
          <a href="#shop">취소</a>
        </div>
      </section>

      <section id="receipt" className="receipt page">
        <h3>결제가 완료되었습니다.</h3>
        <pre>{JSON.stringify(receipt, null, 2)}</pre>
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
      `}</style>
    </div>
  );
}
