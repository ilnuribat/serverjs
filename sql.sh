use server
CREATE TABLE time(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    russianName TEXT
);

CREATE TABLE towns(
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT,
    russianName TEXT
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