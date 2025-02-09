"use client";
import "./globals.css";
import styles from "./page.module.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className={styles.header}>
          <button onClick={() => window.location.href = '/'}>
              Select Drive
          </button>
        </header>
        {children}
      </body>
    </html>
  );
}
