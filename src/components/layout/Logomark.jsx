import React from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import logoIcon from "../../app/assets/tradepeople-icon.png";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["700"] });

// Handshake icon plus the "TradePeople" wordmark. The wordmark is live text so
// it follows the theme (dark mode, inverted footer) instead of a fixed-color PNG.
const Logomark = ({ className = "h-8 w-8", inverted = false, showText = true }) => (
  <span className="inline-flex items-center gap-2">
    <span className={inverted ? "inline-flex rounded-md bg-white p-1" : "inline-flex"}>
      <Image
        src={logoIcon}
        alt={showText ? "" : "TradePeople"}
        className={`${className} object-contain`}
        priority
      />
    </span>
    {showText && (
      <span
        className={`${montserrat.className} text-xl font-bold tracking-tight ${
          inverted ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        TradePeople
      </span>
    )}
  </span>
);

export default Logomark;
