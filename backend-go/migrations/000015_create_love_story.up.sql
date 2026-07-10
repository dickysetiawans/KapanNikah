CREATE TABLE love_story (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    kategori VARCHAR(255) NOT NULL,
    tanggal date not null,
    deskripsi text not null,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
);