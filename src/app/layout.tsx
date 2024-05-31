import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DigitalHippo",
  description: "Generated by create next app",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <body
        className={cn(
          "relative h-full antialiased",
          inter.className
        )}
      >
        <main className="relative flex flex-col min-h-screen">
          <Providers>
            <div className="flex-grow flex-1">
              <Navbar />
              {children}
            </div>
          </Providers>
        </main>
        <Toaster
          position="top-center"
          richColors
        />
      </body>
    </html>
  );
}

export default Layout;
