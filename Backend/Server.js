const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8000;

let adminOtpStore = {}; // { email: OTP }

// 🌐 Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json({ limit: "10mb" })); // increase payload limit for base64 if needed

// 🔧 Setup upload folder (still used for temporary storage if uploading files directly)
const uploadPath = path.join(__dirname, "uploads/documents");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 📂 File Storage Config (kept for compatibility)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or image files are allowed"), false);
    }
  },
});

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
});
const User = mongoose.model("User", userSchema);

// PendingUser stores documents as base64 (existing)
const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },

  documentBase64: String,
  documentName: String,
  documentType: String,
}, { timestamps: true });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

// New: PendingDonor schema (donor must be approved by admin to move into Donor collection)
const pendingDonorSchema = new mongoose.Schema({
  name: String,
  location: String,
  aadharBase64: String,
  aadharType: String,
  aadharName: String,
  bloodType: String,
  phone: String,
  age: Number,
  gender: String,
  weight: Number,
  lastDonation: Date,
  email: String,
  medicalConditions: String,
}, { timestamps: true });

const PendingDonor = mongoose.model("PendingDonor", pendingDonorSchema);

// Donor schema (approved donors; includes aadhar fields)
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  aadharBase64: { type: String },
  aadharType: { type: String },
  aadharName: { type: String },
  bloodType: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  weight: { type: Number, required: true },
  lastDonation: { type: Date },
  email: { type: String, required: true },
  medicalConditions: { type: String },
}, { timestamps: true });

const Donor = mongoose.model("Donor", donorSchema);

const bloodBankSchema = new mongoose.Schema({
  name: String,
  location: String,
  bloodAvailability: [
    {
      bloodGroup: String,
      units: Number,
      history: [
        {
          date: { type: Date, default: Date.now },
          change: Number,
        },
      ],
    },
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
});
const BloodBank = mongoose.model("BloodBank", bloodBankSchema);


const requestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    bloodGroup: { type: String, required: true },

    attendeeName: { type: String, required: true },
    attendeeMobile: { type: String, required: true },

    bloodType: { type: String, required: true },
    quantity: { type: String, required: true },
    requiredDate: { type: String, required: true },

    city: { type: String, required: true },
    donationLocation: { type: String, required: true },

    requisitionFile: { type: String, default: '' },
  },
  { timestamps: true }
);

const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', requestSchema);


const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const Admin = mongoose.model("Admin", adminSchema);

(async function createAdmin() {
  try {
    const adminEmail = "praneeshc.23cse@kongu.edu";
    const adminPassword = "123";

    const exists = await Admin.findOne({ email: adminEmail });
    if (!exists) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await new Admin({
        name: "Admin",
        email: adminEmail,
        password: hashed
      }).save();

      console.log("✅ Admin created in 'admins' collection");
    } else {
      console.log("ℹ️ Admin already exists in 'admins' collection");
    }
  } catch (err) {
    console.error("Admin creation failed:", err);
  }
})();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "praneesh582@gmail.com",
    pass: "lfqw qowx gfvt bpsq",
  },
});

// ------------------ Signup (PendingUser) ------------------
app.post("/signup", upload.single("pdf"), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const pendingExists = await PendingUser.findOne({ email });

    if (userExists || pendingExists) {
      return res.status(400).json({ success: false, message: "User already registered or pending approval" });
    }

    let documentBase64 = null, documentName = null, documentType = null;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      documentBase64 = fileBuffer.toString("base64");
      documentName = req.file.originalname;
      documentType = req.file.mimetype;

      // Delete file after converting
      fs.unlinkSync(req.file.path);
    }

    const hashed = await bcrypt.hash(password, 10);

    await new PendingUser({
      name,
      email,
      password: hashed,
      role,
      documentBase64,
      documentName,
      documentType
    }).save();

    res.status(202).json({ success: true, message: "Signup request sent. Awaiting admin approval." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

// ------------------ Donor pending submission (new) ------------------
app.post("/api/donors-pending", async (req, res) => {
  try {
    const {
      name, location, aadharBase64, aadharType, aadharName,
      bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions
    } = req.body;

    if (!name || !location || !bloodType || !phone || !age || !gender || !weight || !email) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const pending = new PendingDonor({
      name, location, aadharBase64, aadharType, aadharName,
      bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions
    });

    await pending.save();
    res.status(201).json({ success: true, message: "Donor request sent for admin approval" });
  } catch (err) {
    console.error("Donor pending error:", err);
    res.status(500).json({ success: false, message: "Failed to submit donor request" });
  }
});

// Keep older POST /api/donors (if you still want direct creation) - unchanged but optional to keep
app.post("/api/donors", async (req, res) => {
  try {
    const { name, location, aadhar, bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions } = req.body;
    if (!name || !location || !aadhar || !bloodType || !phone || !age || !gender || !weight || !email) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }
    const newDonor = new Donor({ name, location, aadharBase64: null, aadharType: null, aadharName: aadhar, bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions });
    await newDonor.save();
    res.status(201).json({ message: "Donor registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// ------------------ Get pending donors (for admin) ------------------
app.get("/api/pending-donors", async (req, res) => {
  try {
    const pending = await PendingDonor.find({});
    res.json({ success: true, pendingDonors: pending });
  } catch (err) {
    console.error("Fetch pending donors error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch pending donors" });
  }
});

// ------------------ Get pending donors document (download/view) ------------------
app.get("/api/pending-donors/document/:id", async (req, res) => {
  try {
    const donor = await PendingDonor.findById(req.params.id);
    if (!donor || !donor.aadharBase64) {
      return res.status(404).json({ message: "Document not found" });
    }
    const fileBuffer = Buffer.from(donor.aadharBase64, "base64");

    res.set({
      "Content-Type": donor.aadharType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${donor.aadharName || "aadhar"}"`,
    });

    res.send(fileBuffer);
  } catch (err) {
    console.error("Pending donor document error:", err);
    res.status(500).json({ message: "Failed to fetch document" });
  }
});

// ------------------ Get pending user document (existing route) ------------------
app.get("/api/pending-users/document/:id", async (req, res) => {
  try {
    const user = await PendingUser.findById(req.params.id);
    if (!user || !user.documentBase64) {
      return res.status(404).json({ message: "Document not found" });
    }

    const fileBuffer = Buffer.from(user.documentBase64, "base64");

    res.set({
      "Content-Type": user.documentType,
      "Content-Disposition": `attachment; filename="${user.documentName}"`,
    });

    res.send(fileBuffer);

  } catch (err) {
    console.error("Pending user document error:", err);
    res.status(500).json({ message: "Failed to fetch document" });
  }
});

// ------------------ Approve Donor ------------------
app.post("/api/approve-donor/:id", async (req, res) => {
  try {
    const pending = await PendingDonor.findById(req.params.id);
    if (!pending) return res.status(404).json({ success: false, message: "Pending donor not found" });

    const approved = new Donor({
      name: pending.name,
      location: pending.location,
      aadharBase64: pending.aadharBase64,
      aadharType: pending.aadharType,
      aadharName: pending.aadharName,
      bloodType: pending.bloodType,
      phone: pending.phone,
      age: pending.age,
      gender: pending.gender,
      weight: pending.weight,
      lastDonation: pending.lastDonation,
      email: pending.email,
      medicalConditions: pending.medicalConditions,
    });

    await approved.save();
    await PendingDonor.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Donor approved and added to donors collection" });
  } catch (err) {
    console.error("Approve donor error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ Reject Donor ------------------
app.delete("/api/reject-donor/:id", async (req, res) => {
  try {
    await PendingDonor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Donor rejected and removed" });
  } catch (err) {
    console.error("Reject donor error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ Existing endpoints for users, admins, bloodbanks etc. ------------------
// (I kept the rest of your earlier routes mostly as-is. Add them back or keep already present ones.)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });
    res.status(200).json({
      success: true,
      message: "Login successful",
      role: user.role,
      userId: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ Admin forgot/reset OTP routes (unchanged) ------------------
app.post("/admin-forgot-password", async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json({ success: false, message: "Admin not found" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
  adminOtpStore[email] = otp;

  const mailOptions = {
    from: "praneesh582@gmail.com",
    to: email,
    subject: "Admin Password Reset OTP",
    text: `Your OTP for resetting your password is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch {
    res.json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/admin-verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!adminOtpStore[email])
    return res.json({ success: false, message: "No OTP generated" });

  if (adminOtpStore[email] != otp)
    return res.json({ success: false, message: "Invalid OTP" });

  res.json({ success: true, message: "OTP verified successfully" });
});

app.post("/admin-reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json({ success: false, message: "Admin not found" });

  const hashed = await bcrypt.hash(newPassword, 10);

  await Admin.updateOne({ email }, { password: hashed });

  delete adminOtpStore[email];

  res.json({ success: true, message: "Password reset successful" });
});

// ------------------ Pending users fetch & approve/reject (existing) ------------------
app.get("/api/pending-users", async (req, res) => {
  try {
    const pending = await PendingUser.find({});
    res.json({ success: true, pendingUsers: pending });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/approve-user/:id", async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) return res.status(404).json({ success: false, message: "Pending user not found" });

    const user = await new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    }).save();

    if (pendingUser.role === "Donor(BloodBank)") {
      const [branchName, branchArea] = pendingUser.name.split(" - ");
      await new BloodBank({
        name: branchName || pendingUser.name,
        location: branchArea || "Unknown",
        bloodAvailability: [],
        userId: user._id,
        email: user.email,
      }).save();
    }

    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User approved and added to database" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/reject-user/:id", async (req, res) => {
  try {
    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User rejected and removed from pending list" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ------------------ Fetch all approved donors ------------------
app.get("/api/donors", async (req, res) => {
  try {
    const donors = await Donor.find({});
    res.status(200).json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donors" });
  }
});
app.post("/register-bloodbank", async (req, res) => {
  const { name, bloodAvailability, userId, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const existing = await BloodBank.findOne({ userId });
    if (existing) {
      const updatedAvailability = bloodAvailability.map((newEntry) => {
        const oldEntry = existing.bloodAvailability.find((b) => b.bloodGroup === newEntry.bloodGroup);
        const oldUnits = oldEntry?.units || 0;
        const unitDifference = newEntry.units - oldUnits;
        let updatedHistory = [...(oldEntry?.history || [])];

        if (unitDifference > 0) {
          updatedHistory.push({ date: new Date(), change: unitDifference });
        } else if (unitDifference < 0) {
          let remainingToRemove = -unitDifference;
          while (remainingToRemove > 0 && updatedHistory.length > 0) {
            const first = updatedHistory[0];
            if (first.change <= remainingToRemove) {
              remainingToRemove -= first.change;
              updatedHistory.shift();
            } else {
              first.change -= remainingToRemove;
              remainingToRemove = 0;
            }
          }
        }

        return {
          bloodGroup: newEntry.bloodGroup,
          units: newEntry.units,
          history: updatedHistory,
        };
      });
      existing.bloodAvailability = updatedAvailability;
      await existing.save();
      return res.status(200).json({ success: true, message: "Blood bank data updated (FIFO)" });
    }

    const withHistory = bloodAvailability.map((entry) => ({
      ...entry,
      history: entry.units > 0 ? [{ date: new Date(), change: entry.units }] : [],
    }));

    const newBank = new BloodBank({
      name,
      location: "Unknown",
      bloodAvailability: withHistory,
      userId,
      email,
    });

    await newBank.save();
    res.status(201).json({ success: true, message: "Blood bank registered" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Blood bank registration failed" });
  }
});

app.get("/api/filter-bloodbanks", async (req, res) => {
  const { bloodGroup, date } = req.query;

  try {
    const banks = await BloodBank.find({});
    const filtered = banks.map((bank) => {
      const matched = bank.bloodAvailability.filter((entry) => {
        const groupMatch =
          !bloodGroup || entry.bloodGroup.toLowerCase() === bloodGroup.toLowerCase();
        const dateMatch =
          !date ||
          entry.history?.some((h) => {
            const histDate = new Date(h.date).toISOString().split("T")[0];
            return histDate === date;
          });
        return groupMatch && dateMatch;
      });

      return matched.length > 0
        ? {
            _id: bank._id,
            name: bank.name,
            location: bank.location,
            email: bank.email,
            bloodAvailability: matched,
          }
        : null;
    });

    const result = filtered.filter((b) => b !== null);
    res.json({ success: true, bloodBanks: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/fetch-bloodbank", async (req, res) => {
  const { userId } = req.query;
  try {
    const bank = await BloodBank.findOne({ userId });
    if (!bank) return res.json({ success: true, bloodAvailability: [] });
    const plainData = bank.bloodAvailability.map(b => ({ bloodGroup: b.bloodGroup, units: b.units }));
    res.json({ success: true, bloodAvailability: plainData });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/fetch-all-bloodbanks", async (req, res) => {
  try {
    const banks = await BloodBank.find({});
    res.json({ success: true, bloodBanks: banks });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/donors", async (req, res) => {
  try {
    const { name, location, aadhar, bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions } = req.body;
    if (!name || !location || !aadhar || !bloodType || !phone || !age || !gender || !weight || !email) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }
    const newDonor = new Donor({ name, location, aadhar, bloodType, phone, age, gender, weight, lastDonation, email, medicalConditions });
    await newDonor.save();
    res.status(201).json({ message: "Donor registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/api/donors", async (req, res) => {
  try {
    const donors = await Donor.find({});
    res.status(200).json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donors" });
  }
});

app.get("/api/pending-users", async (req, res) => {
  try {
    const pending = await PendingUser.find({});
    res.json({ success: true, pendingUsers: pending });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/approve-user/:id", async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) return res.status(404).json({ success: false, message: "Pending user not found" });

    const user = await new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    }).save();

    if (pendingUser.role === "Donor(BloodBank)") {
      const [branchName, branchArea] = pendingUser.name.split(" - ");
      await new BloodBank({
        name: branchName || pendingUser.name,
        location: branchArea || "Unknown",
        bloodAvailability: [],
        userId: user._id,
        email: user.email,
      }).save();
    }

    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User approved and added to database" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/reject-user/:id", async (req, res) => {
  try {
    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User rejected and removed from pending list" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/emergency-request", async (req, res) => {
  const { recipientName, bloodGroup, units, hospitalAddress, mobileNumber, place } = req.body;
  if (!recipientName || !bloodGroup || !units || !hospitalAddress || !mobileNumber || !place) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const matchingBanks = await BloodBank.find({ location: new RegExp(place, "i") });
    if (matchingBanks.length === 0) {
      return res.status(404).json({ message: "No blood banks found in this location" });
    }
    let sentTo = [];
    for (const bank of matchingBanks) {
      if (!bank.email || bank.email.trim() === "") continue;
      const mailOptions = {
        from: "praneesh582@gmail.com",
        to: bank.email,
        subject: "⛑ Emergency Blood Request",
        text: `Emergency blood request:\n\nRecipient: ${recipientName}\nBlood Group: ${bloodGroup}\nUnits: ${units}\nHospital: ${hospitalAddress}\nPhone: ${mobileNumber}\nLocation: ${place}\n\nPlease respond if you can help.`
      };
      try {
        await transporter.sendMail(mailOptions);
        sentTo.push({ name: bank.name, email: bank.email });
      } catch (emailError) {
        console.error(`Failed to send to ${bank.email}`);
      }
    }
    res.status(200).json({
      message: `Emergency request sent to ${sentTo.length} blood bank(s).`,
      sentTo
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/', (req, res) => {
  res.send('🩸 Blood Request API is live and healthy!');
});

app.post('/api/request-blood', async (req, res) => {
  try {
    const {
      patientName, gender, dob, bloodGroup,
      attendeeName, attendeeMobile,
      bloodType, quantity, requiredDate,
      city, donationLocation, requisitionFile,
    } = req.body;

    if (
      !patientName || !gender || !dob || !bloodGroup ||
      !attendeeName || !attendeeMobile ||
      !bloodType || !quantity || !requiredDate ||
      !city || !donationLocation
    ) {
      return res.status(400).json({ message: '⚠️ All required fields must be filled.' });
    }

    const newRequest = new BloodRequest({
      patientName,
      gender,
      dob,
      bloodGroup,
      attendeeName,
      attendeeMobile,
      bloodType,
      quantity,
      requiredDate,
      city,
      donationLocation,
      requisitionFile: requisitionFile || '',
    });

    const savedRequest = await newRequest.save();
    console.log('Blood request saved:', savedRequest);

    res.status(201).json({
      message: 'Blood request submitted successfully!',
      data: savedRequest,
    });

  } catch (error) {
    console.error('POST error:', error.message);
    res.status(500).json({ message: 'Failed to submit request.', error: error.message });
  }
});

app.get('/api/request-history', async (req, res) => {
  try {
    const history = await BloodRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ data: history });
  } catch (error) {
    console.error('GET /request-history error:', error.message);
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});