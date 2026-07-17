import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

export default function Students() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: 30 }}>
        <h1>Students</h1>

        <Link to="/admin/add-student">
          <button style={{ cursor: "pointer" }}>
            Add Student
          </button>
        </Link>

        <Link to="/admin/bulk-registration">
          <button style={{ marginLeft: 10, cursor: "pointer" }}>
            Bulk Registration
          </button>
        </Link>

      </div>
    </div>
  );
}