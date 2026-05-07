import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const sendMessage = async () => {

    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

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

      const errorMessage = {
        role: "assistant",
        content: "Error connecting to backend."
      };

      setMessages((prev) => [...prev, errorMessage]);

    }

    setLoading(false);
  };

  return (

    <div className="app">

      <div className="sidebar">

        <h2>SWS AI</h2>

        <p>Policy Assistant</p>

      </div>

      <div className="main">

        <div className="topbar">

          <h1>AI Company Policy Chatbot</h1>

        </div>

        <div className="chat-container">

          {messages.length === 0 && (

            <div className="welcome">

              <h2>Welcome 👋</h2>

              <p>
                Ask questions about HR, leave,
                resignation, WFH, IT policies and more.
              </p>

            </div>

          )}

          {messages.map((msg, index) => (

            <div
              key={index}
              className={
                msg.role === "user"
                  ? "message-row user-row"
                  : "message-row bot-row"
              }
            >

              <div
                className={
                  msg.role === "user"
                    ? "message user"
                    : "message bot"
                }
              >

                <p>{msg.content}</p>

                {msg.sources && (

                  <div className="sources">

                    <strong>Sources:</strong>

                    {msg.sources.map((source, i) => (
                      <span
                        key={i}
                        className="source-tag"
                      >
                        {source}
                      </span>
                    ))}

                  </div>

                )}

              </div>

            </div>

          ))}

          {loading && (

            <div className="typing">

              <span></span>
              <span></span>
              <span></span>

            </div>

          )}

          <div ref={chatEndRef}></div>

        </div>

        <div className="input-container">

          <input
            type="text"
            placeholder="Ask a company policy question..."
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

    </div>
  );
}

export default App;