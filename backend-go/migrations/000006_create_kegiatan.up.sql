CREATE TABLE kegiatan (
    id BIGSERIAL PRIMARY KEY,
    nama_kegiatan VARCHAR(100) NOT NULL,
    code_kegiatan VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);