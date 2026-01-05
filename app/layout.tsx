export const metadata = {
  title: 'GPT Gemini Proxy',
  description: 'Proxy API for ChatGPT to Gemini Vision',
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
