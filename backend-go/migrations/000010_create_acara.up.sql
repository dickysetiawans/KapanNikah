CREATE TABLE acara (
    id BIGSERIAL PRIMARY KEY,
    pelanggan_id BIGINT NOT NULL,
    kegiatan_id BIGINT NOT NULL,
    paket_id BIGINT NOT NULL,
    jumlah_tamu INTEGER NOT NULL,
    nama_acara VARCHAR(255) NOT NULL,
    tanggal_mulai TIMESTAMP NOT NULL,
    tanggal_selesai TIMESTAMP NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_users
        FOREIGN KEY(pelanggan_id)
        REFERENCES users(id),

    CONSTRAINT fk_kegiatan
        FOREIGN KEY(kegiatan_id)
        REFERENCES kegiatan(id),

    CONSTRAINT fk_paket
        FOREIGN KEY(paket_id)
        REFERENCES paket(id)
);