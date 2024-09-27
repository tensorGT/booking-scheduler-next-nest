"use client";

import { useEffect, useState } from "react";

interface Slot {
  id: number;
  starts_at: string;
  is_booked: boolean;
}

const API = "http://localhost:4020/bookings";

