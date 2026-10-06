import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { GoTripFrame } from "@/components/gotrip/GoTripFrame";
import { PublicHeader } from "@/components/gotrip/PublicHeader";
import "@/styles/gotrip-home.css";

export default function GoTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoTripFrame>
      <PublicHeader overlay />
      {children}
    </GoTripFrame>
  );
}
