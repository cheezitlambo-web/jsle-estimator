/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onPick: (data: { formattedAddress: string }) => void;
  placeholder?: string;
  className?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

export default function AddressAutocomplete({
  value,
  onPick,
  placeholder = "Address",
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acRef = useRef<any>(null);

  // Load Google Places script if needed
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps?.places) return;

    const key =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GMAPS_API_KEY;

    if (!key) return;

    const id = "js-google-places";
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    document.head.appendChild(script);
  }, []);

  // Attach autocomplete to input
  useEffect(() => {
    if (!inputRef.current) return;

    // If Google is ready and we haven't attached yet
    const tryInit = () => {
      if (!window.google?.maps?.places) return;

      acRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["formatted_address"],
          types: ["address"],
        }
      );

      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        const formattedAddress = place?.formatted_address || inputRef.current?.value || "";
        onPick({ formattedAddress });
      });
    };

    // Try immediately
    tryInit();

    // Also observe for when the script finishes loading later
    let poll: number | undefined;
    if (!acRef.current) {
      poll = window.setInterval(() => {
        if (window.google?.maps?.places) {
          tryInit();
          if (poll) window.clearInterval(poll);
        }
      }, 200);
    }

    return () => {
      if (poll) window.clearInterval(poll);
    };
  }, [onPick]);

  return (
    <input
      ref={inputRef}
      className={`border rounded p-2 w-full ${className}`}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={(e) => {
        // If user typed manually and didn't select a suggestion, still pass it up
        if (!e.currentTarget.value) return;
        onPick({ formattedAddress: e.currentTarget.value });
      }}
    />
  );
}
