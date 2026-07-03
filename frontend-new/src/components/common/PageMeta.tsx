import { useEffect } from "react";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  useEffect(() => {
    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);
  }, [title, description]);

  return null;
};

// AppWrapper sekarang gak perlu provider apa-apa lagi,
// tapi tetap diekspor biar main.tsx gak perlu diubah sama sekali.
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default PageMeta;