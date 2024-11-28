import Midtrans from "midtrans-client";
import { v4 as uuidv4 } from "uuid";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: import.meta.env.TEST_MIDTRANS_SECRET || "",
  clientKey: import.meta.env.TEST_MIDTRANS_CLIENT || "",
});

interface PaymentRequest {
  nisn: string;
  month: string;
  year: number;
}

const paymentId: string = uuidv4();
const price = 100000

export async function SnapMidTransClient({
  nisn,
  month,
  year,
}: PaymentRequest) {
  try {
    const parameter = {
      transaction_details: {
        order_id: paymentId,
        gross_amount: price,
      },
      item_details: [
        {
          id: paymentId,
          title: `PEMBAYARAN ${month} - ${year} ${nisn}`,
          price: price,
          quantity: 1,
        },
      ],
    };

    const token = await snap.createTransactionToken(parameter);

    return {
      token,
      message: "success",
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate token",
    };
  }
}
