CREATE TABLE dress_code (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    deskripsi VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
        ON DELETE CASCADE
);
