import SrollTop from "../components/common/ScrollTop";
import ClientProviders from "../components/common/ClientProviders";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import "swiper/css/effect-cards";
import "aos/dist/aos.css";
import "../styles/index.scss";
import "rc-slider/assets/index.css";

export const metadata = {
  title: "GoTrip - Travel & Tour Booking System",
  description: "Next.js Travel Booking System Template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="./favicon.ico" />
      </head>
      <body>
        <main>
          <ClientProviders>
            {children}
            <SrollTop />
          </ClientProviders>
        </main>
      </body>
    </html>
  );
}
