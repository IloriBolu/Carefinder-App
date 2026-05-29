import { Routes, Route } from "react-router-dom";
import Hospitals from "./pages/hospitals";
import Home from "./pages/home";
import HospitalDetail from "./pages/hospitalDetails";
import AdminLogin from "./pages/adminLogin";
import AdminRoute from "./components/adminRoute";
import AdminDashboard from "./pages/adminDashboard";
import Moderation from "./pages/reviewModeration";
import LoginPage from "./components/login";
import Signup from "./components/signup";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hospitals" element={<Hospitals />} />
      <Route path="/hospital/:id" element={<HospitalDetail />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
      <Route path="/admin/moderation" element={<AdminRoute><Moderation /></AdminRoute>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

