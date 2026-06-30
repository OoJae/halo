import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import Developers from "./pages/Developers";
import UseCases from "./pages/UseCases";
import Manifesto from "./pages/Manifesto";
import Prover from "./pages/Prover";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/manifesto" element={<Manifesto />} />
      </Route>
      <Route path="/app" element={<Prover />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
