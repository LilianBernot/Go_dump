package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"unicode/utf8"
)

// This package will be an implementation of the wc function in go !
func main() {

	if len(os.Args) < 2 {
		fmt.Println("No argument provided")
		return
	}

	input := os.Args[1]

	content, err := os.ReadFile(input)
	if err != nil {
		log.Fatal(err)
	}

	lines := strings.Count(string(content), "\n") + 1
	words := len(strings.Fields(string(content)))
	characters := utf8.RuneCountInString(string(content))

	fmt.Printf("The file is composed of : \n	%d lines\n	%d words\n	%d characters\n", lines, words, characters)
}
