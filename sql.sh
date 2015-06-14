DROP DATABASE server;
CREATE DATABASE server CHARACTER SET utf8 COLLATE utf8_unicode_ci;
use server

CREATE TABLE towns(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(30),
    russianName VARCHAR(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci
)CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE direction(
        id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
        id_source INTEGER,
        id_destination INTEGER,
        FOREIGN KEY (id_source) REFERENCES towns(id),
        FOREIGN KEY (id_destination) REFERENCES towns(id)
);

CREATE TABLE driver(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL COLLATE utf8_unicode_ci,
    phone VARCHAR(11) NOT NULL,
	UNIQUE KEY uniquePhone(phone)	
)CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE qdriver(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_driver INTEGER NOT NULL,
    id_direction INTEGER NOT NULL,
    date DATE NOT NULL,
	time VARCHAR(5) NOT NULL,
	exactPlace VARCHAR(30),
	UNIQUE KEY uniqueDriverInQueue(id_driver, id_direction, date, time),
    FOREIGN KEY (id_driver) REFERENCES driver(id),
    FOREIGN KEY (id_direction)REFERENCES  direction(id)
);