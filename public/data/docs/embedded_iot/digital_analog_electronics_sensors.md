# Digital & Analog Electronics with Sensors: A Study Guide

This guide covers the fundamental concepts of digital and analog electronics, essential for any embedded and IoT developer, along with an introduction to common sensors and actuators.

## 1. Analog Electronics Fundamentals

Analog electronics deal with continuous signals, varying smoothly over time.

### Core Components:

*   **Resistors (R):** Limit current flow and divide voltage. Measured in Ohms (Ω).
    *   **Ohm's Law:** `V = I * R` (Voltage = Current * Resistance). This fundamental law relates voltage, current, and resistance in a circuit. Power dissipated by a resistor is `P = V * I = I^2 * R = V^2 / R`.
*   **Capacitors (C):** Store electrical energy in an electric field. They block DC current but pass AC current (depending on frequency). Measured in Farads (F). Used for filtering, timing, and energy storage.
*   **Inductors (L):** Store electrical energy in a magnetic field. They pass DC current but oppose changes in AC current. Measured in Henries (H). Used for filtering, energy storage, and in resonant circuits.
*   **Diodes:** Allow current to flow in one direction only.
    *   **Types:** Rectifier diodes (AC to DC conversion), Zener diodes (voltage regulation), LEDs (Light Emitting Diodes - emit light when current flows).
*   **Transistors:** Semiconductor devices used as electronic switches or amplifiers.
    *   **Types:** Bipolar Junction Transistors (BJTs) and Field-Effect Transistors (FETs, e.g., MOSFETs). They control a larger current/voltage with a smaller current/voltage at their base/gate.

### Circuit Laws:

*   **Kirchhoff's Voltage Law (KVL):** The algebraic sum of all voltages around any closed loop in a circuit is zero. "Sum of voltage drops = Sum of voltage rises."
*   **Kirchhoff's Current Law (KCL):** The algebraic sum of currents entering a node (junction) in an electrical circuit is equal to the sum of currents leaving the node. "Current in = Current out."

### Power Supply Design Basics:
A basic DC power supply converts AC mains voltage to a stable DC voltage.
1.  **Transformer:** Steps down the AC voltage.
2.  **Rectifier:** Converts AC to pulsating DC (e.g., using a bridge rectifier of diodes).
3.  **Filter:** Smooths out the pulsations (typically a large capacitor).
4.  **Regulator:** Provides a stable, constant DC output voltage (e.g., using a Zener diode or a voltage regulator IC like LM7805).

## 2. Digital Electronics Fundamentals

Digital electronics deal with discrete signals, typically represented by two states: HIGH (1) and LOW (0).

### Logic Gates:
Basic building blocks of digital circuits, performing logical operations.
*   **AND Gate:** Output is HIGH only if ALL inputs are HIGH.
*   **OR Gate:** Output is HIGH if ANY input is HIGH.
*   **NOT Gate (Inverter):** Output is the inverse of the input.
*   **XOR Gate (Exclusive OR):** Output is HIGH if inputs are DIFFERENT.
*   **NAND Gate (NOT AND):** Output is LOW only if ALL inputs are HIGH.
*   **NOR Gate (NOT OR):** Output is HIGH only if ALL inputs are LOW.

### Truth Tables:
A table that lists all possible input combinations and the corresponding output for a logic gate or circuit.

| Input A | Input B | A AND B | A OR B | A XOR B | NOT A |
| :------ | :------ | :------ | :------ | :------ | :---- |
| 0       | 0       | 0       | 0      | 0       | 1     |
| 0       | 1       | 0       | 1      | 1       | 1     |
| 1       | 0       | 0       | 1      | 1       | 0     |
| 1       | 1       | 1       | 1      | 0       | 0     |

### Combinational Logic:
Circuits where the output is solely a function of the current inputs. They have no memory.
*   **Examples:** Adders, Decoders, Encoders, Multiplexers.

### Sequential Logic:
Circuits where the output depends on both the current inputs and the previous state (memory). They use feedback.
*   **Examples:** Flip-flops (SR, D, JK, T), Latches, Counters, Registers. Flip-flops are fundamental memory elements, storing a single bit of information.

## 3. Sensors & Actuators

Sensors convert physical phenomena into electrical signals. Actuators convert electrical signals into physical actions.

### Common Sensors:
*   **Temperature Sensors:**
    *   **NTC Thermistor:** Resistance changes significantly with temperature (Negative Temperature Coefficient). Analog output.
    *   **LM35/TMP36:** Analog voltage output proportional to Celsius/Fahrenheit temperature.
    *   **DS18B20:** Digital temperature sensor using 1-Wire protocol.
*   **Humidity Sensors (e.g., DHT11/DHT22):** Measure relative humidity and often temperature. Provide digital output.
*   **Light Sensors:**
    *   **Photoresistor (LDR):** Resistance decreases with increasing light intensity. Analog output.
    *   **Photodiode/Phototransistor:** Generate current proportional to light intensity.
*   **Motion Sensors (PIR - Passive Infrared):** Detect changes in infrared radiation (heat), typically used to detect human or animal movement. Digital output (HIGH when motion detected).
*   **Ultrasonic Sensors (e.g., HC-SR04):** Measure distance using sound waves. Digital input/output for trigger/echo.

### Common Actuators:
*   **LEDs (Light Emitting Diodes):** Emit light when current flows through them. Require a current-limiting resistor.
*   **DC Motors:** Convert electrical energy into rotational mechanical energy. Controlled by varying voltage or using Pulse Width Modulation (PWM) for speed control, and H-bridge circuits for direction control.
*   **Servo Motors:** Provide precise angular positioning. Controlled by PWM signals, where the pulse width determines the angle.

## Practical Example: Arduino & LDR Light Sensor

Let's read an LDR (Light Dependent Resistor) and control an LED. The LDR's resistance decreases with light, meaning the voltage read at the analog pin will increase. We'll turn an LED on when it's dark (LDR voltage is low).

```cpp
// Define pins
const int ldrPin = A0;   // Analog pin connected to LDR
const int ledPin = 9;    // Digital pin connected to LED (PWM capable)

void setup() {
  pinMode(ledPin, OUTPUT); // Set LED pin as an output
  Serial.begin(9600);      // Initialize serial communication for debugging
}

void loop() {
  int ldrValue = analogRead(ldrPin); // Read the analog value from LDR (0-1023)

  Serial.print("LDR Value: ");
  Serial.println(ldrValue);

  // If LDR value is low (dark), turn on the LED
  // Threshold value depends on your LDR and resistor in voltage divider
  if (ldrValue < 300) { // Example threshold, adjust as needed
    digitalWrite(ledPin, HIGH); // Turn LED on
  } else {
    digitalWrite(ledPin, LOW);  // Turn LED off
  }

  delay(100); // Small delay for stable readings
}
```
**Circuit Setup:**
*   **LDR:** Connect one leg to 5V. Connect the other leg to `ldrPin` (A0) and to a 10kΩ resistor, which then goes to GND. This forms a voltage divider.
*   **LED:** Connect the anode (longer leg) to `ledPin` (D9) via a 220Ω current-limiting resistor. Connect the cathode (shorter leg) to GND.

## Quick Understanding Checklist/Exercise:

1.  **Analog vs. Digital:** Describe the key difference between an analog signal and a digital signal.
2.  **Logic Gate Output:** If an AND gate has inputs A=1 and B=0, what is its output? If a NOT gate has input C=1, what is its output?
3.  **Sensor Selection:** Which type of sensor would you choose to detect if a door is open or closed, and what kind of output (analog or digital) would you expect from it?