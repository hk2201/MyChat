import React, { useEffect, useState } from "react";
import { Search, MessageCircle, LogOut, Mail, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chattedUsers, setChattedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState({ name: "John Doe" });

  // Mock data for demo
  useEffect(() => {
    const fetchChattedUsers = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch(
          "https://mychat-brfy.onrender.com/api/v1/chats/chatted-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chatted users");
        }

        const data = await response.json();
        setChattedUsers(data);
      } catch (error) {
        console.error("Error fetching chatted users:", error);
        setChattedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChattedUsers();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const token = localStorage.getItem("access_token");

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://mychat-brfy.onrender.com/api/v1/user/search?query=${encodeURIComponent(
          search
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // replace with actual token logic
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      // data is expected to be a list of users (List[UserRead])
      setResults(data);
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

  const handleInvite = () => {
    alert(`Invite sent to ${search}!`);
    setSearch("");
  };

  const handleUserClick = (userId) => {
    console.log(`Navigate to chat with user ${userId}`);
    navigate(`/chat/${userId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // localStorage.removeItem("user");
    navigate("/");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
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

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "24px",
      color: "#333",
      margin: "0 0 8px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    subtitle: {
      color: "#666",
      margin: 0,
    },
    searchSection: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    searchContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
    },
    searchInput: {
      flex: 1,
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
    },
    searchButton: {
      padding: "12px 20px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
    },
    resultsSection: {
      marginTop: "16px",
    },
    resultsTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    userCard: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      border: "1px solid #e9ecef",
      borderRadius: "6px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#007bff",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "600",
      marginRight: "12px",
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      margin: "0 0 4px 0",
    },
    userDetails: {
      fontSize: "12px",
      color: "#666",
      margin: 0,
    },
    inviteSection: {
      textAlign: "center",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      borderRadius: "6px",
      marginTop: "16px",
    },
    inviteMessage: {
      color: "#666",
      marginBottom: "12px",
    },
    inviteButton: {
      padding: "10px 16px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
    },
    chatHistory: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    chatList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    chatItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    chatAvatar: {
      position: "relative",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#6c757d",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "600",
      marginRight: "12px",
    },
    onlineStatus: {
      position: "absolute",
      bottom: "2px",
      right: "2px",
      width: "12px",
      height: "12px",
      backgroundColor: "#28a745",
      borderRadius: "50%",
      border: "2px solid white",
    },
    chatDetails: {
      flex: 1,
      minWidth: 0,
    },
    chatName: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      margin: "0 0 4px 0",
    },
    lastMessage: {
      fontSize: "14px",
      color: "#666",
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    chatMeta: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "4px",
    },
    chatTime: {
      fontSize: "12px",
      color: "#999",
    },
    unreadBadge: {
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "10px",
      padding: "2px 6px",
      fontSize: "12px",
      minWidth: "18px",
      textAlign: "center",
    },
    emptyState: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#666",
    },
    emptyIcon: {
      marginBottom: "16px",
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: "18px",
      marginBottom: "8px",
      color: "#333",
    },
    emptyMessage: {
      fontSize: "14px",
    },
    footer: {
      textAlign: "center",
    },
    logoutButton: {
      padding: "10px 20px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .user-card:hover { background-color: #f8f9fa; }
          .chat-item:hover { background-color: #f8f9fa; }
          .search-button:hover { background-color: #0056b3; }
          .search-button:disabled { opacity: 0.6; cursor: not-allowed; }
          .invite-button:hover { background-color: #218838; }
          .logout-button:hover { background-color: #c82333; }
        `}
      </style>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <MessageCircle size={24} />
            ChatApp
          </h1>
        </div>

        {/* Search Section */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search users by name, username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.searchInput}
            />
            <button
              onClick={handleSearch}
              style={styles.searchButton}
              className="search-button"
              disabled={isSearching}
            >
              <Search size={16} />
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div style={styles.resultsSection}>
              <h3 style={styles.resultsTitle}>
                <Users size={16} />
                Search Results ({results.length})
              </h3>
              {results.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  style={styles.userCard}
                  className="user-card"
                >
                  <div style={styles.userAvatar}>
                    {getInitials(user.name || user.username)}
                  </div>
                  <div style={styles.userInfo}>
                    <h3 style={styles.userName}>
                      {user.name || user.username}
                    </h3>
                    <p style={styles.userDetails}>
                      @{user.username} • {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite Section */}
          {search && results.length === 0 && !isSearching && (
            <div style={styles.inviteSection}>
              <p style={styles.inviteMessage}>
                {isValidEmail(search)
                  ? `No user found with "${search}". Would you like to send an invite?`
                  : "No users found. Try searching with an email address to send an invite."}
              </p>
              {isValidEmail(search) && (
                <button
                  onClick={handleInvite}
                  style={styles.inviteButton}
                  className="invite-button"
                >
                  <Mail size={16} />
                  Send Invite to {search}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div style={styles.chatHistory}>
          <h2 style={styles.sectionTitle}>
            <MessageCircle size={20} />
            Recent Chats
          </h2>

          {chattedUsers.length > 0 ? (
            <ul style={styles.chatList}>
              {chattedUsers.map((user) => (
                <li
                  key={user.uid}
                  onClick={() => handleUserClick(user.uid)}
                  style={styles.chatItem}
                  className="chat-item"
                >
                  <div style={styles.chatAvatar}>
                    {getInitials(`${user.first_name} ${user.last_name}`)}
                  </div>
                  <div style={styles.chatDetails}>
                    <h3 style={styles.chatName}>
                      {user.first_name} {user.last_name}
                    </h3>
                    <p style={styles.lastMessage}>
                      @{user.username} • {user.email}
                    </p>
                  </div>
                  {/* You can optionally add chatMeta if you later get last message info */}
                </li>
              ))}
            </ul>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <MessageCircle size={48} />
              </div>
              <h3 style={styles.emptyTitle}>No conversations yet</h3>
              <p style={styles.emptyMessage}>
                Search for users above to start your first conversation!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            className="logout-button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
