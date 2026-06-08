# Core Embedded Systems Fundamentals Study Guide

This guide provides a solid foundation in the core concepts of embedded systems, covering essential electronics, C/C++ programming techniques for constrained environments, and basic microcontroller operation.

## 1. Introduction to Embedded Systems

*   **Definition:** Embedded systems are specialized computer systems designed to perform dedicated functions within a larger mechanical or electrical system. Unlike general-purpose computers, they are often designed for specific tasks with strict performance and resource constraints.
*   **Characteristics:**
    *   **Dedicated Function:** Performs one or a few specific tasks.
    *   **Real-time Operation:** Often requires timely responses to events (soft or hard real-time).
    *   **Resource Constraints:** Limited memory, processing power, and energy consumption.
    *   **Reliability:** High demands for continuous and error-free operation.
    *   **Efficiency:** Optimized for power, size, and cost.
*   **Examples:** Smartwatches, automotive electronic control units (ECUs), industrial control systems, medical devices, home appliances.

## 2. Basic Electronics Fundamentals

Understanding basic electronics is crucial for working with embedded systems.

*   **Ohm's Law:**
    *   **V = IR** (Voltage = Current × Resistance)
    *   Defines the fundamental relationship between voltage, current, and resistance in an electrical circuit.
*   **Kirchhoff's Laws:**
    *   **Kirchhoff's Current Law (KCL):** The sum of currents entering a node (junction) in an electrical circuit is equal to the sum of currents leaving the node. (Conservation of charge)
    *   **Kirchhoff's Voltage Law (KVL):** The sum of all voltages around any closed loop in an electrical circuit is equal to zero. (Conservation of energy)
*   **Key Components (Overview):**
    *   **Resistors:** Limit current flow, divide voltage. Measured in Ohms (Ω).
    *   **Capacitors:** Store electrical charge, smooth voltage fluctuations, filter signals. Measured in Farads (F).
    *   **Inductors:** Store energy in a magnetic field, oppose changes in current. Measured in Henrys (H).
    *   **Diodes:** Allow current to flow predominantly in one direction. Common types: Rectifier, Zener, LED.
    *   **Transistors:** Semiconductor devices used to amplify or switch electronic signals and electrical power. Common types: BJT, MOSFET.
*   **Digital Logic:**
    *   **Logic Gates:** Basic building blocks of digital circuits (e.g., AND, OR, NOT, XOR). They perform logical operations on one or more binary inputs to produce a single binary output.
    *   **Boolean Algebra:** A mathematical system used to analyze and simplify digital (binary) circuits. It deals with variables that can only have two discrete values (true/false, 1/0).

## 3. Microcontrollers vs. Microprocessors

While both are central processing units, their design and application differ significantly.

*   **Microprocessor (MPU):**
    *   **Description:** A general-purpose CPU on a single integrated circuit. It requires external components like RAM, ROM, and I/O controllers to function as a complete computer system.
    *   **Use Case:** Personal computers, servers, high-performance computing, where flexibility and raw processing power are paramount.
    *   **Example:** Intel Core i7, AMD Ryzen.
*   **Microcontroller (MCU):**
    *   **Description:** A compact integrated circuit that contains a CPU, memory (RAM, Flash/ROM), and various peripherals (timers, ADCs, communication interfaces) all on a single chip. It is a 