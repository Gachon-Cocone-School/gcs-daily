import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#111827",
            p: {
              marginTop: "1.25em",
              marginBottom: "1.25em",
            },
            "h1, h2, h3, h4": {
              letterSpacing: "-0.025em",
              fontWeight: "700",
            },
            h1: {
              fontSize: "2.25rem",
              marginTop: "2em",
              marginBottom: "1em",
            },
            h2: {
              fontSize: "1.875rem",
              marginTop: "1.75em",
              marginBottom: "0.75em",
            },
            h3: {
              fontSize: "1.5rem",
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            "ul > li": {
              paddingLeft: "1.75em",
              position: "relative",
            },
            "ul > li::before": {
              content: '""',
              width: "0.375em",
              height: "0.375em",
              position: "absolute",
              top: "calc(0.875em - 0.1875em)",
              left: "0.25em",
              borderRadius: "50%",
              backgroundColor: "#9CA3AF",
            },
            a: {
              color: "#2563EB",
              textDecoration: "underline",
              textDecorationColor: "rgba(37, 99, 235, 0.4)",
              fontWeight: "500",
              "&:hover": {
                color: "#1D4ED8",
                textDecorationColor: "rgba(29, 78, 216, 0.6)",
              },
            },
            strong: {
              color: "#111827",
              fontWeight: "700",
            },
            code: {
              color: "#111827",
              backgroundColor: "#F3F4F6",
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
              paddingTop: "0.125rem",
              paddingBottom: "0.125rem",
              borderRadius: "0.375rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "#F3F4F6",
              color: "#111827",
              overflowX: "auto",
              fontWeight: "400",
            },
            blockquote: {
              color: "#4B5563",
              borderLeftColor: "#D1D5DB",
              borderLeftWidth: "4px",
              paddingLeft: "1em",
              marginLeft: "0",
              fontStyle: "italic",
            },
            table: {
              width: "100%",
              marginTop: "2em",
              marginBottom: "2em",
              textAlign: "left",
            },
            "thead th": {
              paddingBottom: "0.75em",
              fontWeight: "600",
              color: "#111827",
              borderBottomWidth: "1px",
              borderColor: "#E5E7EB",
            },
            "tbody td": {
              paddingTop: "0.75em",
              paddingBottom: "0.75em",
              borderBottomWidth: "1px",
              borderColor: "#E5E7EB",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
