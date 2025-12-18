import { useEffect, useState } from "react";
import { getToken, isAdmin, apiFetch } from "../utils/api";
import ButtonA from "../Buttons/ButtonA";
import ButtonB from "../Buttons/ButtonB";
import ButtonC from "../Buttons/ButtonC";
import "./News.css";

export default function News() {
  const [news, setNews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState(isAdmin());
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 2; // 2 posts per page

  // Fetch news
  const fetchNews = async () => {
    try {
      const data = await apiFetch("/news");
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH NEWS ERROR:", err);
      setError("Failed to load news");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Create or update news
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content cannot be empty");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      if (imageFile) fd.append("image", imageFile);

      if (editingId) {
        await apiFetch(`/news/${editingId}`, { method: "PUT", body: fd });
      } else {
        await apiFetch("/news", { method: "POST", body: fd });
      }

      setForm({ title: "", content: "" });
      setImageFile(null);
      setPreview("");
      setEditingId(null);
      setError("");
      fetchNews();
    } catch (err) {
      console.error("CREATE/UPDATE ERROR:", err);
      setError(err.error || "Server error");
    }
  };

  // Delete news
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this news item?")) return;

    try {
      await apiFetch(`/news/${id}`, { method: "DELETE" });
      fetchNews();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError(err.error || "Server error");
    }
  };

  // Logout admin
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAdmin(false);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = news.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(news.length / postsPerPage);

  return (
    <div className="news-page">
      <h2>News</h2>

      {admin && <ButtonC onClick={handleLogout}>Logout</ButtonC>}

      {/* Admin Editor */}
      {admin && (
        <div className="editor">
          <h3>{editingId ? "Edit News" : "Create News"}</h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
            }}
          />

          {preview && (
            <img src={preview} alt="Preview" className="preview-img" />
          )}

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <div className="editor-buttons">
            <ButtonA onClick={handleSubmit}>
              {editingId ? "Save" : "Create"}
            </ButtonA>
            {editingId && (
              <ButtonB
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", content: "" });
                  setPreview("");
                  setImageFile(null);
                  setError("");
                }}>
                Cancel
              </ButtonB>
            )}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* News List */}
      <div className="news-list">
        {currentPosts.map((item) => (
          <article key={item.id} className="news-item">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="news-image"
              />
            )}
            <h4 className="news-title">{item.title}</h4>
            <p>{item.content}</p>
            <small>Posted: {new Date(item.created_at).toLocaleString()}</small>

            {admin && (
              <div className="news-actions">
                <ButtonA
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({ title: item.title, content: item.content });
                    setPreview(item.image_url || "");
                  }}>
                  Edit
                </ButtonA>
                <ButtonB onClick={() => handleDelete(item.id)}>Delete</ButtonB>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Pagination */}
      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}>
          Prev
        </button>

        <span className="page-number">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
