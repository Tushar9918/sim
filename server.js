const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
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

// === Serve latest data ===
app.get('/latest', (req, res) => {
  res.json(latestData);
});

// === Serve dashboard HTML ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ === Reset route (sends MQTT command) ===
app.post('/reset', (req, res) => {
  mqttClient.publish('simcom/reset', '1');
  console.log('🔁 Reset command sent via MQTT');
  res.send('Reset command sent to SIM7600');
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
