import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Learn & Earn - Educational Game for Kids",
  description: "A fun educational game where kids learn math and English while earning rewards for screen time and Roblox credits.",
  keywords: ["kids education", "math games", "english learning", "educational app", "rewards system", "parent dashboard"],
  authors: [{ name: "Learn & Earn Team" }],
  openGraph: {
    title: "Learn & Earn - Educational Game",
    description: "Make learning fun! Kids earn rewards while mastering math and English skills.",
    url: "https://learnandearn.app",
    siteName: "Learn & Earn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn & Earn - Educational Game",
    description: "Make learning fun! Kids earn rewards while mastering math and English skills.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
