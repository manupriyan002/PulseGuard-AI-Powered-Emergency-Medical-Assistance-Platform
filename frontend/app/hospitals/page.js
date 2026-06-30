import StitchScreen from "@/components/common/StitchScreen";

export const metadata = { title: "Hospital Finder — PulseGuard" };

export default function HospitalsPage() {
  return (
    <StitchScreen
      desktopSrc="/stitch-screens/desktop/hospital-finder.html"
      mobileSrc="/stitch-screens/mobile/hospital-finder.html"
      title="Hospital Finder"
    />
  );
}
