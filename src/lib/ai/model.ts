import { google } from '@ai-sdk/google';

/**
 * AI Model Configuration
 * 
 * Foydalanuvchi faqat gemini-3-flash-preview modelidan foydalana oladi.
 * Bu model Google AI Studio orqali olingan API key bilan ishlaydi.
 * 
 * Eslatma: Bu model preview (sinov) rejimida bo'lib, tez-tez yangilanishi mumkin.
 */

// Faqat ishlaydigan model - gemini-3-flash-preview
export const AI_MODEL = google('gemini-3.1-flash-lite');

// Fallback ham shu model (boshqa model ishlamaydi)
export const AI_MODEL_FALLBACK_1 = google('gemini-3.1-flash-lite');
