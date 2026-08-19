import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import { join } from "path";

const root = process.cwd();
const imagePath = join(root, "docs", "employee-request-workflow.png");
const outputPath = join(root, "docs", "Employee-Request-Workflow-Part1.pdf");
const outputPathAlt = join(
  root,
  "docs",
  "Employee-Request-Workflow-Part1-fixed.pdf",
);
const publicOutputPath = join(
  root,
  "public",
  "docs",
  "Employee-Request-Workflow-Part1.pdf",
);

function writePdf(target: string) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 48, bottom: 48, left: 48, right: 48 },
    });
    const stream = createWriteStream(target);
    doc.pipe(stream);

    doc
      .fillColor("#0f4c5c")
      .fontSize(20)
      .text("Employee Request Management System", { align: "left" });
    doc.moveDown(0.3);
    doc
      .fillColor("#52525b")
      .fontSize(11)
      .text("Part 1 — Workflow Design Deliverable", { align: "left" });
    doc.moveDown(1);

    doc.fillColor("#18181b").fontSize(14).text("1. Overview");
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .fillColor("#3f3f46")
      .text(
        "The organization currently handles employee requests (leave, IT support, payroll, operations) across fragmented channels such as email, SMS, WhatsApp, and chat. This workflow consolidates those inputs into one Employee Request Management System so every request is visible, owned, timed against an SLA, and archived for reporting.",
        { align: "justify", lineGap: 2 },
      );
    doc.moveDown(0.5);
    doc.text(
      "In the proof of concept, the web portal is implemented. Email, WhatsApp, and SMS are designed to enter the same unified API in later phases.",
      { align: "justify", lineGap: 2 },
    );

    doc.moveDown(1);
    doc.fillColor("#18181b").fontSize(14).text("2. Workflow Diagram");
    doc.moveDown(0.4);

    const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const imageHeight = 250;
    doc.image(imagePath, {
      fit: [maxWidth, imageHeight],
      align: "center",
    });

    doc.addPage();
    doc.fillColor("#18181b").fontSize(14).text("3. Lifecycle Details");
    doc.moveDown(0.5);
    const lifecycle = [
      "Intake — Employee submits via the portal (name, email, subject, description, priority). Future channels map into the same create-request API.",
      "ID generation — System creates a unique alphanumeric code (EMP-xxxxx) and a database row with audit history.",
      "Categorization — Keyword rules classify the request into HR, IT, Payroll, Operations, or Other.",
      "Assignment — The least-loaded agent in that department becomes the ticket owner.",
      "Status OPEN — Request is logged and waiting to be worked.",
      "SLA check — If first-response or resolution SLA is breached, escalate to the department lead.",
      "Status ACTIVE — An agent starts working on the request.",
      "Resolve — The issue is addressed with the employee.",
      "Status FINALIZED — Work is complete and verified.",
      "Archive — The record remains in the database for reporting; it is not deleted.",
    ];

    lifecycle.forEach((item, index) => {
      doc
        .fillColor("#0f4c5c")
        .fontSize(10)
        .text(`${index + 1}. `, { continued: true });
      doc.fillColor("#3f3f46").text(item, { lineGap: 2 });
      doc.moveDown(0.35);
    });

    doc.moveDown(0.8);
    doc.fillColor("#18181b").fontSize(14).text("4. Status Model");
    doc.moveDown(0.4);
    doc
      .fillColor("#3f3f46")
      .fontSize(11)
      .text("OPEN  →  ACTIVE  →  FINALIZED", { align: "left" });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .text(
        "Open: submitted but not yet worked. Active: agent is working the ticket. Finalized: resolved and kept for reporting.",
        { align: "justify", lineGap: 2 },
      );

    doc.moveDown(1);
    doc.fillColor("#18181b").fontSize(14).text("5. SLA Reference");
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = doc.page.margins.left;
    const col2 = col1 + 120;
    const col3 = col2 + 150;

    doc.fontSize(10).fillColor("#0f4c5c");
    doc.text("Priority", col1, tableTop);
    doc.text("First response", col2, tableTop);
    doc.text("Resolution", col3, tableTop);
    doc
      .moveTo(col1, tableTop + 14)
      .lineTo(col1 + maxWidth, tableTop + 14)
      .strokeColor("#d4d4d8")
      .stroke();

    const rows = [
      ["Low", "8 hours", "48 hours"],
      ["Medium", "4 hours", "24 hours"],
      ["High", "1 hour", "8 hours"],
      ["Critical", "30 minutes", "4 hours"],
    ];

    rows.forEach((row, index) => {
      const y = tableTop + 24 + index * 20;
      doc.fillColor("#3f3f46").text(row[0], col1, y);
      doc.text(row[1], col2, y);
      doc.text(row[2], col3, y);
    });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

async function main() {
  const created: string[] = [];

  try {
    await writePdf(outputPath);
    created.push(outputPath);
  } catch (error) {
    console.warn("Could not overwrite main docs PDF (file may be open). Writing alternate file.");
    await writePdf(outputPathAlt);
    created.push(outputPathAlt);
  }

  await writePdf(publicOutputPath);
  created.push(publicOutputPath);
  console.log(`Created:\n- ${created.join("\n- ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
