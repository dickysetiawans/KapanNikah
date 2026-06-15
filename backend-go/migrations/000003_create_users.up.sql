CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255)
    UNIQUE NOT NULL,

    phone VARCHAR(50),

    password TEXT NOT NULL,

    role_id BIGINT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_role
    FOREIGN KEY(role_id)
    REFERENCES roles(id)
);