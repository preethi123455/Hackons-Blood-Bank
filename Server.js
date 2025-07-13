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

// 🌐 Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

// 🔧 Setup upload folder
const uploadPath = path.join(__dirname, "uploads/documents");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 📂 File Storage Config
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

const MONGO_URI = "mongodb+srv://preethiusha007:hvvhoiyI9veeJSVN@cluster0.cadjnlq.mongodb.net/grocery?retryWrites=true&w=majority&appName=Cluster0";

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

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  documentPath: String, // 🔍 Relative path like 'uploads/documents/xyz.pdf'
}, { timestamps: true });
const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

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

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  aadhar: { type: String, required: true },
  bloodType: { type: String, required: true },
  phone: { type: String, required: true },
}, { timestamps: true });
const Donor = mongoose.model("Donor", donorSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "obupreethig.23cse@kongu.edu",
    pass: "yapl lbak jons ihtg",
  },
});

app.post("/signup", upload.single("pdf"), async (req, res) => {
  const { name, email, password, role } = req.body;
  const documentPath = req.file ? `uploads/documents/${req.file.filename}` : null;

  try {
    const userExists = await User.findOne({ email });
    const pendingExists = await PendingUser.findOne({ email });

    if (userExists || pendingExists) {
      return res.status(400).json({ success: false, message: "User already registered or pending approval" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await new PendingUser({ name, email, password: hashed, role, documentPath }).save();

    res.status(202).json({ success: true, message: "Signup request sent. Awaiting admin approval." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});


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
    const { name, location, aadhar, bloodType, phone } = req.body;
    if (!name || !location || !aadhar || !bloodType || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const newDonor = new Donor({ name, location, aadhar, bloodType, phone });
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
        from: "obupreethig.23cse@kongu.edu",
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});