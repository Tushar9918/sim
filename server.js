const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let latestData = {};

// === MQTT Setup ===
const mqttClient = mqtt.connect('mqtt://broker.emqx.io:1883');

mqttClient.on('connect', () => {
  console.log('✅ MQTT Connected');
  mqttClient.subscribe('simcom');
});

mqttClient.on('message', (topic, message) => {
  try {
    latestData = JSON.parse(message.toString());
    console.log('📩 MQTT Payload:', latestData);
  } catch (err) {
    console.error('❌ Invalid JSON:', message.toString());
  }
});

// === REST Endpoint to serve latest data ===
app.get('/latest', (req, res) => {
  res.json(latestData);
});

// === Optional Route for Root ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Start Server (Render-Compatible Port) ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
