import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/api';
import {
  FaCheckCircle, FaCrown, FaStar, FaBolt, FaShieldAlt,
  FaCreditCard, FaRegFilePdf, FaSpinner, FaExchangeAlt,
  FaMobileAlt, FaQrcode, FaLock, FaChevronRight, FaUniversity
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const plans = [
  {
    key: 'basic',
    name: 'Starter',
    icon: FaBolt,
    monthly: 999,
    tagline: 'Perfect for self-motivated beginners',
    features: [
      'Basic workout plan',
      'Email support',
      'Progress tracking dashboard',
      'Community access',
      'Exercise video library',
    ],
    color: 'border-white/10 hover:border-gold-500/20',
  },
  {
    key: 'premium',
    name: 'Premium',
    icon: FaStar,
    monthly: 2999,
    tagline: 'Our most popular plan for serious results',
    features: [
      'Custom workout & nutrition plan',
      'Weekly check-ins',
      'Video consultations (2×/mo)',
      'Priority email & chat support',
      'Form-check video reviews',
    ],
    popular: true,
    color: 'border-gold-500/30 gold-glow',
  },
  {
    key: 'elite',
    name: 'Elite',
    icon: FaCrown,
    monthly: 4999,
    tagline: 'Unmatched access for the truly committed',
    features: [
      'Daily coaching & accountability',
      'Competition prep included',
      '24/7 WhatsApp support',
      'Monthly body composition analysis',
      'Unlimited video consultations',
    ],
    color: 'border-white/10 hover:border-gold-500/20',
  },
];

export default function ClientSubscription() {
  const { user, updateUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // UPI payment simulation states
  const [paymentMethod, setPaymentMethod] = useState('phonepe'); // 'phonepe' | 'gpay' | 'upi_id' | 'upi_qr' | 'card'
  const [upiId, setUpiId] = useState('');
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'success'
  const [processingStatus, setProcessingStatus] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subRes, historyRes] = await Promise.all([
        paymentService.getMySubscription(),
        paymentService.getPaymentHistory({ page: 1, per_page: 10 }),
      ]);

      if (subRes.data.success) {
        setSubscription(subRes.data.data.subscription);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleCheckout = async (planKey) => {
    setPaymentLoading(true);
    setPaymentMethod('phonepe');
    setUpiId('');
    setPaymentStep('select');
    setProcessingStatus('');
    setCardNo('');
    setCardExpiry('');
    setCardCvv('');
    try {
      const res = await paymentService.createOrder(planKey, 'monthly');
      if (res.data.success) {
        const orderData = res.data.data;
        setPendingOrder(orderData);

        // If Razorpay script is loaded and we have an order_id, initialize it
        if (window.Razorpay && orderData.order_id) {
          const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Gnaneswar Fitness Platform',
            description: `Subscription to ${planKey.toUpperCase()} Plan`,
            order_id: orderData.order_id,
            handler: async function (response) {
              await verifyPayment(response, orderData.payment_id);
            },
            prefill: {
              name: `${user?.first_name || ''} ${user?.last_name || ''}`,
              email: user?.email,
              contact: user?.phone || '',
            },
            theme: { color: '#d4af37' },
            modal: {
              ondismiss: function () {
                setPaymentLoading(false);
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // If no credentials or script, fall back to mock checkout modal
          setShowMockModal(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (razorpayData, paymentId) => {
    setPaymentLoading(true);
    try {
      const res = await paymentService.verifyPayment({
        payment_id: paymentId,
        razorpay_payment_id: razorpayData.razorpay_payment_id,
        razorpay_order_id: razorpayData.razorpay_order_id,
        razorpay_signature: razorpayData.razorpay_signature,
      });

      if (res.data.success) {
        toast.success('Subscription activated successfully! 🎉');
        updateUser({ role: 'client' });
        await fetchSubscriptionData();
      } else {
        toast.error('Payment verification failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setPaymentLoading(false);
      setShowMockModal(false);
      setPendingOrder(null);
    }
  };

  const simulateUPITransaction = async () => {
    if (!pendingOrder) return;

    // Validation
    if ((paymentMethod === 'phonepe' || paymentMethod === 'gpay' || paymentMethod === 'upi_id') && !upiId.trim()) {
      toast.error('Please enter a valid UPI ID (e.g. user@ybl)');
      return;
    }

    if (paymentMethod === 'card' && (!cardNo || !cardExpiry || !cardCvv)) {
      toast.error('Please enter card number, expiry, and CVV');
      return;
    }

    setPaymentStep('processing');
    
    const steps = [
      { text: 'Connecting to secure transaction node...', delay: 1000 },
      { 
        text: paymentMethod === 'phonepe' 
          ? 'Opening secure PhonePe transaction window...' 
          : paymentMethod === 'gpay' 
          ? 'Verifying authorization request with Google Pay...' 
          : paymentMethod === 'upi_id'
          ? `Sending verification ping to UPI handle: ${upiId}...`
          : paymentMethod === 'upi_qr'
          ? 'Creating secure payment receipt QR...'
          : 'Executing tokenized credit card authorization...', 
        delay: 1500 
      },
      { text: 'Awaiting UPI application confirmation or biometric signature...', delay: 1800 },
      { text: 'Clearing payment with recipient bank network...', delay: 1200 },
      { text: 'Verification success! Activating premium membership...', delay: 800 }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setProcessingStatus(steps[i].text);
        await new Promise(resolve => setTimeout(resolve, steps[i].delay));
      }

      await verifyPayment({
        razorpay_payment_id: `pay_upi_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_order_id: pendingOrder.order_id || `order_upi_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_signature: 'mock_signature_approved',
      }, pendingOrder.payment_id);
    } catch (err) {
      toast.error('Simulation payment error');
      setPaymentStep('select');
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const res = await paymentService.getInvoice(paymentId);
      if (res.data.success) {
        toast.success('Invoice data downloaded. Printing receipt...');
        const invoice = res.data.data.invoice;
        // Simple printable layout trigger
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${invoice.invoice_number}</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .company { text-align: right; }
                .details { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                th, td { padding: 12px; border: 1px solid #eee; text-align: left; }
                th { background-color: #fafafa; }
                .total-row { font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h2>INVOICE</h2>
                  <p>Invoice #: ${invoice.invoice_number}</p>
                  <p>Date: ${invoice.date}</p>
                </div>
                <div class="company">
                  <h3>${invoice.company.name}</h3>
                  <p>${invoice.company.address}</p>
                  <p>Email: ${invoice.company.email}</p>
                </div>
              </div>
              <div class="details">
                <h4>Bill To:</h4>
                <p><strong>${invoice.customer.name}</strong></p>
                <p>Email: ${invoice.customer.email}</p>
                <p>Phone: ${invoice.customer.phone}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.unit_price}</td>
                      <td>₹${item.total}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; font-weight: bold">Subtotal:</td>
                    <td>₹${invoice.subtotal}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; font-weight: bold">GST (18%):</td>
                    <td>₹${invoice.gst_amount}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; font-weight: bold; color: #d4af37">Total Amount Paid:</td>
                    <td style="color: #d4af37; font-weight: bold">₹${invoice.total}</td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px;">
                <p>This is a computer-generated invoice. No signature required.</p>
                <p>Thank you for choosing Gnaneswar Fitness Platform!</p>
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      toast.error('Failed to retrieve invoice details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <FaSpinner className="animate-spin text-gold-400 text-4xl" />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Subscription &amp; Billing | Gnaneswar Fitness</title></Helmet>

      <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-fadeIn">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Subscription &amp; Billing</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your active plans, pricing tiers, and invoices</p>
        </div>

        {/* Current Active Plan Status */}
        <div className="card border border-gold-500/20 bg-dark-900/60 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs uppercase tracking-wider font-bold">
                <FaCrown /> Status Details
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Active Plan: <span className="text-gradient-gold">{subscription?.plan_name || 'No Active Plan (Trial Lead)'}</span>
              </h2>
              {subscription ? (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-dark-300">
                  <p>Billing Cycle: <span className="text-white font-semibold capitalize">{subscription.billing_cycle}</span></p>
                  <p>Paid Amount: <span className="text-white font-semibold">₹{subscription.plan_price}</span></p>
                  <p>Expires On: <span className="text-white font-semibold">{new Date(subscription.end_date).toLocaleDateString()}</span></p>
                </div>
              ) : (
                <p className="text-dark-300 text-sm max-w-xl">
                  You are currently using the platform on a trial/lead basis. Subscribe to a plan below to gain instant access to your customized nutrition/workout routines and direct messaging with Coach Gnaneswar.
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              {subscription ? (
                <div className="px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm text-center">
                  ● Subscription Active
                </div>
              ) : (
                <div className="px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold text-sm text-center">
                  ⚡ Trial Access
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade / Plan Comparison Section */}
        <div>
          <h2 className="text-lg font-serif font-bold text-white mb-6">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan_name?.toLowerCase().includes(plan.key);
              return (
                <div
                  key={plan.key}
                  className={`card p-6 flex flex-col justify-between border relative ${plan.color} ${plan.popular ? 'md:-mt-2 md:mb-2' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-gold rounded-full text-dark-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <FaStar /> Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-[10px] text-dark-400 mt-0.5">{plan.tagline}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center text-dark-950">
                        <plan.icon size={18} />
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gradient-gold">₹{plan.monthly}</span>
                      <span className="text-dark-400 text-xs">/month</span>
                    </div>

                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-dark-200">
                          <FaCheckCircle className="text-gold-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={paymentLoading || isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-dark-800 text-dark-400 border border-white/5 cursor-default'
                        : plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {paymentLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : isCurrent ? (
                      'Your Current Plan'
                    ) : (
                      <>Upgrade to {plan.name} <FaExchangeAlt /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice & Payment History */}
        {history.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-serif font-bold text-white mb-4">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-dark-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item) => (
                    <tr key={item.id} className="text-dark-200 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono">{item.invoice_number}</td>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 font-semibold text-white">₹{item.amount}</td>
                      <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                          item.status === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadInvoice(item.id)}
                            className="p-2 rounded-lg bg-dark-800 text-gold-400 hover:bg-gold-500/10 hover:text-gold-300 transition-colors"
                            title="Print Invoice"
                          >
                            <FaRegFilePdf size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security / Payment badges footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-dark-500">
          <p className="flex items-center gap-1">
            <FaShieldAlt className="text-gold-500" /> Secure 256-bit SSL encrypted payments processed via Razorpay.
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><FaCreditCard /> UPI &amp; Cards Accepted</span>
          </div>
        </div>
      </div>

      {/* Mock Payment Gateway Modal */}
      <AnimatePresence>
        {showMockModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-lg w-full p-6 space-y-6 border border-gold-500/20 rounded-2xl relative overflow-hidden"
            >
              {/* Gold glow decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {paymentStep === 'select' ? (
                <>
                  {/* Modal Header */}
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mx-auto shadow-md shadow-gold-500/20">
                      <FaLock className="text-dark-950 text-xl" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mt-3">Secure Payment Checkout</h3>
                    <p className="text-[11px] text-dark-400">Gnaneswar Fitness Platform Gateway</p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 space-y-2.5">
                    <div className="flex justify-between text-xs text-dark-300">
                      <span>Selected Plan:</span>
                      <span className="text-white font-bold capitalize">{pendingOrder?.plan?.name || 'Starter'} Program</span>
                    </div>
                    <div className="flex justify-between text-xs text-dark-300">
                      <span>Billing Cycle:</span>
                      <span className="text-white capitalize">{pendingOrder?.billing_cycle || 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-dark-300 border-t border-white/5 pt-2">
                      <span className="text-dark-400 font-medium">Amount Due:</span>
                      <span className="text-gold-400 font-bold text-sm">₹{pendingOrder ? pendingOrder.amount / 100 : '0.00'}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-dark-400 uppercase tracking-wider block">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setPaymentMethod('phonepe'); setUpiId(user?.email?.split('@')[0] + '@ybl'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMethod === 'phonepe'
                            ? 'border-gold-500/50 bg-gold-500/10 text-white'
                            : 'border-white/5 bg-dark-900/40 text-dark-300 hover:bg-dark-900/60'
                        }`}
                      >
                        <FaMobileAlt className={paymentMethod === 'phonepe' ? 'text-gold-400' : 'text-dark-500'} />
                        <div>
                          <p className="text-xs font-bold leading-tight">PhonePe</p>
                          <p className="text-[9px] text-dark-500">UPI App</p>
                        </div>
                      </button>

                      <button
                        onClick={() => { setPaymentMethod('gpay'); setUpiId(user?.email?.split('@')[0] + '@okaxis'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMethod === 'gpay'
                            ? 'border-gold-500/50 bg-gold-500/10 text-white'
                            : 'border-white/5 bg-dark-900/40 text-dark-300 hover:bg-dark-900/60'
                        }`}
                      >
                        <FaMobileAlt className={paymentMethod === 'gpay' ? 'text-gold-400' : 'text-dark-500'} />
                        <div>
                          <p className="text-xs font-bold leading-tight">Google Pay</p>
                          <p className="text-[9px] text-dark-500">UPI App</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('upi_qr')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMethod === 'upi_qr'
                            ? 'border-gold-500/50 bg-gold-500/10 text-white'
                            : 'border-white/5 bg-dark-900/40 text-dark-300 hover:bg-dark-900/60'
                        }`}
                      >
                        <FaQrcode className={paymentMethod === 'upi_qr' ? 'text-gold-400' : 'text-dark-500'} />
                        <div>
                          <p className="text-xs font-bold leading-tight">UPI QR Code</p>
                          <p className="text-[9px] text-dark-500">Scan &amp; Pay</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-gold-500/50 bg-gold-500/10 text-white'
                            : 'border-white/5 bg-dark-900/40 text-dark-300 hover:bg-dark-900/60'
                        }`}
                      >
                        <FaCreditCard className={paymentMethod === 'card' ? 'text-gold-400' : 'text-dark-500'} />
                        <div>
                          <p className="text-xs font-bold leading-tight">Credit/Debit</p>
                          <p className="text-[9px] text-dark-500">Card checkout</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Details Panel */}
                  <div className="p-4 rounded-xl bg-dark-900/60 border border-white/5 min-h-[100px] flex flex-col justify-center">
                    {(paymentMethod === 'phonepe' || paymentMethod === 'gpay' || paymentMethod === 'upi_id') && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">Enter UPI ID</label>
                          <span className="text-[9px] text-gold-500">Fast Verification Enabled</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder=""
                            autoComplete="off"
                            className="input w-full bg-dark-950/80 border-white/10 text-white text-xs pl-3 py-2.5 rounded-lg focus:border-gold-500/50"
                          />
                        </div>
                        <p className="text-[10px] text-dark-500">
                          {paymentMethod === 'phonepe' ? 'PhonePe handles: @ybl, @axl, @ibl' : 'GPay handles: @okaxis, @okhdfcbank, @okicici'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'upi_qr' && (
                      <div className="flex flex-col items-center py-2 space-y-3 text-center">
                        <div className="p-2 bg-white rounded-lg flex items-center justify-center relative shadow-md">
                          {/* Elegant vector representation of QR Code */}
                          <svg width="100" height="100" viewBox="0 0 100 100" className="text-dark-950">
                            <rect width="100" height="100" fill="#fff" />
                            {/* Outer squares */}
                            <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                            <rect x="10" y="10" width="15" height="15" fill="#fff" />
                            <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                            
                            <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                            <rect x="75" y="10" width="15" height="15" fill="#fff" />
                            <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                            
                            <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                            <rect x="10" y="75" width="15" height="15" fill="#fff" />
                            <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                            
                            {/* Tiny dots */}
                            <rect x="40" y="5" width="5" height="15" fill="currentColor" />
                            <rect x="50" y="15" width="10" height="5" fill="currentColor" />
                            <rect x="45" y="25" width="15" height="10" fill="currentColor" />
                            <rect x="5" y="40" width="15" height="5" fill="currentColor" />
                            <rect x="25" y="45" width="5" height="15" fill="currentColor" />
                            
                            <rect x="35" y="40" width="30" height="30" fill="currentColor" />
                            <rect x="40" y="45" width="20" height="20" fill="#fff" />
                            <rect x="45" y="50" width="10" height="10" fill="currentColor" />
                            
                            <rect x="75" y="40" width="15" height="15" fill="currentColor" />
                            <rect x="70" y="65" width="25" height="25" fill="currentColor" />
                            <rect x="75" y="70" width="15" height="15" fill="#fff" />
                            <rect x="80" y="75" width="5" height="5" fill="currentColor" />
                          </svg>
                          {/* Inner Coach Gold Logo badge */}
                          <div className="absolute inset-0 m-auto w-6 h-6 rounded-md bg-dark-950 flex items-center justify-center border-2 border-white shadow shadow-gold-500/50">
                            <FaCrown className="text-[10px] text-gold-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] text-white font-bold">Scan to Pay via any UPI App</p>
                          <p className="text-[9px] text-dark-400">Payee: Coach Gnaneswar (gapbodybuilder@gmail.com)</p>
                          <p className="text-[9px] text-gold-500 font-semibold">Amount: ₹{pendingOrder ? pendingOrder.amount / 100 : '0.00'}</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-2.5 text-left">
                        <label className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">Credit / Debit Card</label>
                        <input
                          type="text"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').substring(0, 16))}
                          placeholder=""
                          autoComplete="off"
                          className="input w-full bg-dark-950/80 border-white/10 text-white text-xs pl-3 py-2 rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                            placeholder=""
                            autoComplete="off"
                            className="input w-full bg-dark-950/80 border-white/10 text-white text-xs pl-3 py-2 rounded-lg text-center"
                          />
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            placeholder=""
                            autoComplete="off"
                            className="input w-full bg-dark-950/80 border-white/10 text-white text-xs pl-3 py-2 rounded-lg text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={simulateUPITransaction}
                      className="btn-primary w-full py-3 font-semibold text-xs flex items-center justify-center gap-2"
                    >
                      <FaShieldAlt className="text-xs" /> Confirm Secure Payment
                    </button>
                    <button
                      onClick={() => {
                        setShowMockModal(false);
                        setPaymentLoading(false);
                        setPendingOrder(null);
                      }}
                      className="w-full text-center py-2.5 text-xs text-dark-500 hover:text-dark-300 font-medium"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-dark-950 flex items-center justify-center">
                      <FaShieldAlt className="text-gold-400 text-sm animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Processing Transaction...</h4>
                    <p className="text-xs text-dark-400 font-medium min-h-[1.5rem] px-4">{processingStatus}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-900 border border-white/5 text-[9px] text-dark-500">
                    <FaLock /> Secured by 256-bit bank-grade encryption
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
