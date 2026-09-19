// Seeds demo data so the app looks meaningful immediately, and so the
// duplicate-detection feature has something to demonstrate.
// Run with: npm run seed  (make sure MONGO_URI in .env is reachable first)
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Issue = require("../models/Issue");
const Notification = require("../models/Notification");
const { fallbackAnalyze } = require("../services/aiService");

const DEMO_STUDENT_PASSWORD = "student123";
const DEMO_ADMIN_PASSWORD = "admin123";

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in backend/.env - cannot seed.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  await Promise.all([User.deleteMany({}), Issue.deleteMany({}), Notification.deleteMany({})]);

  const [studentPasswordHash, admin1Hash, student2Hash, student3Hash] = await Promise.all([
    bcrypt.hash(DEMO_STUDENT_PASSWORD, 10),
    bcrypt.hash(DEMO_ADMIN_PASSWORD, 10),
    bcrypt.hash(DEMO_STUDENT_PASSWORD, 10),
    bcrypt.hash(DEMO_STUDENT_PASSWORD, 10),
  ]);

  const student = await User.create({
    name: "Aditi Sharma",
    email: "student@campusfix.com",
    password: studentPasswordHash,
    role: "student",
    campus: "Main Campus",
  });

  const student2 = await User.create({
    name: "Rahul Verma",
    email: "rahul@campusfix.com",
    password: student2Hash,
    role: "student",
    campus: "Main Campus",
  });

  const student3 = await User.create({
    name: "Priya Nair",
    email: "priya@campusfix.com",
    password: student3Hash,
    role: "student",
    campus: "Main Campus",
  });

  const admin = await User.create({
    name: "Admin User",
    email: "admin@campusfix.com",
    password: admin1Hash,
    role: "admin",
    campus: "Main Campus",
  });

  const issuesData = [
    {
      title: "Water Leakage in Hostel A",
      description: "There is continuous water leakage near the Hostel A entrance. The floor is wet and slippery.",
      location: "Hostel A",
      reportedBy: student._id,
      status: "In Progress",
    },
    {
      title: "Water leaking near Hostel A washroom",
      description: "Pipe leaking outside the Hostel A common washroom, water is spreading on the floor.",
      location: "Hostel A",
      reportedBy: student2._id,
      status: "In Progress",
    },
    {
      title: "Hostel A has a pipe leakage",
      description: "There's a broken pipe near Hostel A causing water to leak continuously near the entrance.",
      location: "Hostel A",
      reportedBy: student3._id,
      status: "In Progress",
    },
    {
      title: "Broken fan in Block B classroom",
      description: "The ceiling fan in Block B, room 204 is not working and makes a loud noise when switched on.",
      location: "Block B, Room 204",
      reportedBy: student._id,
      status: "Assigned",
    },
    {
      title: "WiFi not working in Library",
      description: "The WiFi router near the library reading hall has been down for two days, students cannot connect.",
      location: "Library",
      reportedBy: student2._id,
      status: "Reported",
    },
    {
      title: "Street light not working near Main Gate",
      description: "The street light near the main gate has been off for a week, making the area unsafe at night.",
      location: "Main Gate",
      reportedBy: student3._id,
      status: "Resolved",
    },
    {
      title: "Cleanliness issue in Hostel C corridor",
      description: "Garbage has not been collected from the Hostel C corridor for several days and it smells bad.",
      location: "Hostel C",
      reportedBy: student._id,
      status: "Reported",
    },
    {
      title: "Electrical issue in Lab 2",
      description: "One of the power sockets in Lab 2 sparked when a laptop charger was plugged in.",
      location: "Lab 2",
      reportedBy: student2._id,
      status: "Assigned",
    },
  ];

  const createdIssues = [];
  for (const data of issuesData) {
    const analysis = fallbackAnalyze(data);
    const issue = await Issue.create({
      ...data,
      category: analysis.category,
      severity: analysis.severity,
      priority: analysis.priority,
      department: analysis.department,
      aiAnalysis: { ...analysis, analyzedAt: new Date() },
    });
    createdIssues.push(issue);
  }

  // Link the two duplicate "Hostel A water leakage" reports to the first one (the master).
  const master = createdIssues[0];
  const dup1 = createdIssues[1];
  const dup2 = createdIssues[2];
  dup1.duplicateOf = master._id;
  dup2.duplicateOf = master._id;
  master.duplicateCount = 3;
  master.priority = 9;
  master.severity = "High";
  await Promise.all([dup1.save(), dup2.save(), master.save()]);

  await Notification.create([
    { user: student._id, issue: master._id, message: "Your issue has been resolved.", type: "resolved", read: false },
    { user: student._id, issue: createdIssues[3]._id, message: "Your issue has been assigned to the Maintenance department.", type: "assigned", read: false },
    { user: student2._id, issue: dup1._id, message: 'We found a similar issue already reported ("Water Leakage in Hostel A"). Your report has been linked to it.', type: "duplicate", read: true },
  ]);

  console.log("\nSeed complete!\n");
  console.log("Demo accounts:");
  console.log(`  Student: student@campusfix.com / ${DEMO_STUDENT_PASSWORD}`);
  console.log(`  Admin:   admin@campusfix.com / ${DEMO_ADMIN_PASSWORD}`);
  console.log(`\nCreated ${createdIssues.length} demo issues (including a duplicate cluster on Hostel A water leakage).`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
