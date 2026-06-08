# Microcontroller Architecture & Peripherals: A Study Guide

Microcontrollers (MCUs) are the brains behind countless embedded systems, from IoT devices to automotive electronics. Understanding their internal architecture and peripheral units is fundamental for any embedded developer. This guide will provide a structured overview of these core concepts.

## 1. Core CPU Types

The Central Processing Unit (CPU) is the "engine" of the microcontroller, executing instructions and managing operations.

### 1.1. ARM Cortex-M Series
*   **Overview**: The most prevalent family of 32-bit microcontrollers. Known for their energy efficiency, performance, and vast ecosystem.
*   **Key Features**:
    *   **Harvard Architecture**: Separate instruction and data buses for improved throughput.
    *   **Thumb-2 Instruction Set**: A hybrid 16/32-bit instruction set offering excellent code density and performance.
    *   **Nested Vectored Interrupt Controller (NVIC)**: Sophisticated interrupt management for real-time responsiveness.
    *   **Memory Protection Unit (MPU)**: Optional feature for enhancing system reliability and security.
*   **Common Variants**: Cortex-M0/M0+ (ultra-low power), Cortex-M3/M4 (mainstream, M4 includes DSP and optional FPU), Cortex-M7 (high-performance).

### 1.2. RISC-V
*   **Overview**: An open-source Instruction Set Architecture (ISA) based on Reduced Instruction Set Computing (RISC) principles. It's gaining traction due to its flexibility, extensibility, and royalty-free nature.
*   **Key Features**:
    *   **Modular Design**: Allows for custom extensions, making it suitable for a wide range of applications from tiny MCUs to high-performance CPUs.
    *   **Simplicity**: A small, well-defined base ISA with optional standard extensions (e.g., M for integer multiplication/division, A for atomics, F/D for floating-point).
    *   **Open Standard**: Fosters innovation and reduces vendor lock-in.

## 2. Memory Organization

Microcontrollers typically feature different types of memory, each serving a specific purpose.

*   **Flash Memory**:
    *   **Purpose**: Stores the program code (firmware) and often non-volatile data (e.g., configuration settings).
    *   **Characteristics**: Non-volatile (retains data without power), typically slower to write than read, limited erase/write cycles.
*   **SRAM (Static Random-Access Memory)**:
    *   **Purpose**: Used for runtime data, variables, stack, and heap.
    *   **Characteristics**: Volatile (loses data without power), very fast access speeds, consumes more power than Flash during operation.
*   **EEPROM (Electrically Erasable Programmable Read-Only Memory)**:
    *   **Purpose**: Stores small amounts of non-volatile data that needs to be updated frequently (e.g., calibration data, user preferences).
    *   **Characteristics**: Non-volatile, byte-addressable, more write cycles than Flash, but typically smaller capacity. (Note: Many modern MCUs use a dedicated section of Flash to emulate EEPROM functionality).
*   **Memory-Mapped I/O**:
    *   **Concept**: Peripherals (like GPIO, Timers, ADC) are controlled by reading from and writing to specific memory addresses. This allows the CPU to interact with hardware modules as if they were memory locations.
    *   **Registers**: Each peripheral has a set of control, status, and data registers at specific memory addresses. Writing to a control register might enable a feature, while reading a status register might tell you if an operation is complete.

## 3. General Purpose I/O (GPIO)

GPIO pins are the most fundamental way a microcontroller interacts with the outside world.

*   **Functionality**: Can be configured as inputs (to read external signals) or outputs (to drive external components like LEDs, relays).
*   **Configuration**:
    *   **Direction**: Input or Output.
    *   **Output Type**: Push-pull (strong drive) or Open-drain (requires external pull-up, useful for bus systems like I2C).
    *   **Input Type**: No pull-up/down, Internal Pull-up (high if open), Internal Pull-down (low if open).
    *   **Speed**: Slew rate control for signal integrity.
*   **Example (Conceptual C code for blinking an LED):**
    ```c
    // Assuming a register structure for GPIO Port A
    #define GPIOA_BASE_ADDR 0x40020000 // Example base address
    #define GPIOA_MODER     (*(volatile unsigned int *)(GPIOA_BASE_ADDR + 0x00)) // Mode Register
    #define GPIOA_ODR       (*(volatile unsigned int *)(GPIOA_BASE_ADDR + 0x14)) // Output Data Register

    #define LED_PIN         5 // Assuming LED connected to PA5

    void delay_ms(unsigned int ms) {
        // Simple busy-wait delay for illustration
        for (volatile unsigned int i = 0; i < ms * 10000; i++);
    }

    int main() {
        // Configure PA5 as General Purpose Output Mode
        // Clear bits 11:10 (for PA5) and set bit 10 to 01 (output mode)
        GPIOA_MODER &= ~(0b11 << (LED_PIN * 2)); // Clear bits
        GPIOA_MODER |= (0b01 << (LED_PIN * 2));  // Set to output

        while (1) {
            GPIOA_ODR |= (1 << LED_PIN);  // Set PA5 high (LED ON)
            delay_ms(500);
            GPIOA_ODR &= ~(1 << LED_PIN); // Set PA5 low (LED OFF)
            delay_ms(500);
        }
        return 0;
    }
    ```
    *Note: This is a simplified example. Actual register access and peripheral configuration can vary significantly between MCUs and often involve clock enabling and more complex register settings. Always refer to the specific MCU's reference manual.*

## 4. Timers and Counters

Timers and counters are versatile peripherals used for a wide range of time-based operations.

*   **Purpose**:
    *   Generating precise delays.
    *   Measuring time intervals.
    *   Counting external events.
    *   Generating PWM signals.
    *   Triggering periodic interrupts.
*   **Key Concepts**:
    *   **Clock Source**: Internal or external clock drives the timer.
    *   **Prescaler**: Divides the clock frequency to achieve desired timer resolution.
    *   **Counter Register**: Increments or decrements based on the (prescaled) clock.
    *   **Auto-Reload Register (ARR)**: Defines the maximum count value before the counter resets or rolls over.
    *   **Compare Register**: Used to generate events or interrupts when the counter matches a specific value (Output Compare mode).
    *   **Input Capture**: Captures the counter value when an external event (e.g., rising edge) occurs on a pin, useful for measuring pulse widths or frequencies.

## 5. Interrupt Controllers

Interrupts allow the MCU to respond to external or internal events asynchronously, improving efficiency and real-time responsiveness compared to polling.

*   **Mechanism**: When an event occurs (e.g., a button press, a timer overflow, data received on a serial port), the peripheral generates an interrupt request. The interrupt controller then pauses the current program execution, saves the CPU's context, and jumps to a specific **Interrupt Service Routine (ISR)** associated with that event. After the ISR completes, the CPU restores its context and resumes normal program execution.
*   **Key Components**:
    *   **Interrupt Vector Table**: A table containing the starting addresses of all ISRs.
    *   **Interrupt Enable/Disable Registers**: Allow enabling or masking specific interrupts.
    *   **Interrupt Priority Levels**: Assign priorities to different interrupts, allowing critical interrupts to preempt less critical ones.
*   **NVIC (Nested Vectored Interrupt Controller)**: Standard for ARM Cortex-M MCUs, providing efficient interrupt handling, nesting, and configurable priorities.

## 6. Analog-to-Digital Converter (ADC) & Digital-to-Analog Converter (DAC)

These peripherals bridge the gap between the analog and digital worlds.

### 6.1. ADC
*   **Purpose**: Converts an analog voltage signal (e.g., from a temperature sensor, potentiometer) into a digital value that the MCU can process.
*   **Key Parameters**:
    *   **Resolution**: Number of bits (e.g., 8-bit, 10-bit, 12-bit). Higher resolution means finer granularity in measurement.
    *   **Sampling Rate**: How many conversions per second.
    *   **Input Channels**: Number of analog inputs the ADC can handle.
    *   **Reference Voltage**: Defines the full-scale range of the analog input.

### 6.2. DAC
*   **Purpose**: Converts a digital value from the MCU into an analog voltage signal.
*   **Applications**: Generating audio waveforms, controlling analog circuits, setting reference voltages.
*   **Key Parameters**:
    *   **Resolution**: Number of bits.
    *   **Output Range**: The minimum and maximum analog voltage it can produce.

## 7. Pulse Width Modulation (PWM)

PWM is a technique for achieving analog-like control using digital means.

*   **Concept**: A digital signal is rapidly switched between ON (high) and OFF (low) states. By varying the **duty cycle** (the percentage of time the signal is ON within a period), the *average* voltage or power delivered to a load can be controlled.
*   **Parameters**:
    *   **Frequency**: How often the PWM cycle repeats (e.g., 1 kHz).
    *   **Duty Cycle**: The ratio of ON time to the total period (e.g., 50% duty cycle means ON for half the period).
*   **Applications**:
    *   Motor speed control.
    *   LED brightness dimming.
    *   Generating analog output signals.
    *   Power conversion (e.g., in switch-mode power supplies).

## 8. Watchdog Timers (WDT)

A watchdog timer is a critical safety feature for embedded systems, designed to recover from software malfunctions.

*   **Mechanism**: The WDT is a hardware timer that, once enabled, must be periodically "fed" or "petted" (by writing a specific value to its register) by the running software. If the software fails to feed the watchdog within a predefined timeout period (e.g., due to an infinite loop, task starvation, or software crash), the WDT automatically generates a system reset.
*   **Purpose**: Prevents the system from getting stuck in an unresponsive state, ensuring continuous operation and reliability.

## 9. Effectively Reading Technical Documentation

Mastering the use of microcontrollers heavily relies on your ability to navigate and understand their documentation.

*   **Datasheets**:
    *   **Purpose**: Provides electrical and mechanical characteristics, pin descriptions, package information, and high-level block diagrams for a specific MCU part number.
    *   **Focus**: What the device *is* and *what it can do*.
*   **Reference Manuals**:
    *   **Purpose**: Detailed description of *how* to use each peripheral and internal module. Contains register maps, bit-level descriptions, operational modes, and programming sequences.
    *   **Focus**: How to *program* and *configure* the device.
*   **Block Diagrams**:
    *   **Purpose**: Visual representation of the internal connections between the CPU, memory, and various peripherals. Helps in understanding data flow and available resources.
    *   **Focus**: High-level overview of the MCU's internal architecture.

## Checklist / Exercise to Test Understanding

1.  Describe the primary difference in purpose between Flash memory and SRAM in a microcontroller. When would you use one over the other?
2.  Imagine you need to control the brightness of an LED and also read the voltage from a potentiometer. Which two microcontroller peripherals would be essential for these tasks, and why?
3.  Explain the role of a Watchdog Timer. In what kind of application would its absence pose a significant risk?