use server
CREATE TABLE time(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    russianName TEXT
);

CREATE TABLE towns(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT
);

CREATE TABLE direction(
        id INTEGER PRIMARY KEY NOT NULL,
        id_source INTEGER,
        id_destination INTEGER,
        FOREIGN KEY (id_source) REFERENCES towns(id),
        FOREIGN KEY (id_destination) REFERENCES towns(id)
);

CREATE TABLE driver(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    phone TEXT,
    access INTEGER
);

CREATE TABLE passanger(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    phone TEXT,
    driversPhone TEXT
);

CREATE TABLE qDriver(
    id INTEGER PRIMARY KEY NOT NULL,
    id_driver INTEGER,
    id_time INTEGER,
    id_direction INTEGER,
    seats INTEGER,
    qOrder INTEGER,
    FOREIGN KEY (id_driver) REFERENCES driver(id),
    FOREIGN KEY (id_time)REFERENCES  time(id),
    FOREIGN KEY (id_direction)REFERENCES  direction(id)
);

CREATE TABLE qPassanger(
    id INTEGER PRIMARY KEY NOT NULL,
    id_passanger INTEGER,
    id_time INTEGER,
    id_direction INTEGER,
    booked INTEGER,
    qOrder INTEGER,
    FOREIGN KEY (id_passanger) REFERENCES passanger(id),
    FOREIGN KEY (id_time)REFERENCES  time(id),
    FOREIGN KEY (id_direction)REFERENCES  direction(id)
);

INSERT INTO `time` (`id`, `name`) VALUES(1, '0');
INSERT INTO `time` (`id`, `name`) VALUES(2, '3');
INSERT INTO `time` (`id`, `name`) VALUES(3, '6');
INSERT INTO `time` (`id`, `name`) VALUES(4, '9');
INSERT INTO `time` (`id`, `name`) VALUES(5, '12');
INSERT INTO `time` (`id`, `name`) VALUES(6, '15');
INSERT INTO `time` (`id`, `name`) VALUES(7, '18');
INSERT INTO `time` (`id`, `name`) VALUES(8, '21');
 
INSERT INTO `towns` (`id`, `name`, `russianname`) VALUES(1, 'Ufa', 'Уфа');
INSERT INTO `towns` (`id`, `name`, `russianname`) VALUES(1, 'Sibay', 'Сибай');
INSERT INTO `towns` (`id`, `name`, `russianname`) VALUES(1, 'Uchaly', 'Учалы');
 
INSERT INTO `direction`(`id`, `id_source`, `id_destination`) VALUES(1, 1, 2);
INSERT INTO `direction`(`id`, `id_source`, `id_destination`) VALUES(2, 1, 3);
INSERT INTO `direction`(`id`, `id_source`, `id_destination`) VALUES(3, 2, 1);
INSERT INTO `direction`(`id`, `id_source`, `id_destination`) VALUES(4, 3, 1);