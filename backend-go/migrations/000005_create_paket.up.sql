CREATE TABLE paket (
    id BIGSERIAL PRIMARY KEY,
    name_paket VARCHAR(100) NOT NULL,
    harga_paket numeric NOT NULL,
    deskripsi_paket text NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);