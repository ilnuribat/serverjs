CREATE TABLE `direction` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `id_source` INT,
  `id_destination` INT,
  PRIMARY KEY  (`ID`)
);

CREATE TABLE `towns` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR,
  PRIMARY KEY  (`ID`)
);

CREATE TABLE `driver` (

);

CREATE TABLE `passanger` (

);

ALTER TABLE `direction` ADD CONSTRAINT `direction_fk1` FOREIGN KEY (`id_source`) REFERENCES towns(`ID`);
ALTER TABLE `direction` ADD CONSTRAINT `direction_fk2` FOREIGN KEY (`id_destination`) REFERENCES towns(`ID`);
