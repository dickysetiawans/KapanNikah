CREATE TABLE ucapan_terimakasih (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    ucapan VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
        ON DELETE CASCADE
);
