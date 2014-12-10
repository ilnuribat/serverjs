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
    //setTimeout(find_queue, 3000);
    clear();
    //Очередь по любому чистая, по крайней мере, после вызова clear();
    
    /*
     * Надо сделать цикл по всем дням, где есть люди.*/
    sql.main("SELECT date FROM qdriver UNION SELECT date FROM qpassenger;", function (error, rows) {
        /* Надо почистить переменные Var.qDriver и Var.qPassenger; - Ибо день теперь другой.  */ 
        for (var direction = 1; direction <= Var.directionSize; direction++)
            for (var time = 1; time <= 8; time++) {
                Var.qDriver[direction][time].splice(0);
                Var.qPassenger[direction][time].splice(0);
            }
        //Var.qDriver & Var.qPassenger чистые. Пора их заполнять
        var dates = [];
        for (var row in rows) dates.push(rows[row].date);
        

        for (var iDate = 0; iDate < dates.length; iDate++) {
            var DATE = dates[iDate];
            
            //Загрузим всю очередь за сегодня в массивы.
            sql.main(";", function (error, rows) { 
            });
            //Проблема: Как загрузить и водителей и пассажиров за 1 такт?
            //Возможно ли это?

            //Цикл по всем направлениям.
            for (var direction = 1; direction <= Var.directionSize; direction++) {
                //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
                //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
                //Кстати. не факт, что с шагом в 3 часа. 
                for (var TIME = 1; TIME <= 8; TIME++) {
                    //Если в очереди никого нет
                    if (Var.qDriver[direction][TIME].length * Var.qPassenger[direction][TIME].length == 0) {
                    } else
                        console.log("time: ", TIME, " direction: ", direction, " queue's size: ", 
                    Var.qDriver[direction][TIME].length + Var.qPassenger[direction][TIME].length);
                    //Цикл по всем Пассажирам
                    for (var iPass = 0; iPass < Var.qPassenger[direction][TIME].length; iPass++) {
                        var booked = Var.qPassenger[direction][TIME][iPass]["booked"] - 0;   //Сколько мест забронировать
                        var passengerID = Var.qPassenger[direction][TIME][iPass]["id"] - 0;  //ID пассажира
                        var pID = Var.qPassenger[direction][TIME][iPass]["idDB"] - 0; //Код пассажира в записи БД
                        //Цикл по всем водителям
                        for (var iDrive = 0; iDrive < Var.qDriver[direction][TIME].length && booked > 0; iDrive++) {
                            var driverID = Var.qDriver[direction][TIME][iDrive]["id"] - 0;       //ID водителя
                            var driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"] - 0; //Сколько свободных мест имеется у водителя
                            var idDB = Var.qDriver[direction][TIME][iDrive]["idDB"] - 0; //Код этой поездки в строке БД
                            if (booked <= driverSeats) {
                                // можно посадить пассажира на эту машину
                                
                                //Кидаем в БД запись о встрече пассажира(ов) и водителя
                                sql.main("INSERT INTO met(id_driver, id_passenger, id_direction, id_time)" +
                                    "VALUES(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ");", function (error, rows) {
                                    if (error) {
                                        console.log("errorDB: adding driver after meeting to MetTable(DB)");
                                    }
                                });
                                
                                //Уменьшаем количество свободных мест в машине.
                                Var.qDriver[direction][TIME][iDrive]["seats"] = driverSeats - booked;
                                driverSeats -= booked;
                                
                                //Изменяем запись в Базе Данных:
                                sql.main("UPDATE qdriver SET seats = " + Var.qDriver[direction][TIME][iDrive]["seats"] + " WHERE id = " + idDB + ";", 
                                    function (error, rows) {
                                    if (error) console.log("errorDB: could not update seats");
                                });
                                
                                //Выставляем количество забронированных мест у пассажира в ноль, ибо он только что сел
                                Var.qPassenger[direction][TIME][iPass]["booked"] = 0;
                                
                                //Меняем запись в Базе Данных, ставим 0 на количестве забронированных мест
                                sql.main("UPDATE qpassenger SET booked = 0 WHERE id = " + idDB + ";", function (error, rows) {
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
        }
    });
    //end: Цикл по дням, в очереди которых есть кто-либо    
}

//Неплохо было бы в отдельную функцию вывести процесс удаления с очереди, в случае, 
//Когда кончились места/бронирование
var clear = function clearQueue() {
    for (var direction = 1; direction <= Var.directionSize; direction++)
        for (var time = 1; time < 9; time++) {
            for (var iPass = 0; iPass < Var.qPassenger[direction][time].length; iPass++)
                while (Var.qPassenger[direction][time].length > iPass 
                    && Var.qPassenger[direction][time][iPass]["booked"] - 0 == 0) {
                    console.log("passenger removed from queue");
                    var idPass = Var.qPassenger[direction][time][iPass]["id"];
                    sql.main("DELETE FROM qPassenger WHERE id_passenger = " + idPass + " AND id_time = " + 
                        time + " AND id_direction = " + direction + ";", function (error, rows) {
                        if (error) console.log("errorDB: can't clear queue, where 'booked' < 1)");
                    });
                    Var.qPassenger[direction][time].splice(iPass, 1);
                }
            for (var iDrive = 0; iDrive < Var.qDriver[direction][time].length; iDrive++) {
                while (Var.qDriver[direction][time].length > iDrive
                    && Var.qDriver[direction][time][iDrive]["seats"] - 0 == 0) {
                    console.log("Driver removed from queue, cause he has 0 seats");
                    var idDrive = Var.qDriver[direction][time][iDrive]["id"];
                    sql.main("DELETE FROM qDriver WHERE id_driver = " + idDrive + " AND id_time = " + 
                        time + " AND id_direction = " + direction + ";", function (error, rows) {
                        if (error) console.log("errorDB: can't clear queue, where 'seats' < 1)", error);
                    });
                    Var.qDriver[direction][time].splice(iDrive, 1);
                }
            }
        }
}

exports.main = mainF;