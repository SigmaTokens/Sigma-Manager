
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);


ALTER TABLE agents
ADD COLUMN user_id INT,
ADD CONSTRAINT fk_agents_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE honeytokens
ADD COLUMN user_id INT,
ADD CONSTRAINT fk_honeytokens_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);