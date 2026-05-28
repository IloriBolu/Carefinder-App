import { Routes, Route } from "react-router-dom";
import Hospitals from "./pages/hospitals";
import Home from "./pages/home";
import HospitalDetail from "./pages/hospitalDetails";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hospitals" element={<Hospitals />} />
      <Route path="/hospital/:id" element={<HospitalDetail />} />
    </Routes>
  );
}

