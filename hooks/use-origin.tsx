import { useState } from "react";

const useOrigin = () => {
  const [isMounted, setIsMounted] = useState(false);
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  if (!isMounted) {
    return "";
  }
  return origin;
};

export default useOrigin;
