import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Confirmed",
  description: "Welcome to DreamTalk Premium! Your subscription is now active.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
