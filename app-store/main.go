package main

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/etag"
	"github.com/gofiber/fiber/v3/middleware/healthcheck"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const staticDirPath = "/static"

/*
*
convert configuration from environment and expose to ui
*/
func getConf(ctx fiber.Ctx) error {
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

	contextPath := strings.TrimSuffix(strings.TrimSpace(os.Getenv("WEB_CONTEXT_PATH")), "/")
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

	config := fiber.Config{ReduceMemoryUsage: true}

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

	// Register health endpoints FIRST, before any middleware
	// This ensures they respond quickly without middleware overhead
	app.Get(healthcheck.LivenessEndpoint, healthcheck.New())
	app.Get(healthcheck.ReadinessEndpoint, healthcheck.New())
	app.Get(healthcheck.StartupEndpoint, healthcheck.New())

	if contextPath != "" {
		app.Get(contextPath+"/conf", getConf)
		app.Get("/", func(ctx fiber.Ctx) error {
			return ctx.Redirect().To(contextPath + "/")
		})
	} else {
		app.Get("/conf", getConf)
	}

	// Use ETag middleware
	app.Use(etag.New())

	app.Use(contextPath, static.New("", static.Config{
		FS:        os.DirFS(staticDirPath),
		Browse:    false, // Disable directory listing
		ByteRange: true,
	}))
	app.Get(contextPath+"/*", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(staticDirPath, "index.html"))
	})

	log.Info().Str("address", address).Msg("Starting web server")

	// Use Hooks to log when server is actually ready to accept connections
	app.Hooks().OnListen(func(listenData fiber.ListenData) error {
		if fiber.IsChild() {
			return nil
		}
		scheme := "http"
		if listenData.TLS {
			scheme = "https"
		}
		log.Info().
			Str("scheme", scheme).
			Str("host", listenData.Host).
			Str("port", listenData.Port).
			Msg("Server is ready to accept connections")
		return nil
	})

	if err := app.Listen(address, fiber.ListenConfig{EnablePrefork: false, DisableStartupMessage: true}); err != nil {
		log.Fatal().Err(err).Msg("Failed to start web server")
	}

}
