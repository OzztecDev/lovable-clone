import crypto from 'crypto';

const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
const IYZICO_API_KEY = process.env.IYZICO_API_KEY;
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY;
const IYZICO_MERCHANT_ID = process.env.IYZICO_MERCHANT_ID;

export interface IyzicoPaymentRequest {
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentCard?: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: number;
  };
  customer?: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber?: string;
  };
  billingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  shippingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  installment: string;
  callbackUrl: string;
}

export interface IyzicoPaymentResponse {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  paymentId?: string;
  conversationId?: string;
  cardCardHolderName?: string;
  cardLastFourDigits?: string;
  binNumber?: string;
  basketId?: string;
  price?: string;
  paidPrice?: string;
  currency?: string;
  installments?: Array<{
    installmentNumber: number;
    price: number;
  }>;
  itemTransactions?: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: number;
    price: string;
    paidPrice: string;
  }>;
}

export interface IyzicoSubscriptionRequest {
  pricingPlanReferenceCode: string;
  subscriptionInitialStatus?: string;
  paymentCard?: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  customer?: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber?: string;
  };
  billingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
}

function generateSignature(uri: string, randomString: string, timestamp: string, token: string): string {
  const signatureString = `${IYZICO_MERCHANT_ID}${uri}${randomString}${timestamp}${token}`;
  const signature = crypto
    .createHmac('sha256', IYZICO_SECRET_KEY || '')
    .update(signatureString)
    .digest('base64');
  return signature;
}

function generateCheckoutFormToken(request: any): string {
  const conversationId = request.conversationId || crypto.randomUUID();
  const randomString = crypto.randomBytes(32).toString('hex').substring(0, 32);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const uri = '/payment/iyzipos/auth/ecom';
  const signature = generateSignature(uri, randomString, timestamp, IYZICO_SECRET_KEY || '');

  const token = Buffer.from(
    `${IYZICO_MERCHANT_ID}:${timestamp}:${randomString}:${signature}`
  ).toString('base64');

  return token;
}

export async function createCheckoutForm(request: IyzicoPaymentRequest): Promise<{
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
}> {
  const formToken = generateCheckoutFormToken(request);

  const response = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/auth/ecom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${formToken}`,
    },
    body: JSON.stringify({
      locale: 'en',
      conversationId: request.basketId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      basketId: request.basketId,
      paymentGroup: 'PRODUCT',
      paymentCard: request.paymentCard,
      customer: request.customer,
      billingAddress: request.billingAddress,
      shippingAddress: request.shippingAddress,
      installment: request.installment,
      callbackUrl: request.callbackUrl,
    }),
  });

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.errorMessage || 'Failed to create checkout form');
  }

  return {
    token: data.token,
    checkoutFormContent: data.checkoutFormContent,
    paymentPageUrl: data.paymentPageUrl,
  };
}

export async function verifyPayment(callbackData: any): Promise<IyzicoPaymentResponse> {
  const { token, ...paymentData } = callbackData;

  const response = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/auth/ecom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locale: 'en',
      conversationId: paymentData.conversationId,
      token,
    }),
  });

  return response.json();
}

export async function createSubscription(request: IyzicoSubscriptionRequest): Promise<{
  status: string;
  subscriptionReferenceCode?: string;
  errorCode?: string;
  errorMessage?: string;
}> {
  const response = await fetch(`${IYZICO_BASE_URL}/v1/subscription.initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locale: 'en',
      conversationId: crypto.randomUUID(),
      pricingPlanReferenceCode: request.pricingPlanReferenceCode,
      subscriptionInitialStatus: request.subscriptionInitialStatus || 'ACTIVE',
      paymentCard: request.paymentCard,
      customer: request.customer,
      billingAddress: request.billingAddress,
    }),
  });

  return response.json();
}

export function getIyzicoConfig() {
  return {
    apiKey: IYZICO_API_KEY,
    secretKey: IYZICO_SECRET_KEY,
    merchantId: IYZICO_MERCHANT_ID,
    baseUrl: IYZICO_BASE_URL,
  };
}
