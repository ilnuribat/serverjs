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

INSERT INTO `TIME` (`ID`, `NAME`) VALUES(1, '0');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(2, '3');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(3, '6');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(4, '9');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(5, '12');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(6, '15');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(7, '18');
INSERT INTO `TIME` (`ID`, `NAME`) VALUES(8, '21');

INSERT INTO `TOWNS` (`ID`, `NAME`, `RUSSIANNAME`) VALUES(1, 'Ufa', 'Уфа');
INSERT INTO `TOWNS` (`ID`, `NAME`, `RUSSIANNAME`) VALUES(1, 'Sibay', 'Сибай');
INSERT INTO `TOWNS` (`ID`, `NAME`, `RUSSIANNAME`) VALUES(1, 'Uchaly', 'Учалы');

INSERT INTO `DIRECTION`(`ID`, `ID_SOURCE`, `ID_DESTINATION`) VALUES(1, 1, 2);
INSERT INTO `DIRECTION`(`ID`, `ID_SOURCE`, `ID_DESTINATION`) VALUES(2, 1, 3);
INSERT INTO `DIRECTION`(`ID`, `ID_SOURCE`, `ID_DESTINATION`) VALUES(3, 2, 1);
INSERT INTO `DIRECTION`(`ID`, `ID_SOURCE`, `ID_DESTINATION`) VALUES(4, 3, 1);