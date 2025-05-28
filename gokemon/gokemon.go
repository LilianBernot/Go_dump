package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func main() {
	fmt.Println("Hello Gokemon !")

	number := 5

	type pokemonType map[string]interface{}

	pokemonList := make(map[string]pokemonType)

	for i := 1; i <= number; i++ {
		url := "https://pokeapi.co/api/v2/pokemon/" + strconv.Itoa(i)
		response, err := http.Get(url)

		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		defer response.Body.Close()

		var pokemon pokemonType

		err = json.NewDecoder(response.Body).Decode(&pokemon)
		if err != nil {
			fmt.Println("Error decoding JSON:", err)
			return
		}

		pokemonList[pokemon["name"].(string)] = pokemon
	}

	var meanHeight float64 = 0
	var meanWeight float64 = 0

	for _, value := range pokemonList {
		meanHeight += value["height"].(float64)
		meanWeight += value["weight"].(float64)
	}

	fmt.Println("Mean height:", meanHeight/float64(len(pokemonList)))
	fmt.Println("Mean weight:", meanWeight/float64(len(pokemonList)))
}
