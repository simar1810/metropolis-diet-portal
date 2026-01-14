"use client"
import { useEffect } from "react";

export default function Modal({
  onClose,
  className,
  children
}) {

  function handleClickOutside(e) {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  useEffect(function () {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto"
    }
  }, [])

  return <div
    onClick={handleClickOutside}
    className={`fixed h-screen w-screen bg-[#0000008D] z-[1000] top-0 left-0 ${className}`}
  >
    {children}
  </div>
}