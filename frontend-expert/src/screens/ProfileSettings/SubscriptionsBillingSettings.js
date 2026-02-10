import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

export default function SubscriptionsBillingSettings() {
  const { doctor } = useDoctorAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subscriptions");

  // Subscription states
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // Payment method states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Billing history states
  const [billingHistory, setBillingHistory] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingSummary, setBillingSummary] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/plans`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch user subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/payment-methods`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setPaymentMethods(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Fetch billing history
  const fetchBillingHistory = async () => {
    try {
      setLoadingBilling(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/billing/history`,
        { withCredentials: true, params: { limit: 50 } }
      );
      if (response.data.success) {
        setBillingHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
      toast.error("Failed to load billing history");
    } finally {
      setLoadingBilling(false);
    }
  };

  // Fetch billing summary
  const fetchBillingSummary = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/billing/summary`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setBillingSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching billing summary:", error);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "subscriptions") {
      fetchPlans();
      fetchSubscriptions();
    } else if (activeTab === "payment-methods") {
      fetchPaymentMethods();
    } else if (activeTab === "billing") {
      fetchBillingHistory();
      fetchBillingSummary();
    }
  }, [activeTab]);

  // Subscribe to a plan
  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions`,
        { planId },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { razorpayOrder, subscription } = response.data.data;

        // Initialize Razorpay checkout
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Avijo Expert",
          description: "Subscription Payment",
          order_id: razorpayOrder.id,
          handler: async function (razorpayResponse) {
            // Verify payment
            try {
              const verifyResponse = await axios.post(
                `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/verify-payment`,
                {
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                },
                { withCredentials: true }
              );

              if (verifyResponse.data.success) {
                toast.success("Subscription activated successfully!");
                fetchSubscriptions();
                fetchBillingHistory();
                fetchBillingSummary();
              } else {
                toast.error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast.error(error.response?.data?.message || "Payment verification failed");
            }
          },
          prefill: {
            name: doctor?.fullName || doctor?.personalDetails?.fullName || "",
            email: doctor?.emailId || doctor?.personalDetails?.emailId || "",
            contact: doctor?.mobileNumber || doctor?.personalDetails?.mobileNumber || "",
          },
          theme: {
            color: "#0095D9",
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled");
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        razorpay.open();
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error(error.response?.data?.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/cancel`,
        { subscriptionId },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Subscription cancelled successfully");
        fetchSubscriptions();
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/payment-methods/${paymentMethodId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Payment method deleted successfully");
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to delete payment method");
    } finally {
      setLoading(false);
    }
  };

  // Set default payment method
  const handleSetDefault = async (paymentMethodId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/subscriptions/payment-methods/${paymentMethodId}/set-default`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Default payment method updated");
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast.error("Failed to update default payment method");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Subscriptions & Billing
      </h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 font-medium ${activeTab === "subscriptions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Space Subscriptions
        </button>
        <button
          onClick={() => setActiveTab("payment-methods")}
          className={`px-4 py-2 font-medium ${activeTab === "payment-methods"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 font-medium ${activeTab === "billing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Billing History
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          {/* Active Subscriptions */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Subscriptions
            </h3>
            {loadingSubscriptions ? (
              <div className="text-center py-4">Loading...</div>
            ) : activeSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <div
                    key={subscription._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {subscription.planId?.name || "Unknown Plan"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {subscription.planId?.description || ""}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Valid until: {formatDate(subscription.endDate)}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          {subscription.status.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCancelSubscription(subscription._id)}
                        className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                You are not currently a member of any space.
              </p>
            )}
          </div>

          {/* Available Plans */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Plans
            </h3>
            {loadingPlans ? (
              <div className="text-center py-4">Loading...</div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`border rounded-lg p-4 ${plan.isPopular
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                      }`}
                  >
                    {plan.isPopular && (
                      <span className="inline-block mb-2 px-2 py-1 text-xs font-semibold rounded bg-blue-600 text-white">
                        POPULAR
                      </span>
                    )}
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {plan.name}
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(plan.price, plan.currency)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      / {plan.billingCycle}
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      {plan.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {plan.features?.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No plans available.</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "payment-methods" && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Methods
            </h3>
            <button
              onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Add Payment Method
            </button>
          </div>

          {loadingPaymentMethods ? (
            <div className="text-center py-4">Loading...</div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      {method.type === "card" && (
                        <div>
                          <p className="font-semibold text-gray-900">
                            •••• •••• •••• {method.cardLast4}
                          </p>
                          <p className="text-sm text-gray-600">
                            {method.cardBrand} • Expires {method.cardExpiryMonth}/
                            {method.cardExpiryYear}
                          </p>
                        </div>
                      )}
                      {method.type === "upi" && (
                        <div>
                          <p className="font-semibold text-gray-900">UPI</p>
                          <p className="text-sm text-gray-600">{method.upiId}</p>
                        </div>
                      )}
                      {method.isDefault && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method._id)}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        disabled={loading}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePaymentMethod(method._id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              You have no saved payment method.
            </p>
          )}

          {showAddPaymentMethod && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                Payment methods will be saved automatically after your first
                successful payment. Complete a subscription payment to add a
                payment method.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Billing History Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Billing Summary */}
          {billingSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billingSummary.totalPaid)}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingSummary.activeSubscriptions}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingSummary.totalInvoices}
                </p>
              </div>
            </div>
          )}

          {/* Billing History List */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Billing History
            </h3>
            {loadingBilling ? (
              <div className="text-center py-4">Loading...</div>
            ) : billingHistory.length > 0 ? (
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {invoice.planId?.name || "Subscription Payment"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                You have no Billing History.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Information and resources */}
      <div className="mt-6 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Information and resources
        </h3>
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Help center
        </a>
      </div>
    </div>
  );
}
