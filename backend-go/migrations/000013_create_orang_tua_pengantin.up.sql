CREATE TABLE orang_tua_pengantin (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    nama_ayah_pengantin_pria VARCHAR(255) NOT NULL,
    nama_ibu_pengantin_pria VARCHAR(255) NOT NULL,
    nama_ayah_pengantin_wanita VARCHAR(255) NOT NULL,
    nama_ibu_pengantin_wanita VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
);