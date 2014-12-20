CREATE DATABASE server CHARACTER SET utf8 COLLATE utf8_unicode_ci;
use server
CREATE TABLE time(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(20)
);

CREATE TABLE towns(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(20),
    russianName VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci
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
	name VARCHAR(20) NOT NULL CHARACTER SET utf8 COLLATE utf8_unicode_ci
    phone VARCHAR(20) NOT NULL,
    access INTEGER	
);

CREATE TABLE passenger(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL CHARACTER SET utf8 COLLATE utf8_unicode_ci
    phone VARCHAR(20) NOT NULL,
    driversPhone VARCHAR(20)
);

CREATE TABLE qdriver(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_driver INTEGER,
    id_time INTEGER,
    id_direction INTEGER,
    seats INTEGER,
    date INTEGER,
    FOREIGN KEY (id_driver) REFERENCES driver(id),
    FOREIGN KEY (id_time)REFERENCES  time(id),
    FOREIGN KEY (id_direction)REFERENCES  direction(id)
);

CREATE TABLE qpassenger(
    id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_passenger INTEGER,
    id_time INTEGER,
    id_direction INTEGER,
    booked INTEGER,
    date INTEGER,
    FOREIGN KEY (id_passenger) REFERENCES passenger(id),
    FOREIGN KEY (id_time)REFERENCES  time(id),
    FOREIGN KEY (id_direction)REFERENCES  direction(id)
);
CREATE TABLE met(
	id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
	id_driver INTEGER,
	id_passenger INTEGER,
	id_direction INTEGER,
	id_time INTEGER,
	date INTEGER
);