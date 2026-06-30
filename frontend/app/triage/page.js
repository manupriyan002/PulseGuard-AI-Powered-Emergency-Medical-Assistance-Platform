import StitchScreen from "@/components/common/StitchScreen";

export const metadata = { title: "AI Triage — PulseGuard" };

export default function TriagePage() {
  return (
    <StitchScreen
      desktopSrc="/stitch-screens/desktop/ai-triage.html"
      mobileSrc="/stitch-screens/mobile/ai-triage.html"
      title="AI Triage"
    />
  );
}
