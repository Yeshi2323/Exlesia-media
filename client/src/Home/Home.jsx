import { useEffect, useState } from "react";
import "./Home.css";

export default function Home() {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const rows = 3; // 3 rows
  const columns = 4; // 4 columns
  const imagesPerPage = rows * columns; // 12 images per page

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/news");
        const data = await res.json();

        const imgs = data
          .filter((item) => item.image_url)
          .map((item) => ({
            id: item.id,
            url: item.image_url,
            caption: item.title,
          }));

        setImages(imgs);
      } catch (err) {
        console.error("FETCH IMAGES ERROR:", err);
      }
    };

    fetchImages();
  }, []);

  const totalPages = Math.ceil(images.length / imagesPerPage);

  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="home">
      <h2>Welcome</h2>

      <div
        className="gallery"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "16px",
        }}>
        {currentImages.map((img) => (
          <div key={img.id} className="card">
            <img src={img.url} alt={img.caption || "image"} />
            <p>{img.caption}</p>
          </div>
        ))}
      </div>

      {/* Show pagination only if images exceed one page */}
      {images.length > imagesPerPage && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
