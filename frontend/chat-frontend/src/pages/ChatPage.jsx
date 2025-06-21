// src/pages/ChatPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Send,
  MessageCircle,
  Users,
  LogOut,
  UserPlus,
  Clock,
  Mail,
} from "lucide-react";
import "./ChatPage.css";

export default function ChatPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/v1/chat/history", authHeader);
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("/api/v1/user/profile", authHeader);
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setIsSearching(true);
    try {
      const res = await axios.get(
        `/api/v1/users/search?query=${encodeURIComponent(search)}`,
        authHeader
      );
      setResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInvite = async () => {
    if (!search.trim()) return;

    try {
      await axios.post("/api/v1/invite", { email: search }, authHeader);
      alert("Invite sent successfully!");
      setSearch("");
    } catch (error) {
      console.error("Invite error:", error);
      alert("Failed to send invite. Please try again.");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="chat-page">
      <div className="chat-page-content">
        {/* Header */}
        <div className="chat-header">
          <h1 className="chat-title">
            <MessageCircle
              size={32}
              style={{ display: "inline", marginRight: "12px" }}
            />
            ChatApp
          </h1>
          <p className="chat-subtitle">
            Welcome back, {currentUser?.name || currentUser?.username || "User"}
            !
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search users by name, username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
              <button
                onClick={handleSearch}
                className="search-button"
                disabled={isSearching}
              >
                <Search size={20} />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="search-results">
              <h3 className="results-title">
                <Users size={20} />
                Search Results ({results.length})
              </h3>
              {results.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="user-card"
                >
                  <div className="user-avatar">
                    {getInitials(user.name || user.username)}
                  </div>
                  <div className="user-info">
                    <h3>{user.name || user.username}</h3>
                    <p>
                      @{user.username} • {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite Section */}
          {search && results.length === 0 && !isSearching && (
            <div className="invite-section">
              <p className="invite-message">
                {isValidEmail(search)
                  ? `No user found with "${search}". Would you like to send an invite?`
                  : "No users found. Try searching with an email address to send an invite."}
              </p>
              {isValidEmail(search) && (
                <button onClick={handleInvite} className="invite-button">
                  <Mail size={20} />
                  Send Invite to {search}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="chat-history">
          <h2 className="section-title">
            <MessageCircle size={24} />
            Recent Chats
          </h2>

          {chats.length > 0 ? (
            <ul className="chat-list">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleUserClick(chat.user.id)}
                  className="chat-item"
                >
                  <div className="chat-avatar">
                    {getInitials(chat.user.name || chat.user.username)}
                    {chat.user.isOnline && (
                      <div className="online-status"></div>
                    )}
                  </div>
                  <div className="chat-details">
                    <h3>{chat.user.name || chat.user.username}</h3>
                    <p className="last-message">
                      {chat.lastMessage || "Start a conversation..."}
                    </p>
                  </div>
                  <div className="chat-meta">
                    <span className="chat-time">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <MessageCircle size={32} />
              </div>
              <h3 className="empty-title">No conversations yet</h3>
              <p className="empty-message">
                Search for users above to start your first conversation!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
