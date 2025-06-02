import './App.css';
import { connect, sendMsg } from './api';
import React, { Component } from "react";
import Header from './components/header';
import ChatHistory from './components/chathistory';
import ChatInput from './components/chatinput';

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

  send(event) {
    if(event.keyCode === 13) {
      sendMsg(event.target.value);
      event.target.value = "";
    }
  }

  render() {
    return (
      <div className='App'>
        <Header/>
        <ChatHistory chatHistory={this.state.chatHistory}/>
        <ChatInput send={this.send} />
      </div>
    )
  }
}

export default App;
