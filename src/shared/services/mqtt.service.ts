import mqtt, { MqttClient, IClientOptions } from 'mqtt';

interface LocationData {
  driverId: string;
  orderId: string;
  timestamp: number;
  location: {
    lat: number;
    lng: number;
  };
  heading?: number;
  speed?: number;
}

class MQTTService {
  private static instance: MQTTService;
  private client: MqttClient | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000; // 5 seconds
  private isConnecting = false;
  private topicPrefix = 'antermbg/delivery';
  
  // HiveMQ public broker
  private brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
  
  private constructor() {}
  
  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }
  
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve(true);
        return;
      }
      
      if (this.isConnecting) {
        resolve(false);
        return;
      }
      
      this.isConnecting = true;
      
      const options: IClientOptions = {
        clientId: `antermbg-driver-${Date.now()}`,
        clean: true,
        reconnectPeriod: 0, // We'll handle reconnection manually
        connectTimeout: 10000, // 10 seconds
      };
      
      try {
        this.client = mqtt.connect(this.brokerUrl, options);
        
        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          resolve(true);
        });
        
        this.client.on('error', (err) => {
          console.error('MQTT connection error:', err);
          this.handleConnectionFailure();
          reject(err);
        });
        
        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.handleConnectionFailure();
        });
        
        this.client.on('offline', () => {
          console.log('MQTT client went offline');
          this.handleConnectionFailure();
        });
      } catch (error) {
        console.error('Failed to connect to MQTT broker:', error);
        this.isConnecting = false;
        this.handleConnectionFailure();
        reject(error);
      }
    });
  }
  
  private handleConnectionFailure(): void {
    this.isConnecting = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay / 1000} seconds (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          console.log('Reconnection attempt failed');
        });
      }, delay);
    } else {
      console.error(`Failed to connect after ${this.maxReconnectAttempts} attempts`);
    }
  }
  
  public disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
  
  public publishLocation(orderId: string, locationData: LocationData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        this.connect()
          .then(() => this.doPublish(orderId, locationData, resolve, reject))
          .catch((err) => reject(err));
      } else {
        this.doPublish(orderId, locationData, resolve, reject);
      }
    });
  }
  
  private doPublish(
    orderId: string, 
    locationData: LocationData, 
    resolve: (value: boolean) => void, 
    reject: (reason?: any) => void
  ): void {
    try {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }
      
      const topic = `${this.topicPrefix}/${orderId}/location`;
      const payload = JSON.stringify(locationData);
      
      this.client.publish(topic, payload, { qos: 1, retain: false }, (err) => {
        if (err) {
          console.error('Failed to publish location:', err);
          reject(err);
        } else {
          console.log(`Location published to ${topic}`);
          resolve(true);
        }
      });
    } catch (error) {
      console.error('Error publishing location:', error);
      reject(error);
    }
  }
  
  public subscribeToDriverLocation(orderId: string, callback: (data: LocationData) => void): () => void {
    if (!this.client) {
      this.connect().catch(console.error);
    }
    
    const topic = `${this.topicPrefix}/${orderId}/location`;
    
    const messageHandler = (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString()) as LocationData;
        callback(data);
      } catch (error) {
        console.error('Error parsing MQTT message:', error);
      }
    };
    
    if (this.client) {
      this.client.subscribe(topic, { qos: 1 });
      this.client.on('message', messageHandler);
    }
    
    // Return unsubscribe function
    return () => {
      if (this.client) {
        this.client.unsubscribe(topic);
        this.client.removeListener('message', messageHandler);
      }
    };
  }
}

export default MQTTService.getInstance();
