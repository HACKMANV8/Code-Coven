/// <reference path="../vite-env.d.ts" />

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
}

export class BluetoothService {
  private static device: any = null;
  private static server: any = null;

  static isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  static async requestDevice(): Promise<BluetoothDeviceInfo> {
    try {
      // Request Bluetooth device with common safety device services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
        ],
        optionalServices: ['battery_service', 'device_information'],
      });

      this.device = device;

      return {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: device.gatt?.connected || false,
      };
    } catch (error) {
      console.error('Bluetooth device request failed:', error);
      throw new Error('Failed to connect to Bluetooth device');
    }
  }

  static async connect(device?: any): Promise<void> {
    const targetDevice = device || this.device;
    
    if (!targetDevice) {
      throw new Error('No device available to connect');
    }

    try {
      this.server = await targetDevice.gatt!.connect();
      
      // Listen for disconnection
      targetDevice.addEventListener('gattserverdisconnected', this.onDisconnected);
      
      console.log('Connected to GATT server');
    } catch (error) {
      console.error('Connection failed:', error);
      throw new Error('Failed to connect to device');
    }
  }

  static async getBatteryLevel(): Promise<number | undefined> {
    if (!this.server) {
      return undefined;
    }

    try {
      const service = await this.server.getPrimaryService('battery_service');
      const characteristic = await service.getCharacteristic('battery_level');
      const value = await characteristic.readValue();
      
      return value.getUint8(0);
    } catch (error) {
      console.warn('Could not read battery level:', error);
      return undefined;
    }
  }

  static async listenForEmergencyTrigger(
    callback: () => void
  ): Promise<void> {
    if (!this.server) {
      throw new Error('Not connected to any device');
    }

    try {
      // Listen for heart rate changes (can be adapted for custom emergency button characteristic)
      const service = await this.server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as any;
        const value = target.value;
        
        // Example: trigger emergency if heart rate spikes above threshold
        // This can be customized based on your device's characteristics
        if (value) {
          const heartRate = value.getUint8(1);
          console.log('Heart rate:', heartRate);
          
          // Custom logic for emergency trigger
          // For demonstration, you'd implement your own device-specific logic here
        }
      });
    } catch (error) {
      console.error('Failed to listen for emergency trigger:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.server = null;
  }

  static getConnectedDevice(): BluetoothDeviceInfo | null {
    if (!this.device) {
      return null;
    }

    return {
      id: this.device.id,
      name: this.device.name || 'Unknown Device',
      connected: this.device.gatt?.connected || false,
    };
  }

  private static onDisconnected = () => {
    console.log('Device disconnected');
    this.server = null;
  };
}
