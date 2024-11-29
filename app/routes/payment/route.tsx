import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get("order_id");

  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`https://edu-api-flax.vercel.app/api/payment/status?order_id=${order_id}`);

        if (response.data.status_code === "200") {
          setPaymentDetails(response.data);
        } else {
          console.error("Payment not found");
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    };

    if (order_id) {
      checkStatus();
    }
  }, [order_id]);

  if (!paymentDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <span className="text-xl font-semibold text-gray-500">Loading...</span>
      </div>
    );
  }

  const {
    transaction_id,
    gross_amount,
    currency,
    order_id: apiOrderId,
    payment_type,
    transaction_status,
    va_numbers,
  } = paymentDetails;

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);

    doc.text("Payment Receipt", 105, 20, { align: "center" });

    doc.text(`Transaction ID: ${transaction_id}`, 10, 40);
    doc.text(`Order ID: ${apiOrderId}`, 10, 50);
    doc.text(`Payment Amount: ${gross_amount} ${currency}`, 10, 60);
    doc.text(`Payment Type: ${payment_type}`, 10, 70);
    doc.text(`Transaction Status: ${transaction_status}`, 10, 80);

    if (va_numbers && Array.isArray(va_numbers) && va_numbers.length > 0) {
      doc.text(`Bank: ${va_numbers[0]?.bank}`, 10, 100);
      doc.text(`Virtual Account Number: ${va_numbers[0]?.va_number}`, 10, 110);
    } else {
      doc.text("No bank details available.", 10, 100);
    }

    doc.save(`Payment_Receipt_${apiOrderId}.pdf`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8">
        <h1 className="text-3xl font-semibold text-center text-blue-600">Payment Receipt</h1>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800 font-medium">Transaction ID:</p>
            <p className="text-lg text-gray-700">{transaction_id}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800 font-medium">Order ID:</p>
            <p className="text-lg text-gray-700">{apiOrderId}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800 font-medium">Payment Amount:</p>
            <p className="text-lg text-gray-700">{gross_amount} {currency}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800 font-medium">Payment Type:</p>
            <p className="text-lg text-gray-700">{payment_type}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800 font-medium">Transaction Status:</p>
            <p className="text-lg text-gray-700">{transaction_status}</p>
          </div>
        </div>

        {va_numbers && Array.isArray(va_numbers) && va_numbers.length > 0 ? (
          <div className="bg-gray-100 p-6 rounded-md shadow-md">
            <h3 className="text-2xl font-semibold text-center text-green-600 mb-4">Bank Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-800 font-medium">Bank:</p>
                <p className="text-lg text-gray-700">{va_numbers[0]?.bank}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-800 font-medium">Virtual Account Number:</p>
                <p className="text-lg text-gray-700">{va_numbers[0]?.va_number}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-800 text-center mt-4">No bank details available.</p>
        )}

        {/* Print PDF Button */}
        <div className="text-center mt-8">
          <button
            className="bg-blue-500 text-white py-3 px-8 rounded-full text-xl font-semibold hover:bg-blue-600 focus:outline-none transition-all"
            onClick={generatePDF}
          >
            Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}

