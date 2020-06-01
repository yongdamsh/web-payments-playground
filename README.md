# Web Payments

Payment Request API를 비롯해 결제 수단을 연동하는 표준 스펙을 살펴보고 예제 어플리케이션을 작성하는 과정을 기록합니다.


## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
- [결제 프로세스 동작 방식](#%EA%B2%B0%EC%A0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D)
- [API 살펴보기](#api-%EC%82%B4%ED%8E%B4%EB%B3%B4%EA%B8%B0)
  - [Payment Request API](#payment-request-api)
    - [Payment Methods](#payment-methods)
    - [Payment Details](#payment-details)
    - [Payment Options](#payment-options)
    - [미지원 항목](#%EB%AF%B8%EC%A7%80%EC%9B%90-%ED%95%AD%EB%AA%A9)
      - [환불](#%ED%99%98%EB%B6%88)
      - [요금 정합성 검증](#%EC%9A%94%EA%B8%88-%EC%A0%95%ED%95%A9%EC%84%B1-%EA%B2%80%EC%A6%9D)
  - [Payment Handler API](#payment-handler-api)
- [사용 사례](#%EC%82%AC%EC%9A%A9-%EC%82%AC%EB%A1%80)
  - [Google Pay](#google-pay)
  - [Apple Pay](#apple-pay)
  - [Samsung Pay (X)](#samsung-pay-x)
  - [BobPay (Sample Payment App)](#bobpay-sample-payment-app)
  - [My Own Payment App](#my-own-payment-app)
- [Developing My Own Payment App](#developing-my-own-payment-app)
- [더 알아보기](#%EB%8D%94-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0)
  - [Autofill](#autofill)
  - [Polyfill](#polyfill)
  - [안드로이드 결제 앱 개발 가이드](#%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EA%B2%B0%EC%A0%9C-%EC%95%B1-%EA%B0%9C%EB%B0%9C-%EA%B0%80%EC%9D%B4%EB%93%9C)
  - [UX Considerations](#ux-considerations)
- [참고 자료](#%EC%B0%B8%EA%B3%A0-%EC%9E%90%EB%A3%8C)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

> ℹ️ 문서 작성 기준 및 개발 환경
> - [W3C Candidate Recommendation 12 December 2019 스펙](https://www.w3.org/TR/2019/CR-payment-request-20191212/)을 기준으로 조사된 내용입니다.
> - 예제 코드는 Chrome browser를 기준으로 테스트 했습니다. 브라우저 지원 현황은 [여기](https://caniuse.com/#feat=payment-request)에서 확인하세요.
> - Payment Request API는 HTTPS 서버에서만 동작합니다. 로컬에서 테스트하려면 [ngrok](https://ngrok.com/)과 같은 도구를 활용하세요.
> - 예제 코드는 빠른 프로토타이핑과 배포를 위해 [Next.js](https://nextjs.org/)와 [Vercel](https://vercel.com/)로 작성했습니다.



# Overview

온라인 결제는 UX의 영향을 많이 받는 편입니다. 어떤 사이트는 클릭 한두번으로 결제가 완료될만큼 간편한 반면 어떤 사이트는 결제 양식을 입력하고, PG(Payment Gateway)사 페이지를 오고 가며 번거로운 절차를 거쳐야 합니다. 아직은 후자에 속하는 사이트가 더 많을 것이라 생각합니다. 특히 [모바일 환경에서는 구매를 중도 포기하는 비중](https://developers.google.com/web/fundamentals/payments)이 데스크탑보다 2배가 높다고 하네요.


> This specification standardizes an API to allow merchants (i.e. web sites selling physical or digital goods) to utilize one or more payment methods with minimal integration. User agents (e.g., browsers) facilitate the payment flow between merchant and user.  
> \- Abstract in https://www.w3.org/TR/payment-request/

이러한 환경을 개선하기 위해 [Payment Request API](https://www.w3.org/TR/payment-request/)를 비롯한 Web Payments 명세가 개발되고 있습니다. 구매 양식 작성를 포함한 결제 프로세스의 사용자 워크플로를 향상시키는 다중 브라우저(cross-browser) 지원 표준입니다.
2019-12-12 기준 W3C Candidate Recommendation 상태로 크롬, 사파리의 데스크탑/모바일 버전을 비롯한 모던 브라우저에서 지원 중입니다. 다만 연동 가능한 결제 방식의 차이가 있고, 크롬 안드로이드 버전에서 가장 폭넓게 지원하고 있습니다.

Payment Request API는 새로운 결제 방법이 아니고, 프로세스 계층에 해당됩니다. 아래와 같은 [목표](https://developers.google.com/web/fundamentals/payments)를 가지고 있습니다.

- 브라우저가 판매자, 사용자 및 결제 방법 사이에서 중재자 역할을 하도록 지원
- 결제 커뮤니케이션 흐름을 최대한 표준화
- 다양한 보안 결제 방법을 원활하게 지원
- 모든 브라우저, 기기 또는 플랫폼(모바일 또는 기타)에서 작동

그러면 Payment Request API가 포함된 결제 프로세스는 어떤 방식으로 동작하는지 알아보도록 하겠습니다.


# 결제 프로세스 동작 방식

프로세스 동작을 이해하기 위해 [Web Payments의 구성 요소](https://developers.google.com/web/fundamentals/payments/basics/how-payment-ecosystem-works#the_anatomy_of_web_payments)를 먼저 살펴보시면 더 도움이 됩니다.

![Payment Request API 기반의 결제 프로세스](https://developers.google.com/web/fundamentals/payments/images/payment-ecosystem/payment-interactions.png)
출처: [How the Payment Request Process Works](https://developers.google.com/web/fundamentals/payments/basics/how-payment-ecosystem-works#how_the_payment_request_process_works)

(1) 구매자가 판매자의 웹사이트에 방문해 상품을 선택하고 구매를 시작합니다.  
(2) 판매자는 구매자에게 결제 정보(금액, 가능한 결제 방식 등)와 입력 양식(결제 수단, 배송 주소, 연락처 등)을 Payment Request API를 통해 제공합니다.
(3) 구매자는 결제 방식을 선택합니다. 일반 신용 카드 또는 Pay 앱이 될 수 있습니다. 각 결제 방식은 [Payment Handler API](https://www.w3.org/TR/payment-handler/)라는 표준을 따릅니다.  
(4) 판매자는 구매자의 결제 정보를 전달 받아 PSP(Payment Service Provider)를 통해 검증합니다.  
(5) PSP는 결제를 진행하고, 처리 결과를 판매자 웹사이트에 전달합니다.  
(6) 판매자는 결제 결과에 따른 UI를 제공해 구매자에 알립니다.

> 결제 카드 정보는 [PCI DSS](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard)라는 보안 표준을 따라야 합니다. 이 표준을 만족하려면 큰 비용과 어려움이 따르기 때문에 일반적으로 판매자는 결제 처리 역할을 PSP(또는 PG)에 위임하게 됩니다.  
> 또한 `basic-card` 결제 방식은 카드 번호가 노출되기 때문에 [PCI SAQ A-EP](https://www.pcisecuritystandards.org/documents/PCI-DSS-v3_2-SAQ-A_EP.pdf) 라는 표준을 준수해야 합니다. 필요할 경우 [Stripe](https://stripe.com/docs/stripe-js/elements/payment-request-button)와 같은 PSP에서 제공되는 자바스크립트 SDK를 사용할 수 있습니다.

이제 위 결제 프로세스의 각 단계를 API 명세와 함께 살펴 보겠습니다.


# API 살펴보기

## Payment Request API

Payment Request API는 결제 프로세스의 (1), (2), (6) 단계를 담당합니다.

구매자가 '구매' 버튼을 누르는 시점에 아래와 같이 3개의 파라미터로 결제 프로세스 인스턴스를 생성할 수 있습니다.

```js
const request = new PaymentRequest(
  paymentMethods, // 결제 방식
  paymendDetails, // 결제 금액
  paymentOptions, // 추가 고객 정보 (배송 여부, 이메일, 휴대폰, 성명 등)
);
```

### Payment Methods

![Payment Methods](https://developers.google.com/web/fundamentals/payments/images/payment-method-basics/payment-methods.png)  
출처: [payment-method-basics](https://developers.google.com/web/fundamentals/payments/basics/payment-method-basics#payment_methods)


판매자가 제공하는 결제 방식의 목록을 설정합니다. 일반 카드, 페이 서비스, 또는 자체 구축 서비스가 될 수도 있습니다.

```js
const paymentMethods = [
  {
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard'],
      supportedTypes: ['debit', 'credit'],
    },
  },
  {
    supportedMethods: 'https://google.com/pay',
    data: { ... }, // 해당 결제 방식에 전달되는 추가 정보
  },
  {
    supportedMethods: 'https://my-own-server.com/pay',
  }
];
```

브라우저 또는 플랫폼 환경에 따른 결제 방식 지원 여부를 미리 확인해 볼 수 있습니다. 결제가 가능한 경우 `show()` 메서드를 호출해 결제 정보 및 입력 양식 UI를 제공합니다.

```js
const canMakePayment = await request.canMakePayment();

if (!canMakePayment) {
  // 기존 결제 사이트로 리다이렉트 등의 처리가 필요함
  return;
}

await request.show();
```

`show()` 메서드를 호출하면 아래와 같은 UI가 제공됩니다.

| Desktop | Mobile (Android) |
| -- | -- |
| ![Request UI for Desktop](/docs/images/request_ui_desktop.png) | ![Request UI for Android](/docs/images/request_ui_android.jpg) |

`show()` 메서드는 Promise를 반환하고, 구매자의 선택에 따라 입력된 구매 정보 또는 에러를 전달합니다.

```js
try {
  const paymentResponse = await request.show();
  const {
    details,
    methodName,
    payerEmail,
    payerName,
    payerPhone,
    requestId,
    shippingAddress,
    shippingOption,
  } = paymentResponse;

  // 결제 프로세스의 (4), (5) 항목. 구매 정보를 PSP로 전송 및 검증
  const result = await verifyWithServer(paymentResponse);
  
  paymentResponse.complete(result ? 'success': 'fail');

  // 검증 간에 제공되는 브라우저 UI를 닫고 자체 플로우 처리를 하려면 파라미터를 빈 값으로 호출한다.
  // paymentResponse.complete();
} catch (error) {
  // SecurityError, AbortError, NotSupportedError, or InvalidStateError
}
```

### Payment Details

총 금액, 상세 금액, 배송 옵션 등의 정보를 설정합니다.

```js
const paymentDetails = {
  total:  {
    label: '총 금액',
    amount: { currency: 'KRW', value: 9900 },
  },
  displayItems: [
    {
      label: '소계',
      amount: { currency: 'KRW', value: 12400 },
    },
    {
      label: '배송비',
      amount: { currency: 'KRW', value: -2500 },
      pending: true, // 구매자의 옵션 선택에 따라 달라질 수 있는 항목
    },
  ],
  shippingOptions: [
    {
      id: 'economy',
      label: '일반 배송 (2 ~ 3일)',
      amount: { currency: 'KRW', value: 0 },
    },
    {
      id: 'same-day',
      label: '당일 배송',
      amount: { currency: 'KRW', value: '2500' },
    },
  ],
}
```

구매자의 배송 주소 또는 배송 옵션 변경 시, 이벤트로 변경된 정보를 구독하고 `event.updateWith` 메서드로 정보를 갱신해야 합니다. 이벤트 구독은 `request.show()` 호출 전에 이뤄져야 합니다.

- 배송 주소 변경: [`shippingaddresschange` event](https://developers.google.com/web/fundamentals/payments/merchant-guide/deep-dive-into-payment-request#handling_shipping_address_changes)
- 배송 옵션 변경: [`shippingoptionchange` event](https://developers.google.com/web/fundamentals/payments/merchant-guide/deep-dive-into-payment-request#handling_shipping_options_changes)

```js
request.addEventListener('shippingaddresschange', event => {
  const paymentDetails = {
      total: { ... },
      shippingOptions: [
        // 변경된 주소에 따라 선택 가능한 배송 옵션
        // 빈 배열을 전달할 경우 선택 가능한 배송 옵션이 없다는 문구 제공
      ],
    };
    event.updateWith(paymentDetails);
});

request.addEventListener('shippingoptionchange', event => {
  // 선택된 배송 옵션에 따라 변경된 요금 정보 갱신
  const { shippingOption } = event.target;
  const { total, displayItems } = calculateNewPrice(shippingOption);
  const shippingOptions = getShippingOptionsWithSelected(shippingOptions); // 선택된 배송 옵션의 `selected` flag를 true로 설정한 목록

  event.updateWith({
    total,
    displayItems,
    shippingOptions,
  });
});
```


### Payment Options

입력 필드 제공 여부를 선택하는 flag 값들로 구성됩니다.

```js
const paymentOptions = {
  requestPayerName: true, // 구매자 이름
  requestPayerEmail: true, // 구매자 이메일
  requestPayerPhone: true, // 구매자 휴대폰
  requestShipping: true, // 배송지 정보
  shippingType: 'shipping' || 'delevery' || 'pickup', // 배송 타입
}
```

### [미지원 항목](https://developers.google.com/web/fundamentals/payments#details-parameter)

#### 환불
Payment Request API 명세에서 환불 프로세스는 지원하지 않습니다. 따라서 `paymentRequest` 인스턴스 생성 시 전달하는 `paymentDetails` 항목 중 [전체 금액(total)은 0 미만이 될 수 없습니다](https://www.w3.org/TR/payment-request/#dom-paymentdetailsinit). 이 경우 에러를 전달 받게 됩니다.


#### 요금 정합성 검증
총 요금(total)과 세부 내역(displayItems) 간의 정합성 검증은 개발자의 역할입니다. 





## Payment Handler API

결제 프로세스의 (3) 항목에 해당됩니다.




# 사용 사례
- https://developers.google.com/web/updates/2018/06/payment-handler-api

## Google Pay
## Apple Pay
## Samsung Pay (X)
## BobPay (Sample Payment App)
## My Own Payment App





# Developing My Own Payment App
- 자체 결제 서비스 구현 과정을 설명하자



# 더 알아보기

## Autofill
- 결제 양식을 저장해두고 재사용하는 방법
  
## Polyfill
- 기본 polyfill, 애플 페이 wrapper

## 안드로이드 결제 앱 개발 가이드
- 네이티브 앱 개발 시 참고

## UX Considerations




# 참고 자료

- Google Web Fundamentals Payment Request API: https://developers.google.com/web/fundamentals/payments
- W3C Payment Request API: https://www.w3.org/TR/payment-request/
- W3C Payment Handler API: https://www.w3.org/TR/payment-handler/
- MDN Payment Request API: https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API
- Payment Handler API: 