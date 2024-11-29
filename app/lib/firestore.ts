import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit
} from "firebase/firestore";

// Fetch student data by NISN
export const getSiswaByNisn = async (nisn: string) => {
  try {
    console.log("Fetching all student data...");

    const siswaRef = collection(db, "siswa");
    const querySnapshot = await getDocs(siswaRef);

    if (querySnapshot.empty) {
      console.log("No students found in the 'siswa' collection.");
      return null;
    }

    let siswaData = null;
    querySnapshot.forEach((doc) => {
      console.log(`Found student: ${doc.id}`, doc.data());
      if (doc.data().nisn === nisn) {
        siswaData = doc.data();
      }
    });

    if (!siswaData) {
      console.log(`No student found with NISN: ${nisn}`);
    }

    return siswaData;
  } catch (error) {
    console.error("Error fetching siswa data:", error);
    return null;
  }
};

// Check if the student has made a payment for a specific month and year
export async function checkPembayaran(nisn: string, month: string, year: number) {
  try {
    const pembayaranRef = collection(db, "pembayaran");
    const q = query(
      pembayaranRef,
      where("nisn", "==", nisn),
      where("month", "==", month),
      where("year", "==", year)
    );
    const querySnapshot = await getDocs(q);

    const payments = querySnapshot.docs.map((doc) => doc.data());
    return payments || [];
  } catch (error) {
    console.error("Error checking payment:", error);
    return [];
  }
}

// Save payment data to Firestore
export async function savePembayaran(data: {
  nisn: string;
  month: string;
  year: number;
  status: string;
}) {
  try {
    const pembayaranRef = collection(db, "pembayaran");
    await addDoc(pembayaranRef, data);
    console.log("Payment data saved successfully.");
  } catch (error) {
    console.error("Error saving payment data:", error);
  }
}

// Get the last payment made by the student
export async function getLastPayment(nisn: string) {
  try {
    const pembayaranRef = collection(db, "pembayaran");

    const q = query(
      pembayaranRef,
      where("nisn", "==", nisn),
      orderBy("year", "desc"),
      orderBy("month", "desc"),
      limit(1)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Check if no documents were found
    if (querySnapshot.empty) {
      console.log(`No payments found for student with NISN: ${nisn}`);
      return null; // Return null instead of throwing an error
    }

    // Extract the last payment data
    const lastPayment = querySnapshot.docs[0].data();
    return lastPayment;
  } catch (error) {
    console.error("Error fetching last payment:", error);
    throw new Error("Failed to fetch last payment. Please try again.");
  }
}

// Check the last payment made by the student
export async function checkLastPembayaran(nisn: string) {
  try {
    const pembayaranRef = collection(db, "pembayaran");

    const q = query(
      pembayaranRef,
      where("nisn", "==", nisn),
      orderBy("year", "desc"),
      orderBy("month", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No payments found for this student.");
    }

    const lastPayment = querySnapshot.docs[0].data();
    return lastPayment;
  } catch (error) {
    console.error("Error checking last payment:", error);
    throw new Error("Failed to check last payment. Please try again.");
  }
}

