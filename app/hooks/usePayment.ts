import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  checkPembayaran,
  getLastPayment,
  savePembayaran,
} from "../lib/firestore";
import { ListSiswa } from "~/db/siswa";
import axios from "axios";

const monthList = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const usePayment = () => {
  const [message, setMessage] = useState<string>("");
  const [paymentMonths, setPaymentMonths] = useState<string[]>([]);
  const [siswa, setSiswa] = useState<any>(null);
  const [months, setMonths] = useState<any>(null);

  const currentDate = new Date();
  const currentMonth = monthList[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const calculateOverdueMonths = (lastPayment: any) => {
    const overdueMonths: string[] = [];

    if (!lastPayment) {
      for (let i = 0; i < currentDate.getMonth(); i++) {
        overdueMonths.push(monthList[i]);
      }
      return overdueMonths;
    }

    const lastPaidMonth = lastPayment.month;
    const lastPaidYear = lastPayment.year;
    let monthIndex = monthList.indexOf(lastPaidMonth);

    while (
      monthIndex < currentDate.getMonth() ||
      (lastPaidYear === currentYear && monthIndex < currentDate.getMonth())
    ) {
      overdueMonths.push(monthList[monthIndex]);
      monthIndex = (monthIndex + 1) % 12;
    }

    return overdueMonths;
  };

  const calculateTax = (overdueCount: number) => {
    if (overdueCount > 5) return overdueCount * 2500;
    if (overdueCount >= 1 && overdueCount <= 4) return overdueCount * 2500;
    return 0;
  };

  const calculateTotalPrice = (overdueCount: number, basePrice: number) => {
    const tax = calculateTax(overdueCount);
    return basePrice * overdueCount + tax;
  };

  const handleSubmit = async (nisn: string) => {
    const siswaData = ListSiswa.find((s) => s.nisn === nisn);
    if (siswaData) {
      setSiswa(siswaData);

      const payments = await checkPembayaran(nisn, currentMonth, currentYear);
      if (payments.length > 0) {
        setMessage("Pembayaran bulan ini sudah dilakukan.");
      } else {
        try {
          const lastPayment = await getLastPayment(nisn);
          console.log(lastPayment);
          if (lastPayment) {
            const overdueMonths = calculateOverdueMonths(lastPayment);
            setPaymentMonths(overdueMonths);
            const overdueCount = overdueMonths.length;
            const basePrice = 100000;
            const totalPrice = calculateTotalPrice(overdueCount, basePrice);
            setMessage(
              `${overdueCount} bulan belum dibayar: ${overdueMonths.join(
                ", "
              )}. Total yang harus dibayar: Rp ${totalPrice}`
            );
            setMonths(overdueMonths);
          } else {
            // Jika tidak ada pembayaran sebelumnya
            const overdueMonths = calculateOverdueMonths(null);
            setPaymentMonths(overdueMonths);
            const overdueCount = overdueMonths.length;
            const basePrice = 100000;
            const totalPrice = calculateTotalPrice(overdueCount, basePrice);
            setMessage(
              `${overdueCount} bulan belum dibayar: ${overdueMonths.join(
                ", "
              )}. Total yang harus dibayar: Rp ${totalPrice}`
            );
          }
        } catch (error) {
          console.error("Error getting last payment:", error);
          setMessage(
            "Terjadi kesalahan saat mengambil data pembayaran terakhir."
          );
        }
      }
    } else {
      setMessage("Siswa dengan NISN tersebut tidak ditemukan.");
    }
  };

  const handleMidtransPayment = async (nisn: string, months: number) => {
    const paymentId = uuidv4();
    try {
      const lastPayment = await getLastPayment(nisn);
      let overdueCount = months;

      if (lastPayment) {
        const overdueMonths = calculateOverdueMonths(lastPayment);
        overdueCount = overdueMonths.length;
      } else {
        console.log(
          `No previous payments found for student with NISN: ${nisn}. Assuming overdue for ${overdueCount} months.`
        );
        overdueCount = 12; // Jika tidak ada pembayaran sebelumnya, anggap 12 bulan belum dibayar
      }

      const basePrice = 100000;
      const totalPrice = calculateTotalPrice(overdueCount, basePrice);

      const response = await axios.post(
        "https://edu-api-flax.vercel.app/api/payment",
        {
          paymentId,
          nisn,
          price: totalPrice,
          month: currentMonth,
          year: currentYear,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token } = response.data;
      if (token) {
        //const paymentData = {
        //  nisn,
        //  month: currentMonth,
        //  year: currentYear,
        //  status: "PAID",
        //};
        //await savePembayaran(paymentData);
        window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`;
      } else {
        console.error("Failed to get token from server");
        setMessage("Failed to initiate payment.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setMessage(
        "There was an error processing the payment. Please try again."
      );
    }
  };

  const resetData = () => {
    setSiswa(null);
    setPaymentMonths([]);
    setMessage("");
  };

  return {
    siswa,
    message,
    paymentMonths,
    handleSubmit,
    handleMidtransPayment,
    resetData,
    months,
  };
};
