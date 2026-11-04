
function setupVIODatabase() {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const tabs = {
    "01_China_Products": [
      "Product_ID", "Created_At", "Product_Name",
      "Category", "Description", "Specifications",
      "Image_URL", "Video_URL", "Supplier_ID",
      "Purchase_Price", "Currency", "MOQ",
      "Lead_Time_Days", "Status", "Created_By"
    ],

    "02_Egypt_Stock": [
      "Product_ID", "Created_At", "Product_Name",
      "Category", "Description", "Image_URL",
      "Available_Qty", "Reserved_Qty", "MOQ",
      "Selling_Price", "Currency", "Warehouse",
      "Status", "Last_Updated"
    ],

    "03_Dubai_Stock": [
      "Product_ID", "Created_At", "Product_Name",
      "Category", "Description", "Image_URL",
      "Available_Qty", "Reserved_Qty", "MOQ",
      "Selling_Price", "Currency", "Warehouse",
      "Status", "Last_Updated"
    ],

    "04_Customer_Requests": [
      "Request_ID", "Created_At", "Customer_ID",
      "Customer_Name", "Phone", "Country",
      "Product_Name", "Description", "Image_URL",
      "Reference_Link", "Target_Price", "Currency",
      "Requested_Qty", "Required_Date",
      "Notes", "Status", "Assigned_To"
    ],

    "05_Price_Inquiries": [
      "RFQ_ID", "Created_At", "Customer_ID",
      "Product_ID", "Product_Source", "Requested_Qty",
      "Destination_Country", "Target_Price",
      "Currency", "Shipping_Mode", "Notes",
      "Status", "Assigned_To"
    ],

    "06_Sourcing_Activities": [
      "Sourcing_ID", "RFQ_ID", "Request_ID",
      "Supplier_ID", "Created_At", "Buyer",
      "Supplier_Price", "Currency", "MOQ",
      "Lead_Time_Days", "Shipping_Cost",
      "Landed_Cost", "Status", "Notes"
    ],

    "07_Quotations": [
      "Quotation_ID", "RFQ_ID", "Request_ID",
      "Customer_ID", "Created_At", "Valid_Until",
      "Currency", "Subtotal", "Shipping_Cost",
      "Total_Value", "Payment_Terms",
      "Delivery_Terms", "Status", "Prepared_By"
    ],

    "08_Quotation_Items": [
      "Quotation_Item_ID", "Quotation_ID",
      "Product_ID", "Product_Name", "Quantity",
      "Unit_Price", "Currency", "Line_Total"
    ],

    "09_Customer_Decisions": [
      "Decision_ID", "Quotation_ID", "Customer_ID",
      "Decision_Date", "Decision", "Reason",
      "Notes", "Recorded_By"
    ],

    "10_Sales_Orders": [
      "Order_ID", "Quotation_ID", "Customer_ID",
      "Order_Date", "Country", "Currency",
      "Total_Value", "Payment_Status",
      "Order_Status", "Expected_Delivery",
      "Created_By"
    ],

    "11_Order_Items": [
      "Order_Item_ID", "Order_ID", "Product_ID",
      "Product_Name", "Quantity", "Unit_Price",
      "Currency", "Line_Total"
    ],

    "12_Payments": [
      "Payment_ID", "Order_ID", "Customer_ID",
      "Payment_Date", "Amount", "Currency",
      "Payment_Method", "Reference",
      "Status", "Notes"
    ],

    "13_Shipments": [
      "Shipment_ID", "Order_ID", "Created_At",
      "Origin_Country", "Destination_Country",
      "Shipping_Company", "Shipping_Mode",
      "Tracking_Number", "Shipped_Date",
      "Expected_Arrival", "Actual_Arrival",
      "Shipping_Cost", "Currency", "Status"
    ],

    "14_Customers": [
      "Customer_ID", "Created_At", "Customer_Name",
      "Company_Name", "Phone", "Email",
      "Country", "City", "Address",
      "Customer_Type", "Status", "Notes"
    ],

    "15_Suppliers": [
      "Supplier_ID", "Created_At", "Supplier_Name",
      "Country", "City", "Contact_Name",
      "Phone", "Email", "Category",
      "Payment_Terms", "Lead_Time_Days",
      "Status", "Notes"
    ],

    "16_Activity_Log": [
      "Log_ID", "Timestamp", "User",
      "Action", "Module", "Record_ID",
      "Old_Value", "New_Value", "Notes"
    ],

    "17_Settings": [
      "Setting_ID", "Setting_Type",
      "Setting_Value", "Display_Name",
      "Active", "Sort_Order"
    ]
  };

  let created = 0;
  let existing = 0;

  Object.keys(tabs).forEach(function(name) {

    let sheet = ss.getSheetByName(name);

    if (sheet) {
      existing++;
      return;
    }

    sheet = ss.insertSheet(name);

    const headers = tabs[name];

    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers]);

    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#C6A052")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");

    sheet.setFrozenRows(1);

    sheet.getRange(1, 1, sheet.getMaxRows(), headers.length)
      .createFilter();

    sheet.setColumnWidths(1, headers.length, 160);

    sheet.setRowHeight(1, 35);

    created++;
  });

  Logger.log("Created tabs: " + created);
  Logger.log("Already existing: " + existing);
  Logger.log("VIO Database Setup Completed");
}

function simplifyVIOTabNames() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    const oldName = sheet.getName();
    const newName = oldName.replace(/^\d{2}_/, "");

    if (oldName !== newName) {
      const existing = ss.getSheetByName(newName);

      if (!existing) {
        sheet.setName(newName);
        Logger.log("Renamed: " + newName);
      } else {
        Logger.log("Skipped (already exists): " + newName);
      }
    }
  });

  Logger.log("Finished simplifying tab names");
}

function createVIOAdditionalTabs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const tabs = {
    "Permissions": [
      "User_ID", "Name", "Email", "Role",
      "Access_Modules", "Receive_Notifications",
      "Status", "Created_At", "Notes"
    ],

    "Shipping_Rates": [
      "Rate_ID", "Origin_Country", "Destination_Country",
      "Shipping_Mode", "Goods_Classification",
      "Shipping_Company", "Rate", "Currency",
      "Rate_Unit", "Minimum_Charge",
      "Transit_Days", "Effective_From",
      "Effective_To", "Status", "Notes"
    ]
  };

  Object.keys(tabs).forEach(function(name) {
    let sheet = ss.getSheetByName(name);

    if (sheet) {
      Logger.log("Already exists: " + name);
      return;
    }

    sheet = ss.insertSheet(name);

    const headers = tabs[name];

    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setBackground("#C6A052")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");

    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 35);
    sheet.setColumnWidths(1, headers.length, 170);

    sheet.getRange(
      1, 1, sheet.getMaxRows(), headers.length
    ).createFilter();

    Logger.log("Created: " + name);
  });

  // Add initial VIO admin
  const permissions = ss.getSheetByName("Permissions");

  const existingEmails = permissions.getLastRow() > 1
    ? permissions.getRange(
        2, 3, permissions.getLastRow() - 1, 1
      ).getValues().flat()
    : [];

  if (!existingEmails.some(email =>
      String(email).trim().toLowerCase() ===
      "vioglobal1@gmail.com")) {

    permissions.appendRow([
      "VIO-USER-001",
      "VIO Admin",
      "vioglobal1@gmail.com",
      "Admin",
      "All",
      "Yes",
      "Active",
      new Date(),
      "Main VIO administrator"
    ]);
  }

  Logger.log("VIO additional tabs setup completed");
}
