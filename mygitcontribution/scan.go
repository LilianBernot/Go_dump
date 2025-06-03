package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"os/user"
	"strings"
)

func scanGitFolders(folders []string, folder string) []string {
	folder = strings.TrimSuffix(folder, "/")

	file, err := os.Open(folder)
	if err != nil {
		log.Fatal(err)
	}
	files, err := file.Readdir(-1)
	file.Close()
	if err != nil {
		log.Fatal(err)
	}

	var path string

	for _, file := range files {
		if file.IsDir() {
			path = folder + "/" + file.Name()
			if file.Name() == ".git" {
				path = strings.TrimSuffix(path, "/.git")
				fmt.Println(path)
				folders = append(folders, path)
				continue
			}
			if file.Name() == "vendor" || file.Name() == "node_modules" {
				continue
			}
			folders = scanGitFolders(folders, path)
		}
	}

	return folders
}

func recursiveScanFolder(folder string) []string {
	return scanGitFolders(make([]string, 0), folder)
}

func getDotFilePath() string {
	user, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}

	dotFile := user.HomeDir + "/.gogitlocalstats"

	return dotFile
}

func openFile(filePath string) *os.File {
	file, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			_, err = os.Create(filePath)
			if err != nil {
				panic(err)
			}
		} else {
			panic(err)
		}
	}

	return file
}

func parseFileLinesToSlice(filePath string) []string {
	file := openFile(filePath)
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		if err != io.EOF {
			panic(err)
		}
	}

	return lines
}

func sliceContains(slices []string, element string) bool {
	for _, slice := range slices {
		if slice == element {
			return true
		}
	}
	return false
}

func joinSlices(newSlices []string, existingSlices []string) []string {
	for _, new := range newSlices {
		if !sliceContains(existingSlices, new) {
			existingSlices = append(existingSlices, new)
		}
	}

	return existingSlices
}

func dumpStringsSliceToFile(slices []string, filePath string) {
	content := strings.Join(slices, "\n")
	err := os.WriteFile(filePath, []byte(content), os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}
}

func addNewSliceElementsToFile(filePath string, newRepos []string) {
	existingRepos := parseFileLinesToSlice(filePath)
	repos := joinSlices(newRepos, existingRepos)
	dumpStringsSliceToFile(repos, filePath)
}

func scan(folder string) {
	fmt.Print("Found folders: \n\n")
	repositories := recursiveScanFolder(folder)
	filePath := getDotFilePath()
	addNewSliceElementsToFile(filePath, repositories)
	fmt.Printf("\n\nSuccessfully added\n\n")
}
