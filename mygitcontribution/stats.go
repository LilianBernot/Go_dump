package main

import (
	git "gopkg.in/src-d/go-git.v4"
)

const daysInLastSixMonths = 183

func fillCommits(email string, path string, commits map[int]int) map[int]int {
	repo, err := git.PlainOpen(path)
	println("iue")
	print(repo, err)
	return commits
}

func processRepositories(email string) map[int]int {
	// filePath := getDotFilePath()
	// repos := parseFileLinesToSlice(filePath)
	daysInMap := daysInLastSixMonths

	commits := make(map[int]int, daysInMap)
	for i := daysInMap; i > 0; i-- {
		commits[i] = 0
	}

	// for _, path := range repos {
	commits = fillCommits(email, "~/go/src/github.com/DataDog/perso/go_dump/mygitcontribution", commits)
	// }

	return commits
}

func stats(email string) {
	commits := processRepositories(email)
	println(commits)
	// printCommitsStats(commits)
}
