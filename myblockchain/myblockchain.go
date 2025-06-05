package main

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"strconv"
	"time"
)

type Block struct {
	Timestamp     int64
	Data          []byte
	PrevBlockHash [32]byte
	Hash          [32]byte
}

func (b *Block) SetHash() {
	timestamp := []byte(strconv.FormatInt(b.Timestamp, 10))
	headers := bytes.Join([][]byte{b.PrevBlockHash[:], b.Data, timestamp}, []byte{})

	b.Hash = sha256.Sum256(headers)
}

func NewBlock(data string, prevBlockHash [32]byte) *Block {
	block := &Block{time.Now().Unix(), []byte(data), prevBlockHash, [32]byte{}}
	block.SetHash()
	return block
}

type BlockChain struct {
	blocks        map[[32]byte]*Block
	lastBlockHash [32]byte
}

func (bc *BlockChain) AddBlock(data string) {
	newBlock := NewBlock(data, bc.lastBlockHash)
	bc.blocks[newBlock.Hash] = newBlock
}

func NewGenesisBlock() *Block {
	return NewBlock("Genesis Block", [32]byte{})
}

func NewBlockChain() *BlockChain {
	genesisBlock := NewGenesisBlock()
	chain := make(map[[32]byte]*Block)
	chain[genesisBlock.Hash] = genesisBlock
	return &BlockChain{chain, genesisBlock.Hash}
}

func main() {
	bc := NewBlockChain()
	bc.AddBlock("First block")
	bc.AddBlock("Second block")

	for _, block := range bc.blocks {
		fmt.Printf("Prev. hash: %x\n", block.PrevBlockHash)
		fmt.Printf("Data: %s\n", block.Data)
		fmt.Printf("Hash: %x\n", block.Hash)
		fmt.Println()
	}
}
