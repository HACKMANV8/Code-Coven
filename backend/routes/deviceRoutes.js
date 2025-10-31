import express from 'express';
import { 
  connectDevice, 
  getConnectedDevice, 
  disconnectDevice, 
  getAllDevices, 
  updateDeviceBattery 
} from '../controllers/deviceController.js';

const router = express.Router();

// Connect a device
router.post('/connect', connectDevice);

// Get connected device
router.get('/connected', getConnectedDevice);

// Disconnect device
router.put('/disconnect/:deviceId', disconnectDevice);

// Get all devices
router.get('/all', getAllDevices);

// Update device battery
router.put('/battery/:deviceId', updateDeviceBattery);

export default router;