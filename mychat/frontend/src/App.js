import './App.css';
import { connect, sendMsg } from './api';
import React, { Component } from "react";
import Header from './components/header';
import ChatHistory from './components/chathistory';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatHistory: []
    }
  }

  componentDidMount() {
    connect((msg) => {
      console.log("New Message")
      this.setState(prevStat => ({
        chatHistory: [...this.state.chatHistory, msg]
      }))
      console.log(this.state);
    })
  }

  send() {
    console.log("hello");
    sendMsg("hello");
  }

  render() {
    return (
      <div className='App'>
        <Header/>
        <ChatHistory chatHistory={this.state.chatHistory}/>
        <button onClick={this.send}>Hit</button>
      </div>
    )
  }
}

export default App;
