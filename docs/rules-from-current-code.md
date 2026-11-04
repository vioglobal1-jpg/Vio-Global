# VIO rebuild: rules taken from the current code

Decision 2026-11-04: test the business at no extra cost. Keep Google Sheets and Apps Script, fix them, and add a free customer website on viosourcing.com. Paid hosting ($45/month estimate) is deferred until regular orders, the 100-a-day email limit or speed require it. Code lives in GitHub vioglobal1-jpg/Vio-Global.

Done in the live app: order columns and Order_Events tab, required email, Source_Origin, freight by origin, In Sourcing status, stock quantities, stock and recommendation editing, publish off by default, RFQ photos visible to admins.

Source: the 5 Apps Script files sent on 2026-11-04, plus the live "VIO - Product Database" column structure.
Trading name in the code: VIO Trading. Domain bought: viosourcing.com.

## Keep exactly

### Supplier costing (vioComputeQuote_)
- Carton mode: cartons = ceil(qty / pcs per carton). CBM per carton = L x W x H / 1,000,000. Total CBM = CBM per carton x cartons.
- Manual mode: enter total CBM (sea) or chargeable KG (air) directly.
- Air gross KG = qty x weight per piece + cartons x packaging KG per carton.
- Volumetric KG = total CBM x 1,000,000 / divisor. Divisor is the Air_Volumetric_Divisor_CM3_Per_KG setting, default 6000.
- Chargeable KG = larger of gross and volumetric. Measure = CBM for sea, chargeable KG for air.
- Freight USD = measure x active rate. Latest active rate wins per origin + destination + mode + goods type.
- Supplier USD = qty x unit price x USD per unit of the supplier currency.
- Landed USD = supplier USD + freight USD. Landed local = landed USD / USD per local unit. Landed unit = landed local / qty.
- Selling unit = landed unit / (1 - margin %). Selling total = selling unit x qty. Margin must stay below 100%.
- Lead days = production days + maximum transit days of the rate.

### Exchange rates
- Daily refresh at hour 7 from open.er-api.com (USD base) for AED, EGP, CNY, SAR, USD.
- A manual override beats the fetched rate.
- Supplier currencies: USD, CNY, AED, EGP.

### Quote workflow
- Save offer: creates supplier quote (Draft) and customer quote (Pending Approval). Quantity must be at least supplier MOQ.
- Admin only: Approve, Request Changes or Reject. Non-approval needs a reason of at least 5 characters.
- Only approved quotes can be sent. Emailed PDF in English or Arabic. Sending sets RFQ status to Quoted.
- Revisions create a new quote linked to the parent, with a reason. Same quantity only; quantity changes need new costing.
- Selling price below landed cost is blocked. Accepted quotes are locked.
- Customer decisions: Accepted, Rejected, Revision Requested (with counteroffer and message).
- Accepted quote converts to one sales order only.
- Customer PDF never shows supplier, cost or margin. Default validity 7 days.

### Orders
- Status: Confirmed, In Production, Ready to Ship, In Transit, Delivered, Closed, Cancelled.
- Payment: Unpaid, Partially Paid, Paid, derived from amount paid against order total (0.01 tolerance).
- Shipment: Not Shipped, Booked, In Transit, Delivered. Delivered shipment needs order Delivered or Closed.
- Every change writes an order event.

### Roles
- Admin: everything, including approvals, sending, permissions, exchange rates.
- Buyer: RFQs, products, stock, costing, messages, orders. Cannot approve or send.
- Logistics: rates, lead times, landed-cost calculator (no save).
- Viewer: read limited data.

### Public and customer rules
- Request form limits: 5 photos, 5 MB each, JPG/PNG/WEBP checked by file signature. Quantity 1 to 100,000,000.
- Duplicate submit protection through a submission key.
- Customers match by phone, then email.
- Email sign-in code: 6 digits, stored hashed, 10 minute expiry, 5 attempts, 60 second resend gap. 12 hour session.
- Public catalog returns customer-safe fields only. Supplier identity and cost never leave the admin.
- Customer photos stay private. Product media are public.
- Quote PDF contact block: 29 Al Nasr Street, New Maadi, Cairo; +20 107 000 0604; WhatsApp QR.

## Fix in the rebuild

1. Order conversion is broken on the live data. The Order_Events tab does not exist and Sales_Orders lacks the columns the code writes, so setupVIOOperations appears never to have run. Conversion would add an incomplete row, then fail. The customer order view filters on RFQ_ID, which is also missing.
2. Quotes exclude customs, clearance and local delivery by design. Decision: keep goods plus international freight, label it clearly, and add optional customs and delivery lines.
3. Lead_Time_Settings is ignored by quotes. Customs and delivery days are hard-coded to 0, so that settings page has no effect on quotes.
4. Quotes accept no origin. vioActiveRate_ defaults to China, so Egypt or UAE sourcing cannot be costed. Add origin to the RFQ and the costing.
5. Request form allows Egypt or UAE only as destination, though 9 countries are configured.
6. Stock quantity is overwritten to 1 or 0 by the later updateStockItem. Track real quantity and reserved quantity by warehouse.
7. Customers without email cannot sign in or receive quotes. Sending fails with "Customer email missing or invalid".
8. Photos are tied to personal Google accounts. Admin runs as each user, so private RFQ photos appear unreadable to other admins, and the public stock photo folder sits in a personal Drive. Use central storage.
9. RFQ status stays New until a quote is sent, even when a quote exists. Show one status derived from the workflow.
10. Customer rejection is recorded differently from the portal and the admin.
11. Public form and sign-in code have no global rate limit, so anyone could use up the daily email quota.
12. Team members need access to the whole spreadsheet, including supplier costs and sign-in records.
13. saveStockItem and updateStockItem are defined twice. The older copies are dead code.
14. Recommendations have no editor for name, category or description, and names default to "Product VIO-PRD-...".

## Existing data
31 tabs, test data only so far. Real reference data to carry over: exchange rates, freight routes, lead times, countries, permissions.
