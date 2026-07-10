CREATE TABLE jadwal_acara (
    id BIGSERIAL PRIMARY KEY,
    acara_id BIGINT NOT NULL,
    detail_acara VARCHAR(255) NOT NULL,
    mulai_acara TIMESTAMP not null,
    selesai_acara TIMESTAMP not null,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_acara
        FOREIGN KEY(acara_id)
        REFERENCES acara(id)
);