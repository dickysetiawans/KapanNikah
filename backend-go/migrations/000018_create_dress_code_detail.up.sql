CREATE TABLE dress_code_detail (
    id BIGSERIAL PRIMARY KEY,
    dress_code_id BIGINT NOT NULL,
    url_gambar VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_dress_code
        FOREIGN KEY(dress_code_id)
        REFERENCES dress_code(id)
        ON DELETE CASCADE
);
