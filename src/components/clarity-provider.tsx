"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export function ClarityProvider() {
  useEffect(() => {
    if (localStorage.getItem("dev") === "true") return;
    Clarity.init(process.env.NEXT_PUBLIC_CLARITY_ID!);
  }, []);

  return null;
}
