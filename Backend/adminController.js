import Admin from "../models/adminModel.js";

// GET ADMIN DETAILS
export const getAdmin = async (req, res) => {
  const admin = await Admin.findOne();
  if (!admin) {
    return res.status(200).json({ exists: false });
  }
  res.json({ exists: true, admin });
};

// CREATE DEFAULT ADMIN (CALL ONCE)
export const createDefaultAdmin = async (req, res) => {
  const exists = await Admin.findOne();
  if (exists) return res.json({ message: "Admin already exists" });

  const newAdmin = new Admin({
    email: "admin@gmail.com",
    password: "123"
  });

  await newAdmin.save();
  res.json({ message: "Default admin created" });
};

// RESET PASSWORD
export const resetAdminPassword = async (req, res) => {
  const { newPassword } = req.body;

  let admin = await Admin.findOne();
  admin.password = newPassword;
  await admin.save();

  res.json({ success: true, message: "Password updated" });
};
