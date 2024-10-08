import { BadRequestException, Body, Controller, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Pool } from "pg";
import "reflect-metadata";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/booking_db",
});

@Controller("bookings")
class BookingController {
  @Get("slots")
  async listSlots() {
    return (await pool.query("SELECT * FROM slots ORDER BY starts_at ASC")).rows;
  }

  @Post("slots")
  async addSlot(@Body() body: { startsAt: string }) {
    return (await pool.query("INSERT INTO slots (starts_at) VALUES ($1) RETURNING *", [body.startsAt])).rows[0];
  }

  @Post()
  async bookSlot(@Body() body: { slotId: number; customerEmail: string }) {
    const client = await pool.connect();
    try {
