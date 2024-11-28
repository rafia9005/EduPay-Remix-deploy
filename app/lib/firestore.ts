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
// Check if the student has made payments for a specific month and year
export async function checkPembayaran(nisn: string, month: string, year: number) {
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
}

// Save payment data to Firestore
export async function savePembayaran(data: {
  nisn: string;
  month: string;
  year: number;
  status: string;
}) {
  const pembayaranRef = collection(db, "pembayaran");
  await addDoc(pembayaranRef, data);
}


export async function getLastPayment(nisn: string) {
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
}
export async function checkLastPembayaran(nisn: string) {
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
}

