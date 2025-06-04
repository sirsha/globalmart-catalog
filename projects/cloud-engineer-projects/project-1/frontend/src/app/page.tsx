import RepairShopMain from "@/components/main/Main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickFix Repair Shop Management",
  description: "Professional repair shop management system with job tracking, priority management, and customer information",
  keywords: "repair shop, management, nextjs, tailwindcss, job tracking, maintenance",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <RepairShopMain />
    </main>
  );
}