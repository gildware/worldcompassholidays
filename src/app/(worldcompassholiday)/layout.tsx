import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { PublicHeader } from "@/components/worldcompassholiday/PublicHeader";
import "@/styles/worldcompassholiday-home.css";

export default function WorldCompassHolidayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorldCompassHolidayFrame>
      <div className="app-chrome-desktop">
        <PublicHeader overlay />
      </div>
      {children}
    </WorldCompassHolidayFrame>
  );
}
