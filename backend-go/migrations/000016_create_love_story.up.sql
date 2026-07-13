CREATE TABLE galeri_pengantin (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    url_gambar VARCHAR(500) NOT NULL,
    keterangan VARCHAR(255),
    urutan INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
        ON DELETE CASCADE
);
