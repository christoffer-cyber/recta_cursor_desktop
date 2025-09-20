export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <title>Recta Rapport - Print</title>
      </head>
      <body className="print-body">
        {children}
      </body>
    </html>
  );
}
