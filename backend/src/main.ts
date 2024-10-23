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
      await client.query("BEGIN");
      const slot = (await client.query("SELECT * FROM slots WHERE id = $1 FOR UPDATE", [body.slotId])).rows[0];
      if (!slot) throw new BadRequestException("slot not found");
      if (slot.is_booked) throw new BadRequestException("sorry, slot already booked!");

      await client.query("UPDATE slots SET is_booked = TRUE WHERE id = $1", [body.slotId]);
      const booking = (
        await client.query("INSERT INTO bookings (slot_id, customer_email) VALUES ($1, $2) RETURNING *", [
          body.slotId,
          body.customerEmail,
        ])
      ).rows[0];
      await client.query("COMMIT");
      return booking;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body() body: { status: "confirmed" | "cancelled" }) {
    return (
