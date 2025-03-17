import express from "express";
import { init_database } from "../../database/database";

export async function serveDatabase() {
  try {
    return await init_database();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}
