// Test validation and duplicate registration logic
const { registerStudent, loginStudent, getStoredStudents } = require('./lib/supabase/authService');

async function runTests() {
  console.log("Starting registration unit tests...");

  // 1. Test duplicate regNo
  try {
    await registerStudent({
      fullName: "Duplicate User",
      regNo: "12345678", // already exists
      hostel: "BH-3 (Boys Hostel 3)",
      hostelBlock: "Block B-32",
      roomNumber: "210",
      email: "duplicate.test@lpu.in",
      phone: "9876543210",
      password: "password123",
    });
    console.error("FAIL: Expected duplicate error for regNo 12345678");
  } catch (err) {
    console.log("PASS: Duplicate registration number correctly blocked:", err.message);
  }

  // 2. Test duplicate email
  try {
    await registerStudent({
      fullName: "Duplicate Email User",
      regNo: "99998888",
      hostel: "BH-3 (Boys Hostel 3)",
      hostelBlock: "Block B-32",
      roomNumber: "210",
      email: "akshay.12345678@lpu.in", // already exists
      phone: "9876543210",
      password: "password123",
    });
    console.error("FAIL: Expected duplicate error for email");
  } catch (err) {
    console.log("PASS: Duplicate email correctly blocked:", err.message);
  }

  // 3. Test successful registration with unique student
  const testRegNo = "121" + Math.floor(10000 + Math.random() * 90000);
  const testEmail = `student.${testRegNo}@lpu.in`;
  try {
    const newStudent = await registerStudent({
      fullName: "Kabir Verma",
      regNo: testRegNo,
      hostel: "BH-5 (Boys Hostel 5)",
      hostelBlock: "Block C-14",
      roomNumber: "305",
      email: testEmail,
      phone: "9812345678",
      password: "securePassword123",
    });
    console.log("PASS: Registered new student successfully:", newStudent.name, newStudent.regNo, newStudent.email);
    console.log("Wallet initial balance:", newStudent.walletBalance);

    // Verify student can now login
    const loggedIn = await loginStudent({
      regNoOrEmail: testRegNo,
      password: "securePassword123",
    });
    console.log("PASS: New student logged in successfully:", loggedIn.name);
  } catch (err) {
    console.error("FAIL: Registration of new student failed:", err.message);
  }
}

runTests();

