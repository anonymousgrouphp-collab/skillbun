# Wireless Connectivity for IoT

Wireless connectivity is the backbone of the Internet of Things (IoT), enabling devices to communicate and share data, driving automation, monitoring, and control across various applications. Understanding the core wireless technologies is crucial for any IoT developer.

## 1. Wi-Fi for IoT

Wi-Fi is a ubiquitous wireless technology commonly used in IoT for its high data rates and widespread infrastructure.

### 1.1 TCP/IP Stack Basics

The TCP/IP (Transmission Control Protocol/Internet Protocol) stack is a set of communication protocols used to interconnect network devices on the internet. It consists of four abstraction layers:

*   **Application Layer:** Where applications (e.g., HTTP, MQTT, CoAP) interact with the network.
*   **Transport Layer:** Manages end-to-end communication (e.g., TCP for reliable, UDP for fast but unreliable).
*   **Internet Layer:** Handles logical addressing and routing (IP).
*   **Network Access Layer:** Deals with physical transmission over the local network (e.g., Ethernet, Wi-Fi MAC).

For IoT, understanding how your device's application data travels through these layers over Wi-Fi is fundamental.

### 1.2 Sockets Programming

Sockets provide a way for applications to send and receive data across a network. It's a programming interface for network communication, often used with TCP/IP.

**Basic steps for a TCP client:**
1.  `socket()`: Create a socket descriptor.
2.  `connect()`: Establish a connection to a server (IP address, port).
3.  `send()`: Send data to the server.
4.  `recv()`: Receive data from the server.
5.  `close()`: Close the socket.

**Basic steps for a TCP server:**
1.  `socket()`: Create a socket descriptor.
2.  `bind()`: Assign a local IP address and port to the socket.
3.  `listen()`: Put the socket in a listening state for incoming connections.
4.  `accept()`: Accept an incoming connection, creating a new socket for communication.
5.  `send()`/`recv()`: Communicate with the client.
6.  `close()`: Close the sockets.

### 1.3 Wi-Fi Operating Modes (AP & Station)

IoT devices primarily operate in two Wi-Fi modes:

*   **Station (STA) Mode:** The device acts as a client, connecting to an existing Wi-Fi Access Point (router) to access the internet or local network resources. This is common for sensors reporting data to a cloud server.
*   **Access Point (AP) Mode:** The device itself acts as a Wi-Fi hotspot, allowing other devices (like a smartphone) to connect to it directly. This is often used for initial device configuration or local control without an internet connection.

### 1.4 Example: Wi-Fi Client Connection (Pseudocode)

```c
// Example for an ESP32 (common IoT microcontroller)
// Connects to Wi-Fi and prints device's IP address

#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  Serial.print("Connecting to Wi-Fi...");
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Wi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Your IoT application logic here
  // e.g., read sensor, connect to MQTT broker, send data
}
```

### 1.5 Quick Understanding Check

1.  What is the primary difference between Wi-Fi Station mode and Access Point (AP) mode?
2.  In the TCP/IP stack, which layer is responsible for logical addressing and routing?
3.  List two fundamental socket programming functions used by a TCP client to initiate and communicate over a connection.

## 2. Bluetooth Low Energy (BLE)

Bluetooth Low Energy (BLE) is a wireless personal area network technology designed for short-range, low-power communication, making it ideal for battery-powered IoT devices.

### 2.1 BLE Core Concepts

*   **GAP (Generic Access Profile):** Defines how BLE devices discover each other, establish connections, and manage advertising and scanning procedures. Devices can be Broadcasters, Observers, Peripherals, or Centrals.
*   **Advertising:** Peripherals transmit small packets of data to announce their presence and capabilities.
*   **Scanning:** Centrals listen for advertising packets to discover Peripherals.
*   **Connection:** Once a Central initiates a connection to a Peripheral, a stable, low-power link is established.

### 2.2 GATT (Generic Attribute Profile)

GATT defines the way BLE devices send and receive short pieces of data called "attributes" over a connection. It structures how data is organized and exchanged.

*   **Profile:** A pre-defined collection of Services that address a specific use case (e.g., Heart Rate Profile).
*   **Service:** A collection of Characteristics. Each Service has a UUID (Universally Unique Identifier). Example: Heart Rate Service, Battery Service.
*   **Characteristic:** The actual data point or value. It includes a value, properties (read, write, notify), and optional descriptors (e.g., unit of measurement). Example: Heart Rate Measurement, Battery Level.

A client (Central) can read/write characteristics of a server (Peripheral), or subscribe to notifications/indications when a characteristic's value changes.

### 2.3 Example: BLE Service Interaction

Imagine a smart thermometer (Peripheral) exposing a "Temperature Service" with a "Temperature Measurement Characteristic".
A smartphone app (Central) would:
1.  Scan for BLE devices.
2.  Discover the thermometer.
3.  Connect to it.
4.  Discover its "Temperature Service".
5.  Discover the "Temperature Measurement Characteristic" within that service.
6.  Subscribe to notifications for the characteristic to receive real-time temperature updates.
7.  Optionally, read the current temperature value.

### 2.4 Quick Understanding Check

1.  Explain the hierarchical structure of data in BLE GATT, starting from the Profile.
2.  What is the primary role of "advertising" in BLE?
3.  Name one key advantage of BLE over classic Bluetooth for IoT applications.

## 3. Other Key IoT Wireless Protocols

While Wi-Fi and BLE are prevalent, several other protocols cater to specific IoT requirements, particularly for long-range or very low-power applications.

### 3.1 LoRa/LoRaWAN

*   **LoRa (Long Range):** A proprietary physical layer radio modulation technique providing long-range, low-power communication.
*   **LoRaWAN (Long Range Wide Area Network):** A Media Access Control (MAC) layer protocol built on top of LoRa, defining the network architecture (end-devices, gateways, network servers, application servers) for wide-area IoT deployments.
*   **Characteristics:** Extremely long range (kilometers), very low power consumption, low data rates.
*   **Use Cases:** Smart cities, agriculture, asset tracking, environmental monitoring.

### 3.2 Zigbee

*   **Characteristics:** Low-power, low-data-rate, short-range, mesh networking protocol.
*   **Networking:** Devices can form a self-healing mesh network, extending range and improving reliability.
*   **Use Cases:** Home automation (smart lighting, thermostats), industrial control.

### 3.3 Cellular IoT (NB-IoT, LTE-M)

These protocols leverage existing cellular networks, offering wide-area coverage and reliability for IoT devices.

*   **NB-IoT (Narrowband IoT):**
    *   **Characteristics:** Very low power consumption, excellent deep indoor penetration, supports massive numbers of connections, very low data rates (kbps).
    *   **Use Cases:** Smart metering, asset tracking, remote sensors, utility monitoring.
*   **LTE-M (Long Term Evolution for Machines):**
    *   **Characteristics:** Higher bandwidth than NB-IoT (up to 1 Mbps), supports voice, mobility, and firmware over-the-air (FOTA) updates.
    *   **Use Cases:** Wearables, smart health devices, vehicle tracking, more complex industrial applications.

### 3.4 Quick Understanding Check

1.  For what kind of IoT applications would LoRaWAN be a more suitable choice than Wi-Fi?
2.  What is a key networking advantage of Zigbee that extends its operational range?
3.  Compare and contrast NB-IoT and LTE-M in terms of data rate capabilities.