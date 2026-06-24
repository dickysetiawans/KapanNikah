CREATE TABLE paket_detail_fitur (
    id BIGSERIAL PRIMARY KEY,
    paket_id BIGINT NOT NULL,
    fitur_id BIGINT NOT NULL,
    harga_fitur NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_paket
        FOREIGN KEY(paket_id)
        REFERENCES paket(id),

    CONSTRAINT fk_fitur
        FOREIGN KEY(fitur_id)
        REFERENCES fitur(id) 
);