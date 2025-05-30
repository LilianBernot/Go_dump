package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/LilianBernot/mychat/pkg/websocket"
)

func serveWS(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Host)

	// Upgrade the connaction to a websocket
	ws, err := websocket.Upgrade(w, r)
	if err != nil {
		log.Println(err)
	}
	go websocket.Writer(ws)

	// listen indefinitely for new messages coming
	websocket.Reader(ws)
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	})
	http.HandleFunc("/ws", serveWS)
}

func main() {
	fmt.Println("Chat App v0.01")
	setupRoutes()
	http.ListenAndServe(":8080", nil)
}
