const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://preethiusha007:hvvhoiyI9veeJSVN@cluster0.cadjnlq.mongodb.net/grocery?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('connected', () => console.log('MongoDB connected successfully'));
db.on('error', (err) => console.error('MongoDB connection error:', err.message));

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
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});
