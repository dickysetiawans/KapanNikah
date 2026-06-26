CREATE TABLE template (
    id BIGSERIAL PRIMARY KEY,
    paket_id BIGINT NOT NULL,
    nama_template VARCHAR(255) NOT NULL,
    code_template VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_paket
        FOREIGN KEY(paket_id)
        REFERENCES paket(id)
);