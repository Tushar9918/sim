const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

let latestData = {};

const mqttClient = mqtt.connect('mqtt://broker.emqx.io:1883');

mqttClient.on('connect', () => {
  console.log('✅ MQTT Connected');
  mqttClient.subscribe('simcom');
});

mqttClient.on('message', (topic, message) => {
  try {
    latestData = JSON.parse(message.toString());
    console.log('📩 MQTT Message:', latestData);
  } catch (e) {
    console.error('⚠️ Invalid JSON');
  }
});

app.get('/latest', (req, res) => {
  res.json(latestData);
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
