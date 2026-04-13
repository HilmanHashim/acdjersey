import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const FacebookPixel = () => {
  return null;
};

export default FacebookPixel;
