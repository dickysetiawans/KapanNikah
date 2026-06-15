CREATE TABLE role_permissions (

    id BIGSERIAL PRIMARY KEY,

    role_id BIGINT NOT NULL,

    permission_id BIGINT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_role
      FOREIGN KEY(role_id)
      REFERENCES roles(id),

    CONSTRAINT fk_permission
      FOREIGN KEY(permission_id)
      REFERENCES permissions(id)
);