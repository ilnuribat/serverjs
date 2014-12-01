var Var = require('./variables.js');
var sql = require('./sql.js');
/*
* Идем циклом по всем направлениям, затем по всем временным сегментам
* Затем по всем пассажирам, которые ещё что-то бронировали, затем по всем водителям, у которых ещё есть места
*/

//встречаем людей
var find = function find_queue() {
    //setTimeout(find_queue, 5000);
    console.log("makeQueue");
    //Цикл по всем направлениям.
    for(var direction = 1; direction <= Var.directionSize; direction ++){
        //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
        //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
        for(var TIME = 1; TIME <= 8; TIME ++){
            //Если в очереди никого нет
            if(Var.qDriver[direction][TIME].length * Var.qPassenger[direction][TIME].length == 0) {
            } else
                console.log("time: ", TIME, " direction: ", direction, " queue's size: ", 
                    Var.qDriver[direction][TIME].length + Var.qPassenger[direction][TIME].length);
            //Цикл по всем Пассажирам
            for (var iPass = 0; iPass < Var.qPassenger[direction][TIME].length; iPass++) {
                
                while (Var.qPassenger[direction][TIME][iPass]["booked"] - 0 == 0) {
                    var passengerID = Var.qPassenger[direction][TIME][iPass]["id"]
                    sql.main("DELETE FROM qpassenger WHERE id_passenger = " + passengerID + " AND id_direction = " + direction + " AND id_time = " + 
                        TIME + ";", function (error, rows) {
                        if (error) console.log("errorDB: could not delete passenger from queue, where passenger has zero booked places");
                    });
                    if (Var.qPassenger[direction][TIME].length <= iPass) 
                        //мы только что просмотрели последнего пассажира в очереди.
                        break;
                }
                
                //Всё значит, в очереди были лишь те, которые были духами. мы их удалили, как с Базы Данных, так и с массива
                if (Var.qPassenger[direction][TIME].length <= iPass)
                    break;

                var booked = Var.qPassenger[direction][TIME][iPass]["booked"] - 0;   //Сколько мест забронировать
                var passengerID = Var.qPassenger[direction][TIME][iPass]["id"] - 0;  //ID пассажира
                
                //Цикл по всем водителям
                for(var iDrive = 0; iDrive < Var.qDriver[direction][TIME].length && booked > 0; iDrive++) {
                    //Если у водителя не осталось свободных мест. 
                    //Пока не найдем Водителя, у которого есть свободное место
                    while (Var.qDriver[direction][TIME][iDrive]["seats"] == 0) {
                        driverID = Var.qDriver[direction][TIME][iDrive]["id"];
                        sql.main("DELETE FROM qdriver WHERE id_driver = " + driverID + " AND id_direction = " + direction + " AND id_time = " + TIME +
                            ";", function (error, rows) {
                            if (error) {
                                console.log("errorDB: cann't delete driver(driver.seats=0) from database.qdriver");
                            }
                        });
                        Var.qDriver[direction][TIME].splice(iDrive, 1);
                            
                        //Если уже совсем никого нет, то проверям, не вышли ли мы за пределы массива
                        if (Var.qDriver[direction][TIME].length <= iDrive)
                            break;
                    }
                    
                    //Всё значит, в очереди сидели только зомби. Убили всех, отправили кладбище
                    if (Var.qDriver[direction][TIME].length <= iDrive)
                        break;

                    var driverID = Var.qDriver[direction][TIME][iDrive]["id"] - 0;       //ID водителя
                    var driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"] - 0; //Сколько свободных мест имеется у водителя

                    if (booked <= driverSeats) {
                        // можно посадить пассажира на эту машину
                        //Сажаем, снимаем пассажира с очереди

                        //Место, куда посылаем встретившихся
                        Var.met[direction][TIME].push({ id: passengerID, driversPhone: driverID });

                        //Кидаем в БД запись о встрече пассажира(ов) и водителя
                        sql.main("INSERT INTO met(id_driver, id_passenger, id_direction, id_time)" +
                            "VALUES(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ");", function (error, rows){
                                if (error) {
                                    console.log("errorDB: adding driver after meeting to MetTable(DB)");
                                }
                            });

                        //Уменьшаем количество свободных мест в машине.
                        Var.qDriver[direction][TIME][iDrive]["seats"] = driverSeats - booked;
                        //Изменяем запись в Базе Данных:
                        sql.main("UPDATE qdriver SET seats = " + Var.qDriver[direction][TIME][iDrive]["seats"] + " WHERE id_driver = " + 
                            driverID + " AND id_time = " + TIME + " AND id_direction = " + direction + ";", 
                            function (error, rows) {
                                if (error) console.log("errorDB: could not update seats");
                        });

                        //Выставляем количество забронированных мест у пассажира в ноль, ибо он только что сел
                        Var.qPassenger[direction][TIME][iPass]["booked"] = 0;
                        
                        //Меняем запись в Базе Данных, ставим 0 на количестве забронированных мест
                        sql.main("UPDATE qpassenger SET booked = 0 WHERE id_passenger = " + passengerID + " AND id_direction = " + direction 
                            + " AND id_time = " + TIME + ";", function (error, rows) {
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

exports.find = find;