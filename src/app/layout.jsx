import '@/styles/globals.css';

export const metadata = {
  title: 'LaundryMate — Hostel Laundry Management System',
  description: 'Clean, modern, and professional hostel laundry management for students and staff.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f8faf9] text-gray-900">
        {children}
      </body>
    </html>
  );
}
