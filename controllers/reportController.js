// routes/reportRoutes.js

const pool = require("../config/db");   // apna DB connection
const PDFDocument =  require("pdfkit");



const generateReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. User details
    const [userResult] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult[0];

    // 2. User logs
    const [logs] = await pool.query("SELECT * FROM logs WHERE user_id = ? ORDER BY date DESC", [userId]);

    // 3. Create PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${user.name}_report.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("MoodMinder Report", { align: "center" });
    doc.moveDown();

    // User Info
    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`User ID: ${user.id}`);
    doc.moveDown();

    // Logs Summary
    doc.fontSize(16).text("Activity Logs:", { underline: true });
    logs.forEach((log, i) => {
      doc.moveDown(0.5);
      doc.fontSize(12).text(
        `${i + 1}. ${new Date(log.date).toLocaleDateString()} - ${log.task_title}`
      );
      doc.text(`   Time Spent: ${log.time_spent} min`);
      doc.text(`   Mood: ${log.mood}, Energy: ${log.energy_level}`);
      if (log.notes) doc.text(`   Notes: ${log.notes}`);
    });

    // Suggestion section
    doc.moveDown();
    doc.fontSize(16).text("Suggestions:", { underline: true });
    if (logs.length > 0) {
      const latest = logs[0];
      let suggestion = "Keep tracking your logs for insights!";
      if (latest.mood === "sad") suggestion = "Try relaxation, meditation, or talking with a friend.";
      if (latest.mood === "neutral") suggestion = "Go for a walk or listen to music for refreshment.";
      if (latest.mood === "happy") suggestion = "Keep doing what makes you happy 🎉.";
      if (latest.energy_level === "low") suggestion += " Take a short nap or have a healthy snack.";
      if (latest.energy_level === "high") suggestion += " Great time to focus on important tasks!";

      doc.fontSize(12).text(suggestion);
    } else {
      doc.fontSize(12).text("No logs found to generate suggestions.");
    }

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

module.exports = {generateReport};
