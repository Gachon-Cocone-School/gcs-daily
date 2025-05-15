"use client";

import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { AuthProvider } from "~/providers/AuthProvider";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
};

export default MyApp;
