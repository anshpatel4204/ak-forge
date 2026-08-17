/**
 * AK Forge — Contact & Onboarding form backend.
 *
 * What this does, for every form submission from the website:
 *   1. Appends a row to a Google Sheet (a running lead list you can open anytime).
 *   2. Emails Ansh (OWNER_EMAIL below) with the submission details.
 *   3. Sends an automatic "we got your message" reply to the person who submitted.
 *
 * No paid service, no API keys, no third-party account — just your own
 * Google account. See apps-script/README.md for the one-time setup steps.
 */

const OWNER_EMAIL = "anshpatel4204@gmail.com";
const BUSINESS_NAME = "AK Forge";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const formType = data._form === "onboarding-form" ? "Onboarding" : "Leads";

    appendToSheet(formType, data);
    notifyOwner(formType, data);
    autoReplyToSender(formType, data);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, message: "AK Forge form endpoint is live." });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------------- */
/* Sheet logging                                                     */
/* ---------------------------------------------------------------- */
function appendToSheet(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  const keys = Object.keys(data).filter((k) => !k.startsWith("_"));

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Timestamp", ...keys]);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", ...keys]);
    sheet.setFrozenRows(1);
  }

  // Keep columns aligned with whatever header row already exists.
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = header.map((h) => {
    if (h === "Timestamp") return new Date();
    return data[h] !== undefined ? data[h] : "";
  });
  sheet.appendRow(row);
}

/* ---------------------------------------------------------------- */
/* Email notifications                                               */
/* ---------------------------------------------------------------- */
function notifyOwner(formType, data) {
  const name = data.name || data.clientName || "Someone";
  const subject = `[${BUSINESS_NAME}] New ${formType === "Onboarding" ? "onboarding submission" : "contact message"} from ${name}`;
  const body = Object.keys(data)
    .filter((k) => !k.startsWith("_"))
    .map((k) => `${k}: ${data[k]}`)
    .join("\n");

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: subject,
    body: body,
  });
}

function autoReplyToSender(formType, data) {
  const email = data.email;
  if (!email) return;

  const name = data.name || data.clientName || "there";
  const subject =
    formType === "Onboarding"
      ? `Thanks for the details, ${name}! — ${BUSINESS_NAME}`
      : `We got your message, ${name}! — ${BUSINESS_NAME}`;

  const body =
    formType === "Onboarding"
      ? `Hi ${name},\n\nThanks for filling in your onboarding details — we've received everything and will confirm your timeline shortly.\n\nIf anything changes in the meantime, just reply to this email or message us on WhatsApp.\n\nBest,\nAnsh Patel\n${BUSINESS_NAME}\n+91 96624 26213`
      : `Hi ${name},\n\nThanks for reaching out to ${BUSINESS_NAME} — we've received your message and usually reply within 24 hours (often much faster).\n\nIf it's urgent, feel free to WhatsApp us directly at +91 96624 26213.\n\nBest,\nAnsh Patel\n${BUSINESS_NAME}`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
  });
}
