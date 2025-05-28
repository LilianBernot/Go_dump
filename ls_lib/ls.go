package main

import (
	"fmt"
	"log"
	"os"
)

// This package will be an implementation of the ls function in go !
func main() {
	dir := "."

	// Read the directory
	files, err := os.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}

	// Print the file and folder names
	for _, entry := range files {
		name := entry.Name()

		if entry.IsDir() {
			// Blue color for directories
			fmt.Printf("\033[34m%s\033[0m\n", name)
		} else {
			// Default color for files
			fmt.Println(name)
		}
	}
}
