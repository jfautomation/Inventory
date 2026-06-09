import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

const PartDetail = () => {
  const { id } = useParams();
  const [part, setPart] = useState<any>(null);

  useEffect(() => {
    const fetchPart = async () => {
      const res = await api.get(`/wp/v2/part/${id}`);
      setPart(res.data);
    };

    fetchPart();
  }, [id]);

  if (!part) return <div>Loading...</div>;

  return (
    <div>
      <h1>Part Detail</h1>

      <div>ID: {part.id}</div>

      <input
        value={part.name || ""}
        onChange={(e) =>
          setPart({ ...part, name: e.target.value })
        }
      />

      <button
        onClick={async () => {
          await api.put(`/wp/v2/part/${id}`, {
            name: part.name,
          });

          alert("Saved");
        }}
      >
        Save
      </button>
    </div>
  );
};

export default PartDetail;