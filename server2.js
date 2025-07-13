const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 12000;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Twilio Credentials — replace with your own securely
const accountSid = 'AC7b247fa03a459a76e78e51852960eb58';
const authToken = '9f8185ad5bbecb0aeb322ca9ca096737';
const client = twilio(accountSid, authToken);

// POST /api/make-call — Initiate voice call via Twilio
app.post('/api/make-call', (req, res) => {
  let { phoneNumber } = req.body;

  // Basic validation
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing phoneNumber' });
  }

  // Ensure phone number starts with '+', else return error
  if (!phoneNumber.startsWith('+')) {
    return res.status(400).json({ message: 'Phone number must be in E.164 format starting with + and country code' });
  }

  console.log(`Attempting to call: ${phoneNumber}`);

  client.calls
    .create({
      to: phoneNumber,
      from: '+17089601342', // Your verified Twilio caller ID (change to your preferred verified number)
      url: 'http://demo.twilio.com/docs/voice.xml', // Twilio instructions for the call
    })
    .then(call => {
      console.log(`Call initiated with SID: ${call.sid}`);
      res.json({ message: 'Call initiated', callSid: call.sid });
    })
    .catch(error => {
      console.error('Error initiating call:', error.message);
      res.status(500).json({ message: 'Error initiating call', error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});