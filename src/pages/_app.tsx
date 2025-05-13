"use client";

import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { AuthProvider } from "~/providers/AuthProvider";
import { UserProvider } from "~/providers/UserProvider";
import { TeamProvider } from "~/providers/TeamProvider";

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
        <TeamProvider>
          <div className={`${inter.variable} font-sans`}>
            <Component {...pageProps} />
          </div>
        </TeamProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default MyApp;
