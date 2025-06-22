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
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("access_token");

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
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/api/v1/chats/ws?token=${token}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      // Only add if message is from the current chat recipient
      if (data.sender_id === userId || data.recipient_id === userId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Save socket to state if needed
    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [userId]); // separate this effect from fetchData

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, userRes, selfRes] = await Promise.all([
          axios.get(`/api/v1/chats/messages/${userId}`, authHeader),
          axios.get(`/api/v1/user/${userId}`, authHeader),
          axios.get(`/api/v1/user/me`, authHeader),
        ]);

        setMessages(msgRes.data);
        setRecipient(userRes.data);
        setCurrentUserId(selfRes.data.uid);
        // setIsOnline(userRes.data.isOnline || Math.random() > 0.5);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  const sendMessage = async () => {
    // if (!input.trim()) return;

    // const newMessage = {
    //   content: input,
    //   timestamp: new Date().toISOString(),
    //   sender_id: currentUserId,
    //   recipient_id: userId,
    // };

    // try {
    //   await axios.post(
    //     "/api/v1/chats/messages/send",
    //     {
    //       recipient_id: userId,
    //       content: input,
    //     },
    //     authHeader
    //   );
    //   setMessages((prev) => [...prev, newMessage]);
    //   setInput("");
    // } catch (error) {
    //   console.error("Error sending message:", error);
    // }

    if (!input.trim() || !socket) return;

    const payload = {
      content: input,
      recipient_id: userId,
    };

    socket.send(JSON.stringify(payload));

    const newMessage = {
      sender_id: currentUserId,
      recipient_id: userId,
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
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
                {recipient?.first_name?.charAt(0)?.toUpperCase() ||
                  userId?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              {isOnline && <div className="online-indicator"></div>}
            </div>

            <div className="user-details">
              <h1>
                {recipient?.first_name + " " + recipient?.last_name ||
                  `User ${userId}`}
              </h1>
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
            <div className="date-separator">
              <div className="date-badge">{date}</div>
            </div>
            {msgs.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId;
              const showAvatar =
                !isMe && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);

              return (
                <div
                  key={i}
                  className={`message-row ${isMe ? "sent" : "received"}`}
                >
                  <div
                    className={`message-content ${isMe ? "sent" : "received"}`}
                  >
                    {!isMe && showAvatar && (
                      <div className="message-avatar small">
                        {recipient?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
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
