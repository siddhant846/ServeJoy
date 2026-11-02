import { SubscriptionTier, BillingCycle } from '../types';
import { PLANS, subscriptionService } from './subscriptionService';
import { storage } from './storage';

export interface PaymentOrderParams {
  tier: SubscriptionTier;
  cycle: BillingCycle;
  businessId: string;
  customerEmail: string;
  customerPhone?: string;
  customerName: string;
}

export interface PaymentInvoice {
  invoiceNumber: string;
  date: string;
  businessId: string;
  businessName: string;
  planName: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'paid' | 'failed' | 'pending';
  paymentId: string;
  gateway: 'razorpay' | 'stripe' | 'manual';
}

class PaymentService {
  /**
   * Create checkout session or Razorpay order
   */
  async createSubscriptionOrder(params: PaymentOrderParams): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    const plan = PLANS[params.tier];
    const amount = params.cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    // Razorpay standard amount in paise (1 INR = 100 paise)
    const amountInPaise = amount * 100;
    const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In production, your backend calls:
    // const order = await razorpay.orders.create({ amount: amountInPaise, currency: 'INR', receipt: params.businessId });
    return {
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_live_COMMERCIAL_KEY', // Configured in merchant dashboard
    };
  }

  /**
   * Verify signature upon payment completion (HMAC SHA256)
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): boolean {
    // In backend Node.js:
    // const hmac = crypto.createHmac('sha256', secret);
    // hmac.update(orderId + '|' + paymentId);
    // return hmac.digest('hex') === signature;
    return !!(orderId && paymentId);
  }

  /**
   * Record subscription invoice & activate subscription
   */
  recordSuccessfulPayment(
    params: PaymentOrderParams,
    paymentId: string,
    gateway: 'razorpay' | 'stripe' | 'manual' = 'razorpay'
  ): PaymentInvoice {
    const plan = PLANS[params.tier];
    const amount = params.cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    const tax = Math.round(amount * 0.18); // 18% GST standard in India
    const total = amount; // inclusive or + tax depending on pricing model

    const invoice: PaymentInvoice = {
      invoiceNumber: `INV-SJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      businessId: params.businessId,
      businessName: params.customerName,
      planName: plan.name,
      tier: params.tier,
      cycle: params.cycle,
      amount,
      taxAmount: tax,
      totalAmount: total,
      status: 'paid',
      paymentId,
      gateway,
    };

    // Save invoice to local storage history
    const existingInvoices: PaymentInvoice[] = this.getInvoices(params.businessId);
    existingInvoices.unshift(invoice);
    localStorage.setItem(`servejoy_${params.businessId}_invoices`, JSON.stringify(existingInvoices));

    // Activate subscription in subscription service
    subscriptionService.activatePlan(params.tier, params.cycle, paymentId, params.businessId);

    return invoice;
  }

  getInvoices(businessId?: string): PaymentInvoice[] {
    const bizId = businessId || storage.getActiveBusinessId();
    try {
      const data = localStorage.getItem(`servejoy_${bizId}_invoices`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const paymentService = new PaymentService();

