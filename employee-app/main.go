package main

import (
	"log"
	"os"
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

	app := fiber.New()
	app.Get("/liveness", okHandler)
	app.Get("/readiness", okHandler)
	app.Get("/conf", getConf)

	app.Static(contextPath, "/static")
	if contextPath != "" {
		app.Get("/", func(ctx *fiber.Ctx) error {
			return ctx.SendFile("/static/index.html")
		})
	}

	log.Println("Started web server")
	if err := app.Listen(address); err != nil {
		log.Panic("Failed to start web server", err)
	}

}
