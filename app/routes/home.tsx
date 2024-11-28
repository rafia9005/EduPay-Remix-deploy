import { useState, useEffect } from "react";
import { usePayment } from "../hooks/usePayment"; 

export default function Home() {
  const [nisn, setNisn] = useState("");
  const { siswa, message, paymentMonths, handleSubmit, handleMidtransPayment, resetData } = usePayment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [additionalMonths, setAdditionalMonths] = useState(1);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(nisn); 
  };

  useEffect(() => {
    if (siswa) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [siswa]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetData(); 
  };

  const handleAddPayment = (months: number) => {
    const totalAmount = months * monthlyFee;
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white">
      <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block text-blue-600 xl:inline">EduPay</span>{" "}
              <span className="block xl:inline">Pembayaran Sekolah Digital</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
              Mudahkan pembayaran bulanan sekolah Anda dengan EduPay. Aman, cepat, dan efisien untuk orang tua dan sekolah.
            </p>
            <div className="mt-8 sm:mt-10">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <label htmlFor="nisn" className="block text-md font-medium text-gray-700">
                  Masukkan NISN
                </label>
                <input
                  type="text"
                  id="nisn"
                  name="nisn"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className="block w-full rounded-md border-gray-300 py-4 px-1 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cek Pembayaran
                </button>
              </form>
              {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 sm:w-96 p-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Detail Siswa</h2>
            {siswa && (
              <>
                <p className="mt-4 text-lg text-gray-500">Nama: {siswa.nama}</p>
                <p className="text-lg text-gray-500">Kelas: {siswa.kelas}</p>
              </>
            )}
            {paymentMonths.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-700">Bulan yang belum dibayar:</h3>
                <ul className="mt-2 text-gray-600">
                  {paymentMonths.map((month, index) => (
                    <li key={index} className="text-sm">{month}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleMidtransPayment(nisn)}
                  className="mt-6 inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Bayar Sekarang
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-lg text-gray-500">Semua pembayaran telah lunas!</p>
                <div className="mt-4">
                  <label htmlFor="additionalMonths" className="block text-sm font-medium text-gray-700">Tambah Pembayaran Bulan:</label>
                  <input
                    type="number"
                    id="additionalMonths"
                    value={additionalMonths}
                    onChange={(e) => setAdditionalMonths(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-md border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    onClick={() => handleAddPayment(additionalMonths)}
                    className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Bayar {additionalMonths} Bulan
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleModalClose}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

