import { test, expect } from "@playwright/test";

const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

test("homepage advertises standalone e-signing and defaults to USD", async ({ page }) => {
 await page.goto(base);
 await expect(page.getByRole("link", { name: /Request an E-Signature/i })).toBeVisible();
 await expect(page.getByText("Only need a signature? Skip the proposal.")).toBeVisible();
 await expect(page.locator("#pricing select")).toHaveValue("US");
});

test("standalone signing requires login to create a request", async ({ page }) => {
 await page.goto(`${base}/signatures/new`);
 await expect(page).toHaveURL(/\/login/);
});

test("invalid public signing token fails safely", async ({ page }) => {
 await page.goto(`${base}/sign/${"a".repeat(64)}`);
 await expect(page.getByText("Signing link unavailable")).toBeVisible();
});

test("public signing API rejects invalid token", async ({ request }) => {
 const response = await request.get(`${base}/api/signatures/invalid-token`);
 expect(response.status()).toBe(404);
 const payload = await response.json();
 expect(payload.error).toBeTruthy();
});

test("unauthenticated signature creation is denied", async ({ request }) => {
 const response = await request.post(`${base}/api/signatures`, {
  multipart: {
   title: "Test Agreement",
   signer_name: "Test Client",
   signer_email: "test@example.com",
   file: { name: "test.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") },
  },
 });
 expect(response.status()).toBe(401);
});

test("mobile homepage shows a usable e-sign entry", async ({ page, isMobile }) => {
 test.skip(!isMobile, "mobile-only assertion");
 await page.goto(base);
 await expect(page.getByRole("button", { name: /Open menu/i })).toBeVisible();
 await page.getByRole("button", { name: /Open menu/i }).click();
 await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "E-Signatures" })).toBeVisible();
 await expect(page.getByRole("link", { name: /Request an E-Signature/i })).toBeVisible();
});

test("signature evidence cannot be read without owner authentication", async ({ request }) => {
 const response = await request.get(`${base}/api/signatures/evidence/00000000-0000-0000-0000-000000000000`);
 expect(response.status()).toBe(401);
});

test("signed PDF owner download requires authentication", async ({ request }) => {
 const response = await request.get(`${base}/api/signatures/download/00000000-0000-0000-0000-000000000000`);
 expect(response.status()).toBe(401);
});

test("signed PDF public download rejects invalid tokens", async ({ request }) => {
 const response = await request.get(`${base}/api/signatures/invalid-token/download`);
 expect(response.status()).toBe(404);
});
