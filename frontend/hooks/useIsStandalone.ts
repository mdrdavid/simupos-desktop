import { useState, useEffect } from "react";

export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          (window.navigator as { standalone?: boolean }).standalone === true)
      );
    };

    setIsStandalone(checkStandalone());
  }, []);

  return isStandalone;
}
