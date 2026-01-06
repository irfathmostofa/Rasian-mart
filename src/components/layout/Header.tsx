// components/Header.tsx
"use client";
import { useSettings } from "@/app/store/useSettings";
import HeaderOne from "./HeaderComponent/HeaderOne";
import HeaderThree from "./HeaderComponent/HeaderThree";
import HeaderTwo from "./HeaderComponent/HeaderTwo";

export default function Header() {
  const { headerStyle } = useSettings();

  switch (headerStyle) {
    case 2:
      return <HeaderOne />;
    case 3:
      return <HeaderThree />;
    default:
      return <HeaderTwo />;
  }
}
