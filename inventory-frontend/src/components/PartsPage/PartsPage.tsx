import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";

const PartsPage = () => {
  const [parts, setParts] = useState<any[]>([]);
  const navigate = useNavigate();

  const { openPart } = useModal();

  useEffect(() => {
    const fetchParts = async () => {
      const res = await api.get("/wp/v2/part");
      setParts(res.data || []);
    };

    fetchParts();
  }, []);

  return (
    <div>
      <h1>Parts</h1>

      {/* ADD BUTTON */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={openPart}>
          Add Part
        </button>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {parts.map((part) => (
          <div
            key={part.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {part.name}
            </div>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              ID: {part.id}
            </div>

            <button
              onClick={() => navigate(`/part/${part.id}`)}
            >
              View / Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartsPage;