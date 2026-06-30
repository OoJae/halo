import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";

// Marketing layout: fixed Nav + vignette overlay + page content + Footer.
// Each page renders its own <HaloCanvas> backdrop (params differ per page).
export default function Layout() {
  return (
    <>
      <div className="halo-vignette" />
      <Nav />
      <main className="page" style={{ minHeight: "60vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
