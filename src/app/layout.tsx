import "./globals.css";

export const metadata = {
  title: "IELTS App",
  description: "Study and track IELTS progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
