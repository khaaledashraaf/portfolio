"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export function ClarityProvider() {
  useEffect(() => {
    Clarity.init("w0gg6s5mwe");
  }, []);

  return null;
}
