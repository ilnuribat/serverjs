use server;

SET character_set_server=utf8;
SET character_set_client=utf8;
SET character_set_connection=utf8;
SET character_set_results=utf8;

SELECT towns.name, dest.name, time.name, date, seats, driver.name 
FROM qdriver 
INNER JOIN direction ON direction.id = id_direction 
INNER JOIN towns ON towns.id = direction.id_source 
INNER JOIN towns as dest ON dest.id = direction.id_destination 
INNER JOIN driver ON driver.id = id_driver
INNER JOIN time ON time.id = id_time;
