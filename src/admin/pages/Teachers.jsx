import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Teachers() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>

        <Topbar title="Teachers" />

        <div style={{ padding: 30 }}>

          <h1
            style={{
              color: "#176b3a",
              marginBottom: 20,
            }}
          >
            Teachers
          </h1>

          <div
            style={{
              display: "flex",
              gap: 15,
              marginBottom: 25,
            }}
          >
            <Link to="/admin/add-teacher">
              <button style={greenBtn}>
                + Add Teacher
              </button>
            </Link>

            <input
              placeholder="Search Teacher..."
              style={searchInput}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,1fr)",
              gap: 20,
            }}
          >
            <Card
              title="Total Teachers"
              value="0"
              color="#3498db"
            />

            <Card
              title="Active"
              value="0"
              color="#2ecc71"
            />

            <Card
              title="Subjects"
              value="0"
              color="#f39c12"
            />

            <Card
              title="Classes"
              value="0"
              color="#8e44ad"
            />
          </div>

          <div
            style={{
              marginTop: 30,
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow:
                "0 5px 20px rgba(0,0,0,.08)",
            }}
          >
            <h3>Teacher List</h3>

            <p
              style={{
                color: "#777",
              }}
            >
              No Teachers Yet
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderTop:
          "5px solid " + color,
        borderRadius: 10,
        padding: 20,
      }}
    >
      <h2
        style={{
          color,
          margin: 0,
        }}
      >
        {value}
      </h2>

      <p>{title}</p>
    </div>
  );
}

const greenBtn = {
  background: "#1f7a3f",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const searchInput = {
  width: 300,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
};