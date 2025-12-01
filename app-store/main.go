package main

import (
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func okHandler(ctx *fiber.Ctx) error {
	return ctx.SendString("OK")
}

/*
*
convert configuration from environment and expose to ui
*/
func getConf(ctx *fiber.Ctx) error {
	envs := os.Environ()
	result := map[string]string{}
	for _, str := range envs {
		if strings.HasPrefix(strings.TrimSpace(strings.ToUpper(str)), "APP_CONF_") {
			vals := strings.SplitN(str, "=", 2)
			lower := strings.ToLower(strings.TrimSpace(vals[0]))
			result[strings.TrimPrefix(lower, "app_conf_")] = vals[1]
		}
	}
	return ctx.JSON(result)
}

func main() {
	// Configure zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	// Pretty console logging for development, JSON for production
	if os.Getenv("LOG_PRETTY") == "true" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	contextPath := os.Getenv("WEB_CONTEXT_PATH")
	port := os.Getenv("WEB_PORT")
	host := os.Getenv("WEB_HOST")

	if port == "" {
		port = "8080"
	}

	address := ""
	if host == "" {
		address = ":" + port
	} else {
		address = host + ":" + port
	}

	contextPath = strings.TrimSuffix(contextPath, "/")

	config := fiber.Config{
		DisableStartupMessage: true,
		Prefork:               false,
		ReduceMemoryUsage:     true,
	}

	readBufferSize := os.Getenv("READ_BUFFER_SIZE")
	if readBufferSize != "" {
		val, err := strconv.Atoi(readBufferSize)
		if err == nil {
			config.ReadBufferSize = val
		}
	}

	writeBufferSize := os.Getenv("WRITE_BUFFER_SIZE")
	if writeBufferSize != "" {
		val, err := strconv.Atoi(writeBufferSize)
		if err == nil {
			config.WriteBufferSize = val
		}
	}

	app := fiber.New(config)

	// Use ETag middleware
	app.Use(etag.New())

	app.Get("/liveness", okHandler)
	app.Get("/readiness", okHandler)
	app.Get("/conf", getConf)

	// Serve static files - use Browse:false to prevent directory listing
	app.Static(contextPath, "/static", fiber.Static{
		Browse:    false,
		ByteRange: true,
	})

	if contextPath != "" {
		app.Get(contextPath+"/conf", getConf)
		app.Get("/", func(ctx *fiber.Ctx) error {
			return ctx.Redirect(contextPath + "/index.html")
		})
	} else {
		app.Get("/conf", getConf)
	}

	log.Info().Str("address", address).Msg("Starting web server")
	if err := app.Listen(address); err != nil {
		log.Fatal().Err(err).Msg("Failed to start web server")
	}

}
