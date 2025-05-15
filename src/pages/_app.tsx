"use client";

import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { AuthProvider } from "~/providers/AuthProvider";
import { UserProvider } from "~/providers/UserProvider";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <div className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
        </div>
      </UserProvider>
    </AuthProvider>
  );
};

export default MyApp;
