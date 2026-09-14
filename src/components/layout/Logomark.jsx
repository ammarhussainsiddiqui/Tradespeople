import React from "react";

const Logomark = ({ className = "h-8 w-8", inverted = false }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="28"
      height="28"
      rx="8"
      className={inverted ? "fill-primary-foreground" : "fill-primary"}
    />
    <circle cx="21.5" cy="19.5" r="7" className="fill-accent" />
  </svg>
);

export default Logomark;
