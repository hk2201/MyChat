// src/pages/ChatRoomPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Phone, Video } from "lucide-react";
import "./ChatRoomPage.css";

export default function ChatRoomPage() {
  const { userId } = useParams(); // recipient
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/v1/messages/${userId}`, authHeader);
        setMessages(res.data);

        // Fetch recipient info (you might need to adjust this endpoint)
        const recipientRes = await axios.get(
          `/api/v1/users/${userId}`,
          authHeader
        );
        setRecipient(recipientRes.data);
        setIsOnline(recipientRes.data.isOnline || Math.random() > 0.5); // Mock online status
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "me", content: input, timestamp: new Date() };

    try {
      await axios.post(
        "/api/v1/messages/",
        {
          recipient_id: userId,
          content: input,
        },
        authHeader
      );
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.timestamp);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
          </button>

          <div className="user-info">
            <div className="avatar-container">
              <div className="avatar">
                {recipient?.name?.charAt(0)?.toUpperCase() ||
                  userId?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              {isOnline && <div className="online-indicator"></div>}
            </div>

            <div className="user-details">
              <h1>{recipient?.name || `User ${userId}`}</h1>
              <p>{isOnline ? "Online" : "Last seen recently"}</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-button">
            <Phone size={20} />
          </button>
          <button className="action-button">
            <Video size={20} />
          </button>
          <button className="action-button">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="message-group">
            {/* Date Separator */}
            <div className="date-separator">
              <div className="date-badge">{date}</div>
            </div>

            {/* Messages for this date */}
            {msgs.map((msg, i) => {
              const isMe = msg.sender === "me";
              const showAvatar =
                !isMe && (i === 0 || msgs[i - 1]?.sender !== msg.sender);

              return (
                <div
                  key={i}
                  className={`message-row ${isMe ? "sent" : "received"}`}
                >
                  <div
                    className={`message-content ${isMe ? "sent" : "received"}`}
                  >
                    {/* Avatar for received messages */}
                    {!isMe && (
                      <div className="message-avatar">
                        {showAvatar && (
                          <div className="message-avatar small">
                            {recipient?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`message-bubble ${isMe ? "sent" : "received"}`}
                    >
                      <p className="message-text">{msg.content}</p>
                      <p className="message-time">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-content">
              <div className="message-avatar small">
                {recipient?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="message-input"
              placeholder="Type a message..."
              rows="1"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`send-button ${input.trim() ? "active" : "inactive"}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
