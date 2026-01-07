import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // بنجيب مسار الصفحة الحالي
  const { pathname } = useLocation();

  useEffect(() => {
    // كل ما يتغير المسار (pathname)، ارفع الشاشة لفوق (0,0)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // ما برجع ولا اشي، بس وظيفة
};

export default ScrollToTop;
