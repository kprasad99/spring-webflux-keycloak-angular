package main

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
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
		Prefork:           true,
		ReduceMemoryUsage: true,
		ETag:              true,
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

	app.Get("/liveness", okHandler)
	app.Get("/readiness", okHandler)
	app.Get("/conf", getConf)

	app.Static(contextPath, "/static")
	if contextPath != "" {
		app.Get(strings.TrimSuffix(contextPath, "/")+"/conf", getConf)
		app.Get("/", func(ctx *fiber.Ctx) error {
			return ctx.Redirect(strings.TrimSuffix(contextPath, "/") + "/index.html")
		})
	} else {
		app.Get("/conf", getConf)
	}

	log.Println("Started web server")
	if err := app.Listen(address); err != nil {
		log.Panic("Failed to start web server", err)
	}

}
