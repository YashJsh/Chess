"use client";

import { sendHealthRequest } from "@/api/health.api";
import { useEffect } from "react";

export const HealthWarmup =  () => {
  useEffect(() => {
    sendHealthRequest();
  }, []);

  return null;
};