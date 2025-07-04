-- Active: 1746970840720@@127.0.0.1@3306
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  genre VARCHAR(50),
  published_year INT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings and Comments table
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  book_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Insert specific books
INSERT INTO books (title, author, genre, published_year) VALUES
('L\'Enfant noir', 'Camara Laye', 'African Literature', 1953),
('Une si longue lettre', 'Mariama Bâ', 'African Literature', 1979),
('Allah n’est pas obligé', 'Ahmadou Kourouma', 'African Literature', 2000),
('Le Monde s’effondre', 'Chinua Achebe', 'African Literature', 1958),
('Sarraounia', 'Abdoulaye Mamani', 'African Historical Fiction', 1980),
('Peau noire, masques blancs', 'Frantz Fanon', 'African Philosophy', 1952),
('L’Aventure ambiguë', 'Cheikh Hamidou Kane', 'African Philosophy/Fiction', 1961),
('Éthiopiques', 'Léopold Sédar Senghor', 'African Philosophy/Poetry', 1956),
('Amkoullel, l’enfant peul', 'Amadou Hampâté Bâ', 'African Autobiography', 1991),
('Les Bouts de bois de Dieu', 'Ousmane Sembène', 'African Literature', 1960),
('Le Feu des origines', 'Emmanuel Dongala', 'African Fiction', 1987),
('Les Impatientes', 'Djaili Amadou Amal', 'African Literature', 2020),
('Notre-Dame du Nil', 'Scholastique Mukasonga', 'African Fiction', 2012),
('Introduction aux mathématiques modernes', 'Nicolas Bourbaki', 'Mathematics', 1939),
('Algèbre linéaire et ses applications', 'Gilbert Strang', 'Mathematics', 1976),
('L’Histoire des sciences', 'Stephen Hawking', 'Science', 2005),
('Éléments', 'Euclide', 'Mathematics', -300),
('Brève histoire du temps', 'Stephen Hawking', 'Science', 1988);

DELETE FROM library_db.books
WHERE title LIKE 'African Novel %' AND author LIKE 'African Author %';