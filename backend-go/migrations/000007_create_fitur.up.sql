CREATE TABLE fitur (
    id BIGSERIAL PRIMARY KEY,

    nama_fitur VARCHAR(255) NOT NULL,
    harga_fitur numeric NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    kegiatan_id BIGINT NOT NULL,
    code_fitur VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_kegiatan
    FOREIGN KEY(kegiatan_id)
    REFERENCES kegiatan(id)
);