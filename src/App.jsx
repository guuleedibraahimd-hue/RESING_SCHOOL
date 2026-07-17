import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import Dashboard from "./admin/pages/Dashboard";
import AddStudent from "./admin/pages/AddStudent";
import Students from "./admin/pages/Students";
import Teachers from "./admin/pages/Teachers";
import Parents from "./admin/pages/Parents";
import Classes from "./admin/pages/Classes";
import Attendance from "./admin/pages/Attendance";
import Exams from "./admin/pages/Exams";
import Reports from "./admin/pages/Reports";
import Settings from "./admin/pages/Settings";
import BulkRegistration from "./admin/pages/BulkRegistration";
import AddTeacher from "./admin/pages/AddTeacher";

// Teacher Pages
import TeacherDashboard from "./teacher/Dashboard";
import TeacherAttendance from "./teacher/Attendance";
import TeacherExams from "./teacher/Exams";
import TeacherStudents from "./teacher/Students";
import TeacherResults from "./teacher/Results";
import TeacherProfile from "./teacher/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Login */}
        <Route path="/admin-login" element={<Login role="Admin" />} />
        <Route path="/teacher-login" element={<Login role="Teacher" />} />
        <Route path="/student-login" element={<Login role="Student" />} />
        <Route path="/parent-login" element={<Login role="Parent" />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/add-student" element={<AddStudent />} />
        <Route path="/admin/bulk-registration" element={<BulkRegistration />} />
        <Route path="/admin/add-teacher" element={<AddTeacher />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/teachers" element={<Teachers />} />
        <Route path="/admin/parents" element={<Parents />} />
        <Route path="/admin/classes" element={<Classes />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/exams" element={<Exams />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/exams" element={<TeacherExams />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/results" element={<TeacherResults />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;