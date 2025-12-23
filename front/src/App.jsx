import "./i18n";
import { useState, useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import SignUp from "./Pages/SingUp";
import Layout from "./components/Layout";
import Home from "./Pages/Home";
import Swap from "./Pages/Swap";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Details from "./Pages/details";
import Profile from "./Pages/Profile";
import AddItem from "./Pages/AddItem";
import AboutUs from "./Pages/Aboutus";
import EditItem from "./Pages/EditItem";
import NotFound from "./pages/NotFound";
import Chat from "./Pages/Chat";
import Messages from "./Pages/Messages";
import MessageBubble from "./components/MessageBubble";
import Favorites from "./pages/Favorites";
function ChatWrapper() {
  const { receiverId } = useParams();
  return <Chat receiverId={parseInt(receiverId)} />;
}

function App() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLang") || "en";
    setLang(savedLang);
    document.documentElement.setAttribute("lang", savedLang);
    document.documentElement.setAttribute(
      "dir",
      savedLang === "ar" ? "rtl" : "ltr"
    );
  }, []);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Swap" element={<Swap />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/AddItem" element={<AddItem />} />
          <Route path="/Aboutus" element={<AboutUs />} />
          <Route path="/edit/:id" element={<EditItem />} />
          <Route path="/chat/:receiverId" element={<ChatWrapper />} />{" "}
          <Route path="/messages" element={<Messages />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
