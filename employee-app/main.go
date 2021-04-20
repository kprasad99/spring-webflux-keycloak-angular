package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {

	okHandler := func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	}

	http.HandleFunc("/liveness", okHandler)
	http.HandleFunc("/readiness", okHandler)

	contextPath := os.Getenv("WEB_CONTEXT_PATH")
	if contextPath != "" {
		http.Handle(contextPath, http.StripPrefix(contextPath, http.FileServer(http.Dir("/static"))))
		http.HandleFunc(strings.TrimSuffix(contextPath, "/")+"/conf", getConf)
		http.Handle("/", http.RedirectHandler(contextPath, http.StatusTemporaryRedirect))
	} else {
		http.HandleFunc("/conf", getConf)
		http.Handle("/", http.FileServer(http.Dir("/static")))
	}

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

	log.Printf("Web server start at %s", address)
	err := http.ListenAndServe(address, nil)
	if err != nil {
		log.Fatal(err)
	}
}

/**
convert configuration from environment and expose to ui
*/
func getConf(w http.ResponseWriter, r *http.Request) {
	envs := os.Environ()
	result := map[string]string{}
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	for _, str := range envs {
		if strings.HasPrefix(strings.TrimSpace(strings.ToUpper(str)), "APP_CONF_") {
			vals := strings.SplitN(str, "=", 2)
			lower := strings.ToLower(strings.TrimSpace(vals[0]))
			result[strings.TrimPrefix(lower, "app_conf_")] = vals[1]
		}
	}
	data, err := json.Marshal(&result)
	if err != nil {
		fmt.Println("some error", err)
	}
	w.Write(data)
}
