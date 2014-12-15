var Var = require('./variables.js');
var sql = require('./sql.js');
/*
* Идем циклом по всем направлениям, затем по всем временным сегментам
* Затем по всем пассажирам, которые ещё что-то бронировали, затем по всем водителям, у которых ещё есть места
*/

/*
 * 
 *  Похоже, придется из базы тянуть данные, потом делать makeQueue
 *  Ибо по-другому никак.
 *  Все проблемы возникают из-за новой переменной "дата"
 * */

//встречаем людей
var mainF = function main() {
    
    //Чистим очередь
    sql.main("DELETE FROM qdriver WHERE seats = 0;", function (error, rows) { });
    sql.main("DELETE FROM qpassenger WHERE booked = 0;", function (error, rows) { });
    
    /*
     * Надо сделать цикл по всем дням, где есть люди.*/
    sql.main("SELECT date FROM qdriver UNION SELECT date FROM qpassenger;", function (error, rows) {
        var dates = [];
        for (var row in rows) dates.push(rows[row].date);
        
        //Для каждого дня запускаем
        dates.forEach(function (DATE) {
            //Загружаем водителей
            sql.main("SELECT id, id_driver, seats, id_time, id_direction FROM qdriver WHERE date = " + DATE + ";", function (error, rows) {
                //Проблема в том, что общая переменная qDriver(qPassenger) ведет себя плохо 
                //с асинхронными запросами в БД. Похоже, необходимо создать локальный массив, в котором
                //будем рассамтривать очередь.

                var qDriver = [];
                for (var i = 1; i <= Var.directionSize; i++) {
                    qDriver[i] = [];
                    for (var j = 0; j <= 8; j++)
                        qDriver[i][j] = [];
                }
                
                for (var row in rows) {
                    var id = rows[row]["id"];
                    var id_driver = rows[row]["id_driver"];
                    var seats = rows[row]["seats"];
                    var time = rows[row]["id_time"];
                    var direction = rows[row]["id_direction"];
                    driver_in_queue = {
                        "idDB": id,
                        "id": id_driver,
                        "seats": seats
                    };
                    qDriver[direction][time].push(driver_in_queue);
                }
                //Загружаем пассажиров
                sql.main("SELECT id, id_passenger, booked, id_time, id_direction FROM qpassenger WHERE date = " + DATE + ";", function (error, rows) {
                    //Никого в очереди нету
                    if (rows.length == 0)
                        return;
                    if (DATE == undefined || qDriver == undefined) {
                        
                        return;
                    }
                    qPassenger = [];
                    for (var i = 1; i <= Var.directionSize; i++) {
                        qPassenger[i] = [];
                        for (var j = 0; j <= 8; j++)
                            qPassenger[i][j] = [];
                    }
                    
                    for (var row in rows) {
                        var id = rows[row]["id"];
                        var id_passenger = rows[row]["id_passenger"];
                        var booked = rows[row]["booked"];
                        var time = rows[row]["id_time"];
                        var direction = rows[row]["id_direction"];
                        passenger_in_queue = {
                            "idDB": id,
                            "id": id_passenger,
                            "booked": booked
                        };
                        qPassenger[direction][time].push(passenger_in_queue);
                    }
                    
                    //Цикл по всем направлениям.
                    for (var direction = 1; direction <= Var.directionSize; direction++) {
                        //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
                        //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
                        //Кстати. не факт, что с шагом в 3 часа. 
                        for (var TIME = 1; TIME <= 8; TIME++) {                        
                            //Цикл по всем Пассажирам
                            for (var iPass = 0; iPass < qPassenger[direction][TIME].length; iPass++) {
                                var booked = qPassenger[direction][TIME][iPass]["booked"] - 0;   //Сколько мест забронировать
                                var passengerID = qPassenger[direction][TIME][iPass]["id"] - 0;  //ID пассажира
                                var pID = qPassenger[direction][TIME][iPass]["idDB"] - 0; //Код пассажира в записи БД
                                
                                //Цикл по всем водителям
                                for (var iDrive = 0; iDrive < qDriver[direction][TIME].length && booked > 0; iDrive++) {
                                    var driverID = qDriver[direction][TIME][iDrive]["id"] - 0;       //ID водителя
                                    var driverSeats = qDriver[direction][TIME][iDrive]["seats"] - 0; //Сколько свободных мест имеется у водителя
                                    var idDB = qDriver[direction][TIME][iDrive]["idDB"] - 0; //Код этой поездки в строке БД
                                    if (booked <= driverSeats) {
                                        // можно посадить пассажира на эту машину
                                        //Кидаем в БД запись о встрече пассажира(ов) и водителя
                                        sql.main("INSERT INTO met(id_driver, id_passenger, id_direction, id_time, date)" +
                                        "VALUES(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ", " + DATE + ");", function (error, rows) {
                                            if (error) {
                                                console.log("errorDB: adding driver after meeting to met");
                                            }
                                        });
                                        
                                        //Уменьшаем количество свободных мест в машине.
                                        qDriver[direction][TIME][iDrive]["seats"] = driverSeats - booked;
                                        driverSeats -= booked;
                                        
                                        //Изменяем запись в Базе Данных:
                                        sql.main("UPDATE qdriver SET seats = " + driverSeats + " WHERE id = " + idDB + ";", 
                                            function (error, rows) {
                                                if (error) console.log("errorDB: could not update seats");
                                        });
                                        
                                        //Выставляем количество забронированных мест у пассажира в ноль, ибо он только что сел
                                        qPassenger[direction][TIME][iPass]["booked"] = 0;
                                        
                                        //Меняем запись в Базе Данных, ставим 0 на количестве забронированных мест
                                        sql.main("UPDATE qpassenger SET booked = 0 WHERE id = " + pID + ";", function (error, rows) {
                                            if (error) console.log("errorDB: could update qpassenger.booked to zero");
                                        });
                                        //Если Пассажира посадили, то смысл дальше идти по водителям?
                                        booked = 0;
                                    }
                                    //end:if (booked <= driverSeats)
                                }
                                //end: Цикл по водителям
                            }
                            //end: Цикл по Пассажирам
                        }
                        //end: Цикл по временным промежуткам
                    }
                    //end: Цикл по направлениям
                });
                //Загрузили пассажиров
            });
            //Загрузили водителей
        });
        //end: Цикл по дням, в очереди которых есть кто-либо    
    });
    //sql.main - Выбор дней, где есть народ
}

exports.main = mainF;