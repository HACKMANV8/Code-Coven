import Device from '../models/deviceModel.js';

// Connect/Register a new device
export const connectDevice = async (req, res) => {
  try {
    const { deviceId, deviceName, deviceType, macAddress } = req.body;

    // Check if device already exists
    let device = await Device.findOne({ deviceId });

    if (device) {
      // Update existing device
      device.deviceName = deviceName;
      device.lastConnected = Date.now();
      device.isConnected = true;
      await device.save();
      return res.status(200).json({ message: 'Device reconnected successfully', device });
    }

    // Create new device
    device = await Device.create({
      deviceId,
      deviceName,
      deviceType,
      macAddress,
      isConnected: true,
      lastConnected: Date.now()
    });

    res.status(201).json({ message: 'Device connected successfully', device });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting device', error: error.message });
  }
};

// Get connected device
export const getConnectedDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ isConnected: true }).sort({ lastConnected: -1 });
    
    if (!device) {
      return res.status(404).json({ message: 'No device connected' });
    }

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching device', error: error.message });
  }
};

// Disconnect device
export const disconnectDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    device.isConnected = false;
    await device.save();

    res.status(200).json({ message: 'Device disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error disconnecting device', error: error.message });
  }
};

// Get all devices (history)
export const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ lastConnected: -1 });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error: error.message });
  }
};

// Update device battery level
export const updateDeviceBattery = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { batteryLevel } = req.body;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    device.batteryLevel = batteryLevel;
    await device.save();

    res.status(200).json({ message: 'Battery level updated', device });
  } catch (error) {
    res.status(500).json({ message: 'Error updating battery', error: error.message });
  }
};