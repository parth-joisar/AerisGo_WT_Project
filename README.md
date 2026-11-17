# AerisGo

AerisGo is a static airline booking website with a staff operations dashboard.

## Open the project

- Customer booking flow: [WT_ParthJoisar/index.html](WT_ParthJoisar/index.html)
- Admin and staff sign-in: Open the passenger **Sign in** page and choose **Admin & Staff Portal**, or open [WT_ParthJoisar/admin.html](WT_ParthJoisar/admin.html) directly.

On the passenger sign-in page, choose **Use demo passenger account** to fill `passenger@example.com` and `passenger123` automatically. This is a static demo flow, not a real account authentication system.

The repository root opens the passenger landing page, which is served as the main website when hosted with GitHub Pages.

## Admin dashboard

The admin prototype includes operations analytics, flights, bookings, aircraft, crew, user management, and an interactive seat map. Admin records can be added and removed, with demo data saved in the browser's local storage.

This project is front-end only. Passenger sign-in, signup, password reset, and the 30-minute idle / 8-hour absolute session are demo-only browser flows. Account password hashes and sessions remain client-side and can be bypassed; real authentication, authorization, and storage require a secured backend. Do not use this prototype with real passenger or payment information.

## Publish with GitHub Pages

In the repository settings, open **Pages**, choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then save. GitHub Pages will serve the passenger landing page; the **Admin & Staff Portal** link on the customer sign-in screen opens the staff login. Both sites are plain HTML, CSS, and JavaScript, so no build step is needed.
