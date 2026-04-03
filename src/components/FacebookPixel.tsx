import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const FacebookPixel = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
};

export default FacebookPixel;
