import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe to Premium",
  description:
    "Unlock unlimited recording time with WakeAndTalk Premium. Choose monthly or lifetime access to capture every detail of your dreams.",
  openGraph: {
    title: "Subscribe to Premium | WakeAndTalk",
    description:
      "Unlock unlimited recording time with WakeAndTalk Premium. Choose monthly or lifetime access to capture every detail of your dreams.",
  },
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
