import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {

    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat",
        {
          question: question
        }
      );

      const botMessage = {
        role: "assistant",
        content: response.data.answer,
        sources: response.data.sources
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      console.error(error);

      alert("Error connecting to backend");

    }

    setQuestion("");
    setLoading(false);
  };

  return (

    <div className="app">

      <div className="header">
        <h1>SWS AI Policy Assistant</h1>
      </div>

      <div className="chat-container">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.role === "user"
                ? "message user"
                : "message bot"
            }
          >

            <p>{msg.content}</p>

            {msg.sources && (
              <div className="sources">
                Sources:
                {msg.sources.join(", ")}
              </div>
            )}

          </div>

        ))}

        {loading && (
          <div className="loading">
            Thinking...
          </div>
        )}

      </div>

      <div className="input-container">

        <input
          type="text"
          placeholder="Ask about company policies..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}

export default App;