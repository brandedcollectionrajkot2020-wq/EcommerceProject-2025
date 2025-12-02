"use client";
import { useState } from "react";

export function States() {
  const [auth, setAuth] = useState(false);
  return { auth, setAuth };
}
