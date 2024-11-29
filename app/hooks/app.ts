  const handleMidtransPayment = async (nisn: string) => {
    const currentDate = new Date();
    const currentMonth = monthList[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const paymentId = uuidv4();
    const lastPayment = await getLastPayment(nisn);
    const overdueMonths = calculateOverdueMonths(lastPayment);
    const overdueCount = overdueMonths.length;
    const basePrice = 100000;
    const totalPrice = calculateTotalPrice(overdueCount, basePrice);

    try {
      const response = await axios.post(
        "https://edu-api-flax.vercel.app/api/payment",
        {
          paymentId,
          nisn,
          price: totalPrice,
          month: currentMonth,
          year: currentYear,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const { token } = response.data;
      if (token) {
        window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`;
      } else {
        console.error("Failed to get token from server");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

