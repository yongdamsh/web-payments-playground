# Web Payments

Payment Request API를 비롯해 결제 수단을 연동하는 표준 스펙을 살펴보고 예제 어플리케이션을 작성하는 과정을 기록합니다.


## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
- [결제 프로세스 동작 방식](#%EA%B2%B0%EC%A0%9C-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D)
- [API 살펴보기](#api-%EC%82%B4%ED%8E%B4%EB%B3%B4%EA%B8%B0)
  - [Payment Request API](#payment-request-api)
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
- [참고 자료](#%EC%B0%B8%EA%B3%A0-%EC%9E%90%EB%A3%8C)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

> ℹ️ 문서 작성 기준 및 개발 환경
> - [W3C Candidate Recommendation 12 December 2019 스펙](https://www.w3.org/TR/2019/CR-payment-request-20191212/)을 기준으로 조사된 내용입니다.
> - 예제 코드는 Chrome browser를 기준으로 테스트 했습니다. 브라우저 지원 현황은 [여기](https://caniuse.com/#search=payment%20request)에서 확인하세요.
> - Payment Request API는 HTTPS 서버에서만 동작합니다. 로컬에서 테스트하려면 [ngrok](https://ngrok.com/)과 같은 도구를 활용하세요.
> - 예제 코드는 빠른 프로토타이핑과 배포를 위해 [Next.js](https://nextjs.org/)와 [Vercel](https://vercel.com/)로 작성했습니다.



# Overview

> This specification standardizes an API to allow merchants (i.e. web sites selling physical or digital goods) to utilize one or more payment methods with minimal integration. User agents (e.g., browsers) facilitate the payment flow between merchant and user.  
> \- Abstract in https://www.w3.org/TR/payment-request/






# 결제 프로세스 동작 방식





# API 살펴보기

## Payment Request API
- 미지원
  - 환불
  - 총요금 계산

## Payment Handler API






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




# 참고 자료

- Google Web Fundamentals Payment Request API: https://developers.google.com/web/fundamentals/payments
- W3C Payment Request API: https://www.w3.org/TR/payment-request/
- W3C Payment Handler API: https://www.w3.org/TR/payment-handler/
- MDN Payment Request API: https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API
- Payment Handler API: 