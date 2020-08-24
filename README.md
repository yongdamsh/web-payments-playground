# Web Payments

Payment Request API를 비롯해 결제 수단을 연동하는 표준 명세와 개발 현황을 살펴보고 테스트를 위한 [예제 앱](https://web-payments-playground.now.sh/)을 제공합니다.


## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
  - [What is Payment Request API?](#what-is-payment-request-api)
- [결제 프로세스 동작 방식](#%EA%B2%B0%EC%A0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D)
- [API 살펴보기](#api-%EC%82%B4%ED%8E%B4%EB%B3%B4%EA%B8%B0)
  - [Payment Request API](#payment-request-api)
    - [Payment Methods](#payment-methods)
    - [Payment Details](#payment-details)
    - [Payment Options](#payment-options)
    - [미지원 항목](#%EB%AF%B8%EC%A7%80%EC%9B%90-%ED%95%AD%EB%AA%A9)
  - [Payment Handler API](#payment-handler-api)
- [사용 사례](#%EC%82%AC%EC%9A%A9-%EC%82%AC%EB%A1%80)
  - [Google Pay](#google-pay)
  - [Apple Pay](#apple-pay)
  - [Samsung Pay](#samsung-pay)
  - [BobPay (Sample Payment App)](#bobpay-sample-payment-app)
  - [Developing My Own Payment App](#developing-my-own-payment-app)
    - [Payment Method Manifest](#payment-method-manifest)
    - [Service Worker](#service-worker)
    - [Checkout UI](#checkout-ui)
- [The Benefit of Web Payments](#the-benefit-of-web-payments)
  - [더 나은 UX & DX](#%EB%8D%94-%EB%82%98%EC%9D%80-ux--dx)
  - [기존 접근 방식과의 비교](#%EA%B8%B0%EC%A1%B4-%EC%A0%91%EA%B7%BC-%EB%B0%A9%EC%8B%9D%EA%B3%BC%EC%9D%98-%EB%B9%84%EA%B5%90)
- [What's New](#whats-new)
  - [Deprecation of the 'Basic Card' Method](#deprecation-of-the-basic-card-method)
  - [Skip-the-sheet](#skip-the-sheet)
    - [Skip-the-sheet 적용 여부에 따른 UI 비교 영상](#skip-the-sheet-%EC%A0%81%EC%9A%A9-%EC%97%AC%EB%B6%80%EC%97%90-%EB%94%B0%EB%A5%B8-ui-%EB%B9%84%EA%B5%90-%EC%98%81%EC%83%81)
  - [Delegation](#delegation)
  - [Just-In-Time(JIT) Installation](#just-in-timejit-installation)
- [What's Next](#whats-next)
  - [Security, Privacy, and Easy Authentication](#security-privacy-and-easy-authentication)
    - [WebAuthn Support](#webauthn-support)
    - [Credential Management API Support](#credential-management-api-support)
    - [WebOTP Support](#webotp-support)
  - [Real World Integrations](#real-world-integrations)
- [더 알아보기](#%EB%8D%94-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0)
  - [Autofill](#autofill)
  - [UX Considerations](#ux-considerations)
  - [안드로이드 결제 앱 개발 가이드](#%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EA%B2%B0%EC%A0%9C-%EC%95%B1-%EA%B0%9C%EB%B0%9C-%EA%B0%80%EC%9D%B4%EB%93%9C)
  - [보완 도구](#%EB%B3%B4%EC%99%84-%EB%8F%84%EA%B5%AC)
- [참고 자료](#%EC%B0%B8%EA%B3%A0-%EC%9E%90%EB%A3%8C)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

> ℹ️ 문서 작성 기준 및 개발 환경
> - [W3C Editor's Draft 04 August 2020 명세](https://w3c.github.io/payment-request/)를 기준으로 조사된 내용입니다.
> - 예제 코드는 Chrome 브라우저를 기준으로 테스트 했습니다. 브라우저 지원 현황은 [여기](https://caniuse.com/payment-request)에서 확인하세요.
> - Payment Request API는 HTTPS 서버에서만 동작합니다. 로컬에서 테스트하려면 [ngrok](https://ngrok.com/)과 같은 도구를 활용하세요.
> - 예제 코드는 빠른 프로토타이핑과 배포를 위해 [Next.js](https://nextjs.org/)와 [Vercel](https://vercel.com/)로 작성했습니다.



# Overview

온라인 결제는 UX의 영향을 많이 받는 편입니다. 어떤 사이트는 클릭 한두번으로 결제가 완료될만큼 간편한 반면 어떤 사이트는 결제 양식을 입력하고, PG(Payment Gateway)사 페이지를 오고 가며 번거로운 절차를 거쳐야 합니다. 아직은 후자에 속하는 사이트가 더 많을 것이라 생각합니다. 특히 [모바일 환경에서는 구매를 중도 포기하는 비중](https://developers.google.com/web/fundamentals/payments)이 데스크탑보다 2배가 높다고 하네요.

## What is Payment Request API?

> This specification standardizes an API to allow merchants (i.e. web sites selling physical or digital goods) to utilize one or more payment methods with minimal integration. User agents (e.g., browsers) facilitate the payment flow between merchant and user.  
> \- Abstract in https://www.w3.org/TR/payment-request/


이러한 환경을 개선하기 위해 [Payment Request API](https://www.w3.org/TR/payment-request/)를 비롯한 Web Payments 명세가 개발되고 있습니다. 구매 양식 작성를 포함한 결제 프로세스의 사용자 워크플로를 향상시키는 다중 브라우저(cross-browser) 지원 표준입니다.  

2020-08-04 기준으로 크롬, 사파리의 데스크탑/모바일 버전을 비롯한 모던 브라우저에서 지원 중입니다. 다만 연동 가능한 결제 방식의 차이가 있고, Google Pay, Apple Pay 등 자체 페이먼트 서비스를 갖춘 벤더에서 보다 적극적으로 지원하고 있습니다. 

>Web Payments를 구성하는 각 파트에 관한 지원 현황은 [이 링크](https://web.dev/registering-a-web-based-payment-app/#browser-support)를 참고하세요.

![Can I use Payment Request API](https://caniuse.bitsofco.de/image/payment-request.png)



Payment Request API는 새로운 결제 방법이 아닌 프로세스 계층에 해당됩니다. 아래와 같은 [목표](https://developers.google.com/web/fundamentals/payments)를 가지고 있습니다.

- 브라우저가 판매자, 사용자 및 결제 방법 사이에서 중재자 역할을 하도록 지원
- 결제 커뮤니케이션 흐름을 최대한 표준화
- 다양한 보안 결제 방법을 원활하게 지원
- 모든 브라우저, 기기 또는 플랫폼(모바일 또는 기타)에서 작동

그러면 Payment Request API가 포함된 결제 프로세스는 어떤 방식으로 동작하는지 알아보도록 하겠습니다.


# 결제 프로세스 동작 방식

프로세스 동작을 이해하기 위해 [Web Payments의 구성 요소](https://developers.google.com/web/fundamentals/payments/basics/how-payment-ecosystem-works#how_the_payment_request_process_works)를 먼저 살펴보시면 더 도움이 됩니다.

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

## [Payment Request API](https://w3c.github.io/payment-handler)

Payment Request API는 결제 프로세스의 (1), (2), (6) 단계를 담당합니다.

구매자가 '구매' 버튼을 누르는 시점에 아래와 같이 3개의 파라미터로 결제 프로세스 인스턴스를 생성할 수 있습니다.

```js
const request = new PaymentRequest(
  paymentMethods, // 결제 방식
  paymendDetails, // 결제 금액, 배송 옵션
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
  
  paymentResponse.complete(result.success ? 'success': 'fail');

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
      amount: { currency: 'KRW', value: 2500 },
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

변경된 주소, 배송 옵션에 대해 서버 검증이 필요할 경우 `event.updateWith`에 객체 대신 Promise를 넘겨줄 수 있습니다.


### Payment Options

입력 필드 제공 여부를 선택하는 flag 값들로 구성됩니다.

```js
const paymentOptions = {
  requestPayerName: true, // 구매자 이름
  requestPayerEmail: true, // 구매자 이메일
  requestPayerPhone: true, // 구매자 휴대폰
  requestShipping: true, // 배송지 정보
  shippingType: 'shipping' || 'delevery' || 'pickup', // 배송 타입
};
```

### [미지원 항목](https://developers.google.com/web/fundamentals/payments#details-parameter)

- 환불:  
Payment Request API 명세에서 환불 프로세스는 지원하지 않습니다. 따라서 `paymentRequest` 인스턴스 생성 시 전달하는 `paymentDetails` 항목 중 [전체 금액(total)은 0 미만이 될 수 없습니다](https://www.w3.org/TR/payment-request/#dom-paymentdetailsinit). 이 경우 에러를 전달 받게 됩니다.
음수 값 지원에 관한 명세 논의는 [이 이슈](https://github.com/w3c/payment-request/issues/119)를 참고하세요.


- 요금 정합성 검증:  
총 요금(total)과 세부 내역(displayItems) 간의 [정합성 검증은 개발자의 역할](https://www.w3.org/TR/payment-request/#paymentdetailsbase-dictionary)입니다. 

- 다수의 상세 금액 항목:    
브라우저 기본 UI에서 상세 금액 목록(`displayItem`) 개수가 많을 때 [스크롤이 지원되지 않습니다](https://developers.google.com/web/fundamentals/payments/merchant-guide/deep-dive-into-payment-request#transaction_details_display_items). 따라서 소계(subtotal), 할인 정보, 배송비, 부가세 정도로 요약하는 것이 좋습니다.



## [Payment Handler API](https://w3c.github.io/payment-handler/)

Payment Handler API는 웹사이트가 결제 처리 역할을 할 수 있도록 하는 새로운 표준입니다. [결제 프로세스](#%EA%B2%B0%EC%A0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D)의 (3) 항목에 해당됩니다.

이 과정을 좀 더 상세히 그리면 아래와 같습니다.

![flow_diagram](https://developers.google.com/web/fundamentals/payments/images/web-payment-apps/payment-handler-flow.png)  
출처: [Web based payment apps developer guide](https://developers.google.com/web/fundamentals/payments/payment-apps-developer-guide/web-payment-apps)

Payment Handler API는 설치된 service worker를 통해 구매 요청 이벤트(`paymentrequest`)를 받아 결제 앱 UI를 제공합니다.

서버가 Payment Handler로 동작하려면 아래의 몇가지 설정이 필요합니다.

1. 원하는 URL based payment method 경로로 `GET` 또는 `HEAD` 요청을 하면 Link 헤더로 [payment method manifest](https://w3c.github.io/payment-method-manifest/) 파일의 위치를 알려줘야 합니다.
  ```
    HTTP/1.1 204 No Content
    Link: <https://web-payments-playground.now.sh/p/payment_method_manifest.json>; rel="payment-method-manifest"
  ```
2. Payment method manifest 파일에는 결제 앱 호스팅되고 있는 web app manifest URL과 payment method를 사용할 수 있는 서드파티 목록을 정의할 수 있습니다.
  ```
    {
      "default_applications": ["https://web-payments-playground.now.sh/p/web_manifest.json"],
      "supported_origins": ["https://web-payments-playground.now.sh"]
    }
  ```
3. `default_applications`으로 정의된 manifest 파일을 통해 앱 이름, 아이콘, service worker 등의 정보를 [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 형태로 제공합니다. 결제 앱은 [PWA(Progressive Web App)](https://developers.google.com/web/progressive-web-apps)과 유사한 방식으로 동작합니다.

4. Service worker 설치를 위한 스크립트를 추가합니다.  
https://developers.google.com/web/fundamentals/payments/payment-apps-developer-guide/web-payment-apps

5. 결제 요청을 받아 결제 앱 UI를 제공할 수 있도록 service worker 스크립트를 작성합니다.  
https://developers.google.com/web/fundamentals/payments/payment-apps-developer-guide/web-payment-apps#write_a_service_worker

6. Service worker와 상호 작용하기 위한 웹페이지 단의 스크립트를 작성합니다.  
https://developers.google.com/web/fundamentals/payments/payment-apps-developer-guide/web-payment-apps#write_frontend_code

이러한 과정을 통해 [결제 앱](#developing-my-own-payment-app)을 직접 만들 수 있습니다. 



# 사용 사례

Payment method는 크게 두가지 형태로 나뉘며 [PMIs(Payment method identifiers)](https://www.w3.org/TR/payment-method-id/) 명세를 따릅니다.

1. Standardized: W3C에서 표준으로 정한 결제 방식입니다. 현재는 [`basic-card`](https://www.w3.org/TR/payment-method-basic-card/) 방식이 지원되고 있습니다.


2. URL-based: HTTPS 기반의 URL로 정의되며, 누구나 결제 앱을 개발하고 Payment Request API를 통해 제공할 수 있도록 생태계를 확장하는 역할을 합니다.



아래의 서비스는 URL-based payment method로 정의된 항목입니다.

## Google Pay
https://developers.google.com/pay/api/web/overview

## Apple Pay 
https://developer.apple.com/documentation/apple_pay_on_the_web

## Samsung Pay
https://developer.samsung.com/internet/android/web-payments-integration-guide.html

## BobPay (Sample Payment App)
https://bobpay.xyz/

직접 결제 앱을 만들 때 참고할 수 있는 레퍼런스 앱입니다. 사이트를 방문해 앱을 설치한 뒤 아래와 같이 payment method를 정의하면 해당 앱의 결제 프로세스를 체험할 수 있습니다.

```js
const paymentMethods = [
  {
    supportedMethods: 'https://bobpay.xyz/pay',
  },
  ...otherMethods,
];
```

## Developing My Own Payment App

Web Payments 기반의 결제 앱을 직접 개발할 수 있습니다. 개발 방법은 네이티브(현재는 Android만 지원)와 웹 기반으로 구분됩니다. 여기선 웹 기반의 Web Payments 결제 앱 개발 방법을 살펴 봅니다. 네이티브 결제 앱 개발 방법은 [여기](https://web.dev/android-payment-apps-developers-guide/)를 참고하세요.

웹 기반 결제 앱을 개발하려면 크게 아래 세 가지 항목의 준비가 필요합니다.

### Payment Method Manifest

모든 URL-based 결제 앱은 JSON 형식의 manifest 파일을 호스팅합니다. 이 파일에는 기본 앱 정보(아이콘, 이름, Service worker 등)와 도메인 정보가 포함됩니다. 판매자 사이트에서는 [규약된 과정](#payment-handler-api)을 통해 manifest 파일을 탐색해 유효한 결제 앱인지 여부를 판별하고, 이 결과에 따라 해당 결제 앱(payement method)으로 구매 가능 여부가 결정됩니다.

### Service Worker

모든 웹 기반 결제 앱은 필수로 Service worker를 포함해야 합니다. Service worker는 [PWA(Progressive Web App)](https://web.dev/progressive-web-apps/)의 기술적 기반을 제공하는 이벤트 기반 스크립트이며, 브라우저의 백그라운드에서 실행됩니다. 결제 앱에서는 Service worker를 아래의 용도로 사용합니다.

- 모달 창을 열어 결제 UI를 제공
- 판매자 사이트와 결제 앱 간의 이벤트 송수신
- 구매 정보 입력 등 고객과의 인터랙션 처리

> Service worker의 동작 원리는 [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) 문서에 잘 설명되어 있습니다.

### Checkout UI

결제 UI는 Service worker를 통해 제공됩니다. [예제 코드](https://w3c.github.io/payment-handler/#post-example)와 같이 판매자 사이트로부터 `PaymentRequestEvent`를 전달 받으면 새 창을 열어 이벤트 기반의 통신을 시작합니다.

```js
self.addEventListener('paymentrequest', e => {
  e.respondWith(async () => {
    const client = await e.openWindow(CHECKOUT_URL);
    // ...
  });
})
```

`CHECKOUT_URL`을 통해 진입하는 페이지에서는 사용자를 인증하거나 결제 금액, 상품 정보를 표시합니다. [Delegation](#delegation)을 지원할 경우 배송, 고객 정보 입력을 위한 양식이 제공됩니다.




# The Benefit of Web Payments

## [더 나은 UX & DX](https://web.dev/empowering-payment-apps-with-web-payments/#the-benefits-of-integrating-web-payments-in-a-payment-app)

- In-context payments: 리디렉션이나 팝업 방식과 달리 모달 방식으로 제공되어 context 유지에 유리합니다. ([스크린샷](#deprecation-of-the-basic-card-method) 참고)

- Faster checkout: 브라우저나 결제 앱에 한번 저장된 결제 정보는 Web Payments를 지원하는 다른 판매 사이트에서도 활용되어 빠른 체크아웃이 가능합니다.

- Easy integation: 기존의 네이티브 또는 웹 기반 결제 앱과의 연동이 쉬운 편입니다. 표준 스펙을 기반으로 복잡한 연동 과정 없이 데이터 형식을 교환하고, 동적인 가격 업데이트가 가능합니다.



## [기존 접근 방식과의 비교](https://web.dev/empowering-payment-apps-with-web-payments/#comparing-web-payments-to-other-approaches)

웹 기반 결제의 기존 연동 방식은 크게 4가지로 구분됩니다.

- iframes: Using JavaScript to inject the payment handler's website in an iframe and collect the customer's payment credential through a form.
- Pop-ups: Using JavaScript to open a pop-up window and collect the customer's payment credentials, either through a form or by having the customer authenticate and select a payment credential.
- Redirects: Merchant redirects the customer to a payment handler's website and lets the customer authenticate and select payment credentials. The redirect URL is communicated via a server.
- OAuth: Merchant lets the customer authenticate and authorize with a payment handler's identity via OAuth, select a payment method, shipping address etc through in-context iframe UI.

<img width="829" alt="Comparing Web Payments" src="https://user-images.githubusercontent.com/4126644/90980266-48a6cc00-e595-11ea-9cf9-30cd54b5cc1b.png">

> TIP  
>
> iframe을 통해 Web Payments 기반의 페이지를 적용할 경우 [`allowpaymentrequest`](https://w3c.github.io/payment-request/#paymentrequest-and-iframe-elements) 속성을 추가해야 합니다.



# What's New

> web.dev LIVE 2020에서 발표된 [What's new in Web Payments](https://youtu.be/ZXmKKV7R72c?t=287) 영상을 참고했습니다.

주로 UX 개선을 위한 기능 추가 및 변경이 있었습니다. 이 중 최신 브라우저에 반영된 사항을 중심으로 살펴 보겠습니다.

## Deprecation of the 'Basic Card' Method

Web Payments의 신용카드 정보를 통한 결제 방식은 두 가지 측면에서 부족한 점이 있습니다.

1. 카드 정보를 입력하는 과정에서 사용자 경험이 떨어짐
2. 카드 번호 등의 정보가 노출되어 보안에 취약함

실제로 Mozilla는 2018부터 Web Payments 구현 과정에서 Basic card 지원을 제외하고 있고, Chrome 팀은 [이 공지](https://blog.chromium.org/2020/01/rethinking-payment-request-for-ios.html)를 통해 점진적인 Basic card의 지원 중단을 밝혔습니다. 

2018년에 Shopify에서 sheet가 사용자의 경험에 미치는 영향에 관해 분석한 [이 연구](https://engineering.shopify.com/blogs/engineering/shaping-the-future-of-payments-in-the-browser)도 Basic card의 단점을 뒷받침합니다. 여기서 sheet는 아래 스크린샷과 같이 PaymentRequest API 호출 시 브라우저에서 자체 제공되는 UI를 말합니다.

<img width="769" alt="Sheet for Web Payments" src="https://user-images.githubusercontent.com/4126644/90957654-f187f500-e4c9-11ea-8ad6-b97ce2c2fdfc.png">

출처: [Delegation + Skip the Sheet Flow](https://docs.google.com/document/d/1JH-IWDyvrSx70TDtmhvP-0F4Aob9Wz_oLh91U9kwTx0/edit#heading=h.k444qn6fjt5d)


Chrome 팀은 서드파티 앱으로의 연결성을 강화하기 위해 아래 두 기능을 추가해 sheet 노출의 최소화 방안을 제공하고 있습니다.


## Skip-the-sheet 

구매자의 선택이 불필요한 상황에서는 sheet UI를 건너 뛰어 구매 경험을 향상시키기 위한 기능입니다. 아래의 조건을 모두 만족할 경우 발동됩니다.

- `request.show()`(sheet UI를 열어 구매 플로우를 시작하는 메서드)가 고객의 제스처(클릭 이벤트 등)에 의해 호출되어야 한다.
- 판매자는 하나 이상의 [URL-based 결제 방식](#%EC%82%AC%EC%9A%A9-%EC%82%AC%EB%A1%80)을 요청해야 한다.
- 다음 항목을 충족하는 결제 방식이 **하나만 존재**해야 한다.
  - Payment Handler UI를 제공할 수 있어야 한다.
  - [구매자 정보(배송 옵션, 이름, 이메일, 휴대폰 번호)](https://w3c.github.io/payment-request/#dom-paymentoptions)를 [위임(delegation)](#delegation) 받을 수 있어야 한다.

### Skip-the-sheet 적용 여부에 따른 UX 비교 영상
- https://storage.googleapis.com/web-dev-assets/payments/without-skip-the-sheet.webm
- https://storage.googleapis.com/web-dev-assets/payments/skip-the-sheet.webm
- 출처: [Setting up a payment method](https://web.dev/setting-up-a-payment-method/#understanding-the-special-optimizations)


## Delegation

앞서 설명된 Skip-the-sheet의 조건 중 구매자 정보는 기본적으로 Payment Request UI에서 선택 및 입력이 가능합니다. Chrome 80 버전부터 Payment Handler를 지원하는 결제 앱에서 필요한 구매자 정보 입력을 위임 받을 수 있는 API가 추가됐습니다. 판매자 사이트에서 요청된 구매자 정보 항목을 결제 앱에서 위임 가능할 경우 Skip-the-sheet 조건을 충족하게 됩니다. 

위임 가능한 항목의 범위에 따라 Full delegation과 Partial delegation으로 구분됩니다.

- Payment Request API 호출 시 구매자 정보 요청

```js
const request = new PaymentRequest(
  paymentMethods,
  details,
  {
    requestShipping: true,
    requestPayerName: true,
    requestPayerEmail: true,
    requestPayerPhone: true,
  }
);
```

- Payment Handler API에서 위임 가능한 항목을 활성화

```js
async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register(
    'service-worker.js'
  );
  
  // Payment Handler 지원 여부
  if (!registration.paymentManager) {
    return;
  }

  // 위임 활성화 메서드 지원 여부
  if (!registration.paymentManager.enableDelegations) {
    return;
  }

  // https://github.com/yongdamsh/web-payments-playground/blob/49e7cb05e10d84854ea3bfae0f38ea3cf0e8d91f/src/pages/index.js#L27-L32
  registration.paymentManager.enableDelegations([
    'shippingAddress',
    'payerName',
    'payerEmail',
    'payerPhone',
  ]);
}
```


> Skip-the-sheet와 Delegation의 더 자세한 정보는 아래 링크를 참고하세요.  
> - 명세: https://bit.ly/PaymentRequestSkipTheSheet
> - Proposal: https://github.com/sahel-sh/shipping-contact-delegation/blob/master/Explainer.md

## Just-In-Time(JIT) Installation

Payment Handler는 결제 앱 도메인에 설치된 Service Worker를 기반으로 구동됩니다. 그리고 브라우저는 이러한 Service Worker 설치 여부를 통해 Payment Handler 기반의 결제 앱 작동 여부를 판별합니다.

JIT Installation은 결제에 필요한 Service Worker가 설치 가능한 상태인지만 확인해두고, 실제 구매 시점(구매자가 'Pay' 버튼을 누르는 시점)에 설치하도록 지원하는 기능입니다.

상세한 동작 방식은 [이 문서](https://docs.google.com/document/d/1bzhh14E1DuJGYrueFhg87decGwvpPQz7D9mLzW8Yif4/edit)를 참고하세요.


# What's Next

보안과 프라이버시를 강화하고, 다양한 연동으로 생태계를 확장하는 방향으로 발전 중입니다.

## Security, Privacy, and Easy Authentication

Payment Handler API를 갖춘 페이지에서 아래의 보안, 인증 관련 Web API와의 연동이 지원됩니다.

### [WebAuthn](https://w3c.github.io/webauthn/) Support

WebAuthn은 브라우저에서 비밀번호 없이 인증하기 위한 Web API의 명세로 FIDO(**F**ast **ID**entity **O**nline) 기반의 인증 메커니즘입니다. 정확히는 [FIDO 2.0](https://fidoalliance.org/specifications/)의 메인 컴포넌트 중 하나입니다. 이 명세를 통해 웹에서도 [생체 인증](https://youtu.be/ZXmKKV7R72c?t=369) 연동이 가능합니다.

지난 5월 Web Payments Working Group에서 개최한 code-a-thon에서 나온 아이디어의 [데모 영상](https://www.w3.org/2020/05/entersekt_consent2.mov)을 참고하세요.


### [Credential Management API](https://www.w3.org/TR/credential-management-1/) Support

Credential Management API는 브라우저의 비밀번호 관리자와 사이트 간의 인터페이스입니다. 이를 활용해 다양한 기기의 결제 앱에서 매끄러운 로그인이 가능합니다.

> Credential Management API에 관한 자세한 정보는 [이 문서](https://developers.google.com/web/fundamentals/security/credential-management/)를 참고하세요.

### [WebOTP](https://web.dev/web-otp/) Support

SMS를 통한 OTP 발송으로 사용자 휴대폰 번호를 보다 쉽게 인증하기 위한 API입니다.


## Real World Integrations

사용성을 높히기 위해 개발 중이거나 검토 중인 사항입니다.

### Digital Goods API

Web Payments와 Android의 [Trusted Web Activities](https://developers.google.com/web/android/trusted-web-activity)이란 기술을 활용해 인앱 결제를 제공하는 방안이며 아직 구현 중이라고 합니다.

### QR Codes for Multi-Device Checkout

결제 시 QR 코드를 생성하고, 다른 기기에서 해당 QR을 스캔해 결제를 진행합니다. 데스크톱 환경에서 앱카드로 결제하는 시나리오와 유사해 보입니다. 데모 영상은 [여기](https://www.w3.org/2020/05/entersekt_qr.mov)를 참고하세요.

### Open Banking

오픈 뱅킹 flow에서 Payment Request API와 FIDO 인증을 활용할 기회를 모색 중이라고 합니다. Web Payment Working Group을 비롯한 다양한 커뮤니티에서 논의 중인 사항이 정리된 문서([PAYMENTS AND AUTHENTICATION: DRIVING TOWARD A WHOLE GREATER THAN PARTS](https://www.w3.org/blog/2020/05/payments-and-authentication-driving-toward-a-whole-greater-than-parts/))를 참고했습니다.



# 더 알아보기

## Autofill
- 결제 양식 입력의 불편함을 해소하기 위한 input `name`, `autocomplete` 속성의 명세입니다.
- 가이드 문서: https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill


## UX Considerations
- https://developers.google.com/web/fundamentals/payments/merchant-guide/payment-request-ux-considerations


## 안드로이드 결제 앱 개발 가이드
- 현재 Payment Request API를 활용한 네이티브 앱 개발은 안드로이드에서 지원됩니다.
- 가이드 문서: https://web.dev/android-payment-apps-developers-guide/



# 참고 자료

- Guide on web.dev: https://web.dev/payments/
- Guide on Google Web Fundamentals: https://developers.google.com/web/fundamentals/payments
- W3C Spec:
  - Payment Request API: https://www.w3.org/TR/payment-request/
  - Payment Handler API: https://www.w3.org/TR/payment-handler/
  - Payment Method Identifiers: https://www.w3.org/TR/payment-method-id/
  - Payment Method Manifest: https://www.w3.org/TR/payment-method-manifest/
- The Evolution of Payment Apps
  - https://www.w3.org/blog/wpwg/2020/05/18/the-evolution-of-payment-apps-i-of-ii/
  - https://www.w3.org/blog/wpwg/2020/05/18/the-evolution-of-payment-apps-ii-of-ii/
- GitHub Repo: https://github.com/w3c/payment-request
- MDN Payment Request API: https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API
