"use client";

import { useEffect, useState } from "react";

interface Slot {
  id: number;
  starts_at: string;
  is_booked: boolean;
}

const API = "http://localhost:4020/bookings";

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch(`${API}/slots`);
    if (res.ok) setSlots(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function book(slotId: number) {
    setMsg("");
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, customerEmail: email || "guest@example.com" }),
    });
    const data = await res.json();
    setMsg(res.ok ? "booked!" : data.message || "could not book");
    load();
