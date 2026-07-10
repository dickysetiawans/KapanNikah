CREATE TABLE undangan (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    nama_pengunjung VARCHAR(255) NOT NULL,
    no_hanphone BIGINT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
);