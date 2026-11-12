import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "LPU | LMS – Hostel Laundry Management System",
  description:
    "A Smart and Hassle-Free Digital Laundry Solution for Lovely Professional University Hostel Residents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F4FA] text-[#1A162B] antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
