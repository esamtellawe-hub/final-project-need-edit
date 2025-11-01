import { useLocation } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ["/Login", "/SignUp"]; // أو أي صفحة بدك تخفي فيها الناف بار والفوتر

  return (
    <>
      {!hideLayout.includes(location.pathname) && <NavBar />}
      <main>{children}</main>
      {!hideLayout.includes(location.pathname) && <Footer />}
    </>
  );
};

export default Layout;
