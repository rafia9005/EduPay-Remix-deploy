import { useState } from "react";
import {
  checkPembayaran,
  getLastPayment,
  savePembayaran,
} from "../lib/firestore";
import { ListSiswa } from "~/db/siswa";
import { SnapMidTransClient } from "~/lib/midtrans";

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

  const calculateOverdueMonths = (lastPayment: any) => {
    const overdueMonths: string[] = [];
    const lastPaidMonth = lastPayment.month;
    const lastPaidYear = lastPayment.year;

    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let monthIndex = monthList.indexOf(lastPaidMonth);

    while (
      monthIndex < currentMonthIndex ||
      (lastPaidYear === currentYear && monthIndex < currentMonthIndex)
    ) {
      const overdueMonth = monthList[monthIndex];
      overdueMonths.push(overdueMonth);

      monthIndex++;

      if (monthIndex === 12) {
        monthIndex = 0;
      }
    }

    return overdueMonths;
  };

  const handleSubmit = async (nisn: string) => {
    const siswaData = ListSiswa.find((s) => s.nisn === nisn);

    if (siswaData) {
      setSiswa(siswaData);

      const currentDate = new Date();
      const currentMonthIndex = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const currentMonth = monthList[currentMonthIndex];

      const payments = await checkPembayaran(nisn, currentMonth, currentYear);

      if (payments.length > 0) {
        console.log("Pembayaran bulan ini sudah dilakukan.");
      } else {
        try {
          const lastPayment = await getLastPayment(nisn);
          console.log(`Pembayaran terakhir untuk ${nisn}:`, lastPayment);

          if (lastPayment) {
            const overdueMonths = calculateOverdueMonths(lastPayment);
            overdueMonths.forEach((month) => {
              console.log(month);
            });
            setPaymentMonths(overdueMonths);
            const overdueCount = overdueMonths.length;
            setMessage(
              `${overdueCount} bulan belum dibayar: ${overdueMonths.join(", ")}`
            );
          } else {
            throw new Error("No payments found");
          }
        } catch (error) {
          const overdueMonths = calculateOverdueMonths({
            month: "Januari",
            year: 2024,
          });
          setPaymentMonths(overdueMonths);
          const overdueCount = overdueMonths.length;
          setMessage(
            `${overdueCount} bulan belum dibayar: ${overdueMonths.join(", ")}`
          );
        }
      }
    } else {
      console.log("Siswa dengan NISN tersebut tidak ditemukan.");
    }
  };

  const handleMidtransPayment = async (nisn: string) => {
    const currentDate = new Date();
    const currentMonth = monthList[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    const paymentMidTransDetails = {
      nisn,
      month: currentMonth,
      year: currentYear,
    };

    const { token, message } = await SnapMidTransClient(paymentMidTransDetails);

    if (message === "success") {
      window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`;
      setMessage("Pembayaran berhasil, status telah diperbarui.");
    } else {
      setMessage(message); 
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
  };
};
