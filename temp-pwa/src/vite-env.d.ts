/// <reference types="vite/client" />

// Web Heart Rate API types
interface SensorOptions {
  frequency?: number;
}

interface Sensor extends EventTarget {
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: number | null;
  start(): void;
  stop(): void;
  addEventListener(type: 'reading' | 'error', listener: (ev: Event) => void): void;
}

interface HeartRateSensor extends Sensor {
  readonly heartRate: number | null;
}

interface HeartRateSensorConstructor {
  new (options?: SensorOptions): HeartRateSensor;
}

interface Window {
  HeartRateSensor?: HeartRateSensorConstructor;
  Sensor?: {
    new (options?: SensorOptions): Sensor;
  };
}

// Web Bluetooth API types
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
  }

  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[];
    name?: string;
    namePrefix?: string;
  }

  type BluetoothServiceUUID = number | string;

  interface BluetoothDevice extends EventTarget {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: 'gattserverdisconnected', listener: (ev: Event) => void): void;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: BluetoothServiceUUID): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    value?: DataView;
    readValue(): Promise<DataView>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: 'characteristicvaluechanged', listener: (ev: Event) => void): void;
  }
}

export {};
