# Advanced Firmware Practices & Testing

This guide covers advanced techniques essential for developing robust, reliable, and maintainable firmware for embedded systems. We will delve into strategies for error handling, fault tolerance, defensive programming, comprehensive testing methodologies, and basic sensor calibration.

## 1. Robust Error Handling

Effective error handling is paramount in embedded systems, where failures can have critical consequences. It involves anticipating potential issues, detecting them, and implementing strategies to recover or gracefully degrade.

### Core Concepts:
*   **Error Detection:** Identifying when something goes wrong (e.g., failed peripheral initialization, out-of-range sensor readings, communication timeouts).
*   **Error Reporting:** Communicating the nature of the error (e.g., status codes, error flags, logging).
*   **Error Recovery:** Strategies to bring the system back to a stable state or notify higher-level systems for intervention.

### Strategies:
*   **Return Codes:** Functions return specific integer codes indicating success or different error types. This is common in C.
*   **Error Flags:** Global or module-specific flags set upon error, which can be polled by other parts of the system.
*   **Error Callbacks/Hooks:** Registering functions to be called when specific errors occur, allowing flexible handling.
*   **Asserts:** Used during development to catch unexpected conditions. Assertions should typically be removed or replaced with robust error handling in production code, especially in safety-critical systems.
*   **Logging:** Storing error messages to non-volatile memory or sending them over a debug interface for post-mortem analysis.

### Example: Return Codes
```c
typedef enum {
    STATUS_OK = 0,
    ERROR_INIT_FAILED,
    ERROR_INVALID_PARAM,
    ERROR_TIMEOUT
} SystemStatus_t;

SystemStatus_t initSensor(uint8_t sensorId) {
    if (sensorId >= MAX_SENSORS) {
        return ERROR_INVALID_PARAM;
    }
    // Attempt to initialize sensor hardware
    if (!hardware_init(sensorId)) {
        return ERROR_INIT_FAILED;
    }
    return STATUS_OK;
}

void applicationLoop() {
    SystemStatus_t status = initSensor(0);
    if (status != STATUS_OK) {
        // Handle initialization error
        logError("Sensor 0 init failed with status: %d", status);
        while(1); // Critical error, halt system or attempt recovery
    }
    // ... rest of application
}
```

## 2. Fault-Tolerant Firmware using Watchdog Timers

Fault tolerance ensures that a system can continue operating correctly even when parts of it fail. Watchdog timers are a key component in achieving this by detecting and recovering from software malfunctions.

### Core Concepts:
*   **Watchdog Timer (WDT):** A hardware timer that, once enabled, must be periodically reset (or 