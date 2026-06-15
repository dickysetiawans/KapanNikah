import React from "react";
import Button from "../../components/ui/button/Button"; // Sesuaikan path ke komponen Button kamu

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  // 3 Variabel Baru 👇
  showButton?: boolean;    // Menentukan tombol muncul/tidak
  buttonLabel?: string;   // Teks di dalam tombol
  buttonLink?: string;    // Link tujuan (bisa pakai tag <a> atau <Link> Next.js)
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  // Berikan nilai default agar tidak error jika tidak diisi 👇
  showButton = false,
  buttonLabel = "Tambah",
  buttonLink = "#",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header (Diubah jadi flex agar judul & tombol sejajar) */}
      <div className="flex items-center justify-between px-6 py-3 gap-3">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>

        {/* Kondisi jika showButton true, maka tombol akan muncul 👇 */}
        {showButton && (
          <>
            <a href={buttonLink}>
              <Button size="sm" variant="primary"
                style={{
                  height: "30px",
                  fontSize: "13px",
                  margin: "0"
                }}
              >
                {buttonLabel}
              </Button>
            </a>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;