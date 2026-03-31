# Saucedemo.com — Critical Workflow Manual Test Report

**Date:** 2026-03-31  
**Tester:** GitHub Copilot (Playwright MCP)  
**URL:** https://www.saucedemo.com  
**Browser:** Playwright Chromium

---

## Summary

All critical happy-path flows passed. Two edge-case login scenarios (locked-out user and invalid credentials) returned the correct error messages. Non-blocking console errors related to a third-party error reporting service and a missing `autocomplete` attribute were observed.

---

## Scenario 1 — Valid Login (Happy Path)

- **Steps Taken:**
  1. Navigated to `https://www.saucedemo.com`.
  2. Entered username `standard_user` and password `secret_sauce`.
  3. Clicked **Login**.

- **Outcome:** Redirected to `/inventory.html` — Products page loaded with 6 items listed (Sauce Labs Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt (Red)). A product sort dropdown (Name A–Z, Name Z–A, Price low–high, Price high–low) was available.

- **Issues Found:** None.

---

## Scenario 2 — Add to Cart

- **Steps Taken:**
  1. Clicked **Add to cart** on **Sauce Labs Backpack** ($29.99).
  2. Clicked **Add to cart** on **Sauce Labs Bolt T-Shirt** ($15.99).
  3. Observed cart badge and button state changes.

- **Outcome:**
  - Cart badge in the header updated to **"2"** after each addition.
  - "Add to cart" buttons toggled to **"Remove"** for added items — indicating correct state management.
  - Remaining items retained their "Add to cart" buttons unchanged.

- **Issues Found:** None.

---

## Scenario 3 — View Cart

- **Steps Taken:**
  1. Navigated to `/cart.html`.

- **Outcome:**
  - Cart displayed both items with quantity 1 each:
    - Sauce Labs Backpack — $29.99
    - Sauce Labs Bolt T-Shirt — $15.99
  - "Continue Shopping" and "Checkout" buttons were present.

- **Issues Found:** None.

---

## Scenario 4 — Checkout (End-to-End)

- **Steps Taken:**
  1. Clicked **Checkout** from the cart page → redirected to `/checkout-step-one.html`.
  2. Filled in: First Name = `Test`, Last Name = `User`, Zip/Postal Code = `12345`.
  3. Clicked **Continue** → redirected to `/checkout-step-two.html` (Order Overview).
  4. Verified order summary:
     - Item total: $45.98 ✅ ($29.99 + $15.99)
     - Tax: $3.68
     - Total: $49.66
     - Payment: SauceCard #31337
     - Shipping: Free Pony Express Delivery!
  5. Clicked **Finish** → redirected to `/checkout-complete.html`.

- **Outcome:** 
  - Confirmation page displayed heading **"Thank you for your order!"** with the Pony Express image.
  - Cart badge was removed from the header (cart cleared after order).
  - A **Back Home** button was available to return to the inventory.

- **Issues Found:** None.

---

## Scenario 5 — Logout

- **Steps Taken:**
  1. Clicked the hamburger **Open Menu** button.
  2. Clicked **Logout** from the side navigation.

- **Outcome:** Redirected back to `/` (login page). Session was terminated correctly.

- **Issues Found:** None.

---

## Scenario 6 — Locked-Out User (Error Handling)

- **Steps Taken:**
  1. Entered username `locked_out_user` and password `secret_sauce`.
  2. Clicked **Login**.

- **Outcome:** Remained on the login page. Error message displayed:  
  > _"Epic sadface: Sorry, this user has been locked out."_

- **Issues Found:** None — error handling works as expected.

---

## Scenario 7 — Invalid Credentials (Error Handling)

- **Steps Taken:**
  1. Entered username `wrong_user` and password `wrong_password`.
  2. Clicked **Login**.

- **Outcome:** Remained on the login page. Error message displayed:  
  > _"Epic sadface: Username and password do not match any user in this service"_

- **Issues Found:** None — error handling works as expected.

---

## Console Errors Observed

| Severity | Description | Impact |
|----------|-------------|--------|
| VERBOSE  | `<input>` elements missing `autocomplete` attribute (password field). Suggested value: `"current-password"` | Low — browser autofill hint only; no functional impact |
| ERROR    | CORS policy blocked fetch to `https://submit.backtrace.io/UNIVERSE/TOKEN/json` (×2 occurrences) | Low — third-party error reporting service is misconfigured or unavailable; no impact on user-facing functionality |

> **Note:** The `backtrace.io` CORS errors indicate the site's crash reporting integration is broken (placeholder `UNIVERSE/TOKEN` in the URL suggests a misconfigured API endpoint). This does not affect any user-facing functionality but means error telemetry is silently failing.

---

## Overall Result

| Flow | Result |
|------|--------|
| Valid login | ✅ Pass |
| Product listing | ✅ Pass |
| Add to cart (badge + button state) | ✅ Pass |
| Cart review | ✅ Pass |
| Checkout (info → overview → confirmation) | ✅ Pass |
| Order total calculation | ✅ Pass |
| Logout | ✅ Pass |
| Locked-out user error | ✅ Pass |
| Invalid credentials error | ✅ Pass |

**All critical workflows passed.** The only issues found are non-functional: a missing `autocomplete` hint on the password field (accessibility/UX concern) and broken third-party error telemetry (backtrace.io CORS error).
