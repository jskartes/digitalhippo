import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import payload, { Payload } from "payload";
import type { InitOptions } from "payload/config";

interface Args { initOptions?: Partial<InitOptions> }

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const transport = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY
  }
});

let cachedPayloadClient = (global as any).payload;
if (!cachedPayloadClient)
  cachedPayloadClient = (global as any).payload = { client: null, promise: null };

export const getPayloadClient = async ({ initOptions }: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) throw new Error("PAYLOAD_SECRET is missing from .env");
  if (cachedPayloadClient.client) return cachedPayloadClient.client;
  if (!cachedPayloadClient.promise) cachedPayloadClient.promise = payload.init({
    email: {
      transport,
      fromAddress: "onboarding@resend.dev",
      fromName: "DigitalHippo"
    },
    secret: process.env.PAYLOAD_SECRET,
    local: initOptions?.express ? false : true,
    ...(initOptions || {})
  });

  try {
    cachedPayloadClient.client = await cachedPayloadClient.promise;
  } catch (error: unknown) {
    cachedPayloadClient.promise = null;
    throw error;
  }

  return cachedPayloadClient.client;
}
