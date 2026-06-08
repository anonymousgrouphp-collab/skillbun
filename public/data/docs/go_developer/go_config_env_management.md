# Configuration and Environment Management in Go

Robust configuration management is crucial for building flexible and maintainable Go applications. It allows your application to adapt to different environments (development, staging, production) without code changes, manage sensitive data, and provide runtime customization. This guide explores the core methods for managing configuration in Go: environment variables, command-line flags, and configuration files, alongside best practices for handling secrets.

## 1. Environment Variables

Environment variables are a foundational method for externalizing application settings. They are particularly useful for deployment across different environments as they can be set by the operating system or container orchestrators (like Docker, Kubernetes).

### Core Concepts:
*   **Externalization**: Keep sensitive data and environment-specific settings out of your codebase.
*   **Simplicity**: Easy to set and read.
*   **Security**: For secrets, this is a preferred method over hardcoding or committing to VCS.

### Go `os` Package:
Go's standard `os` package provides functions to interact with environment variables.

```go
package main

import (
	"fmt"
	"os"
	"strconv"
)

func main() {
	// os.Getenv retrieves the value of the environment variable named by the key.
	// It returns an empty string if the variable is not present.
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080" // Default value if not set
	}
	fmt.Printf("Application Port: %s\n", port)

	// os.LookupEnv returns the value and a boolean indicating if the variable is present.
	// This is useful to distinguish between an unset variable and one set to an empty string.
	dbUser, present := os.LookupEnv("DB_USER")
	if !present {
		fmt.Println("DB_USER environment variable not set.")
		dbUser = "default_user"
	}
	fmt.Printf("Database User: %s (present: %t)\n", dbUser, present)

	// Example: Reading a boolean or integer value
	debugModeStr := os.Getenv("DEBUG_MODE")
	debugMode, err := strconv.ParseBool(debugModeStr)
	if err != nil {
		debugMode = false // Default to false if not set or invalid
	}
	fmt.Printf("Debug Mode: %t\n", debugMode)
}
```

To run this:
Set environment variables before running:
```bash
# On Linux/macOS
export APP_PORT=9000
export DB_USER=admin
export DEBUG_MODE=true
go run main.go

# On Windows (cmd)
set APP_PORT=9000
set DB_USER=admin
set DEBUG_MODE=true
go run main.go
```

## 2. Command-line Flags

Command-line flags allow users to specify configuration options directly when running an application. This is ideal for frequently changed parameters or one-off tasks.

### Core Concepts:
*   **Runtime Customization**: Modify behavior without editing config files or env variables.
*   **User-friendly**: Common interface for many CLI tools.

### Go `flag` Package:
The standard `flag` package simplifies parsing command-line arguments.

```go
package main

import (
	"flag"
	"fmt"
)

func main() {
	// Declare variables to store flag values
	var port int
	var host string
	var debug bool

	// Define flags: flag.Type(name, default_value, usage_string)
	flag.IntVar(&port, "port", 8080, "Port to listen on")
	flag.StringVar(&host, "host", "localhost", "Host address to bind to")
	flag.BoolVar(&debug, "debug", false, "Enable debug mode")

	// Parse the command-line flags
	flag.Parse()

	fmt.Printf("Application will run on %s:%d\n", host, port)
	fmt.Printf("Debug Mode: %t\n", debug)

	// Non-flag arguments (remaining arguments after flags are parsed)
	fmt.Printf("Remaining arguments: %v\n", flag.Args())
}
```

To run this:
```bash
go run main.go -port 9000 -host 0.0.0.0 -debug true arg1 arg2
```
Output:
```
Application will run on 0.0.0.0:9000
Debug Mode: true
Remaining arguments: [arg1 arg2]
```

## 3. Configuration Files

For more complex configurations, especially those with structured data, using configuration files (like JSON or YAML) is often preferred. They provide a clear, human-readable, and version-controllable way to manage settings.

### 3.1. JSON Configuration

JSON (JavaScript Object Notation) is a lightweight data-interchange format, widely supported, and easy to parse in Go.

**`config.json`:**
```json
{
  "database": {
    "host": "db.example.com",
    "port": 5432,
    "user": "appuser",
    "password": "db_password"
  },
  "api_key": "your_api_key_123",
  "features": {
    "metrics_enabled": true,
    "caching_duration": "5m"
  }
}
```

**Go Code to read JSON:**
```go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

// Define structs to match the JSON structure
type DatabaseConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
}

type FeaturesConfig struct {
	MetricsEnabled  bool   `json:"metrics_enabled"`
	CachingDuration string `json:"caching_duration"`
}

type AppConfig struct {
	Database DatabaseConfig `json:"database"`
	APIKey   string         `json:"api_key"`
	Features FeaturesConfig `json:"features"`
}

func main() {
	// Read the JSON file
	file, err := ioutil.ReadFile("config.json")
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}

	var config AppConfig
	// Unmarshal JSON into the struct
	err = json.Unmarshal(file, &config)
	if err != nil {
		log.Fatalf("Error unmarshalling JSON: %v", err)
	}

	fmt.Printf("Database Host: %s\n", config.Database.Host)
	fmt.Printf("API Key: %s\n", config.APIKey)
	fmt.Printf("Metrics Enabled: %t\n", config.Features.MetricsEnabled)
	fmt.Printf("Caching Duration: %s\n", config.Features.CachingDuration)
}
```

### 3.2. YAML Configuration

YAML (YAML Ain't Markup Language) is often preferred for human readability and is commonly used for configuration files in many projects. Go doesn't have a built-in YAML parser, but popular third-party libraries exist.

**`config.yaml`:**
```yaml
database:
  host: db.example.com
  port: 5432
  user: appuser
  password: db_password
api_key: your_api_key_123
features:
  metrics_enabled: true
  caching_duration: 5m
```

**Go Code to read YAML (using `gopkg.in/yaml.v2`):**
First, install the library: `go get gopkg.in/yaml.v2`

```go
package main

import (
	"fmt"
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2" // Import the YAML library
)

// Define structs (can be the same as JSON example, just adjust tags if needed)
type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

type FeaturesConfig struct {
	MetricsEnabled  bool   `yaml:"metrics_enabled"`
	CachingDuration string `yaml:"caching_duration"`
}

type AppConfig struct {
	Database DatabaseConfig `yaml:"database"`
	APIKey   string         `yaml:"api_key"`
	Features FeaturesConfig `yaml:"features"`
}

func main() {
	file, err := ioutil.ReadFile("config.yaml")
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}

	var config AppConfig
	err = yaml.Unmarshal(file, &config) // Unmarshal YAML
	if err != nil {
		log.Fatalf("Error unmarshalling YAML: %v", err)
	}

	fmt.Printf("Database Host: %s\n", config.Database.Host)
	fmt.Printf("API Key: %s\n", config.APIKey)
	fmt.Printf("Metrics Enabled: %t\n", config.Features.MetricsEnabled)
	fmt.Printf("Caching Duration: %s\n", config.Features.CachingDuration)
}
```

## 4. Popular Configuration Libraries (e.g., Viper)

Managing multiple configuration sources (environment variables, flags, files, defaults) can become complex. Libraries like [Viper](https://github.com/spf13/viper) provide a unified interface to load, parse, and merge configurations from various sources, applying a consistent hierarchy.

### Why use Viper?
*   **Multiple Sources**: Supports JSON, TOML, YAML, HCL, INI, environment variables, command-line flags, remote K/V stores, and setting default values.
*   **Hierarchy**: Defines a clear order of precedence (e.g., flags override env vars, which override config files, which override defaults).
*   **Watch Changes**: Can watch for changes in config files and reload.
*   **Type Safety**: Can unmarshal configurations into Go structs.

### Simple Viper Example:
First, install Viper: `go get github.com/spf13/viper`

**`config.yaml`:**
```yaml
app:
  name: MyGoApp
  port: 8080
database:
  host: localhost
  user: root
```

**Go Code with Viper:**
```go
package main

import (
	"fmt"
	"log"

	"github.com/spf13/pflag" // Using pflag for better flag parsing with Viper
	"github.com/spf13/viper"
)

func main() {
	// 1. Set default values
	viper.SetDefault("app.name", "DefaultGoApp")
	viper.SetDefault("app.port", 3000)
	viper.SetDefault("database.host", "127.0.0.1")

	// 2. Read from config file
	viper.SetConfigName("config") // Name of config file (without extension)
	viper.SetConfigType("yaml")   // Type of config file
	viper.AddConfigPath(".")      // Search path for config file in the current directory
	viper.AddConfigPath("/etc/appname/") // Another path example

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found; ignore error and proceed with defaults, env vars, or flags
			fmt.Println("No config file found, using defaults and other sources.")
		} else {
			log.Fatalf("Fatal error reading config file: %v", err)
		}
	} else {
		fmt.Println("Config file 'config.yaml' loaded.")
	}

	// 3. Read from environment variables
	viper.SetEnvPrefix("APP") // Environment variables should be prefixed with APP_
	viper.BindEnv("app.port") // Binds "app.port" to APP_APP_PORT (Viper handles transformation)
	viper.BindEnv("database.user") // Binds "database.user" to APP_DATABASE_USER
	viper.AutomaticEnv() // Read matching environment variables

	// 4. Read from command-line flags (using pflag for better integration with Viper)
	pflag.Int("port", viper.GetInt("app.port"), "Port to listen on (overrides config/env)")
	pflag.String("dbuser", viper.GetString("database.user"), "Database user (overrides config/env)")
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine) // Bind pflags to Viper

	// Access configuration values
	fmt.Printf("App Name: %s\n", viper.GetString("app.name"))
	fmt.Printf("App Port: %d (from: %s)\n", viper.GetInt("app.port"), viper.GetString("app.port_source")) // Example of getting source
	fmt.Printf("Database Host: %s\n", viper.GetString("database.host"))
	fmt.Printf("Database User: %s\n", viper.GetString("database.user"))

	// Example: Direct unmarshalling to a struct
	type ServerConfig struct {
		Name string `mapstructure:"name"`
		Port int    `mapstructure:"port"`
	}
	var serverCfg ServerConfig
	if err := viper.UnmarshalKey("app", &serverCfg); err != nil {
		log.Fatalf("Unable to unmarshal server config: %v", err)
	}
	fmt.Printf("Server Config (via Unmarshal): %+v\n", serverCfg)
}
```

To run this:
1.  Create `config.yaml` as shown above.
2.  Run: `go run main.go --port 9001 --dbuser mycliuser`
3.  Experiment with environment variables: `APP_APP_PORT=9002 APP_DATABASE_USER=envuser go run main.go`
4.  Observe the precedence (flags > env vars > config file > defaults).

## 5. Managing Secrets

Secrets are sensitive pieces of information (API keys, database credentials, encryption keys) that should never be hardcoded or committed to version control.

### Best Practices:
*   **Environment Variables**: The most common and simple way to inject secrets into applications, especially in containerized environments. They are not persisted to disk and are isolated to the process.
*   **Dedicated Secret Management Tools**: For production environments, consider using specialized tools:
    *   **HashiCorp Vault**: Centralized secret management.
    *   **AWS Secrets Manager / Azure Key Vault / Google Secret Manager**: Cloud provider-specific solutions.
*   **`.env` files (for local development only)**: Use a `.env` file (and add it to `.gitignore`) for local development to easily manage environment variables. Libraries like `github.com/joho/godotenv` can load these files.
*   **Avoid hardcoding**: Never embed secrets directly in your source code.
*   **Avoid committing**: Ensure `.env` files and similar sensitive files are explicitly ignored by Git.

## Conclusion

Effective configuration management is a cornerstone of building robust and adaptable Go applications. By strategically using environment variables for dynamic and secret settings, command-line flags for runtime adjustments, and structured configuration files for complex defaults, you can ensure your applications are flexible and secure across all environments. Libraries like Viper further streamline this process by providing a unified and powerful abstraction over multiple configuration sources.

---

## Quick Checklist/Exercise:

1.  Create a Go application that reads a `DB_HOST` environment variable and a `--debug` command-line flag. If `DB_HOST` is not set, it should default to `"localhost"`. If `--debug` is present, print additional diagnostic information.
2.  Modify the application to also load a `config.json` file. This file should define a `LogLevel` string (e.g., "INFO", "DEBUG"). Ensure that `LogLevel` from the config file can be overridden by an `APP_LOG_LEVEL` environment variable.
3.  Explain a scenario where using a library like Viper would significantly simplify your configuration management compared to using only the standard `os` and `flag` packages.
