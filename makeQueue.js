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
            for(var iPass = 0; iPass < Var.qPassenger[direction][TIME].length; iPass ++) {
                var booked = Var.qPassenger[direction][TIME][iPass]["booked"] - 0;   //Сколько мест забронировать
                var passengerID = Var.qPassenger[direction][TIME][iPass]["id"] - 0;  //ID пассажира
                //Цикл по всем водителям
                for (var iDrive = 0; iDrive < Var.qDriver[direction][TIME].length && booked > 0; iDrive++) {
                    //Пока в очереди есть водители, у которых уже не осталось мест, 
                    while (Var.qDriver[direction][TIME][iDrive]["seats"] == 0) {
                        Var.met[direction][TIME].push({ id: driverID, passengersNumbers: Var.qDriver[direction][TIME][iDrive]["passengersNumbers"] });
                        sql.main("DELETE FROM qdriver WHERE id_driver = " + driverID + ';', function (error, rows) {
                            if (error) {
                                console.log("errorDB: cann't delete driver(driver.seats=0) from database.qdriver");
                            }
                        });
                        Var.qDriver[direction][TIME].splice(iDrive, 1);
                        if (Var.qDriver[direction][TIME].length <= iDrive)
                            //Всё, кончилась очередь. Пора выходить отсюда, иначе обращение за пределы массива
                            break;
                    }
                    //ID водителя
                    var driverID = Var.qDriver[direction][TIME][iDrive]["id"] - 0;
                    //Сколько свободных мест имеется у водителя
                    var driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"] - 0; 
                    if (booked <= driverSeats) {
                        // можно посадить пассажира на эту машину
                        //Место, куда посылаем встретившихся
                        Var.met[direction][TIME].push({id: passengerID, driversPhone: driverID});
                        sql.main("INSERT INTO met(id_driver, id_passenger, id_direction, id_time)" +
                            "VALUES(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ");", function (error, rows){
                                if (error) {
                                    console.log("errorDB: adding driver after meeting to MetTable(DB)");
                                }
                            });
                        //Уменьшаем количество свободных мест в машине. Пассажира снимаем с очереди
                        Var.qDriver[direction][TIME][iDrive]["seats"] = driverSeats - booked;
                        driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"] - 0; 
                        //Соответственно, в БД
                        sql.main("UPDATE qdriver SET seats = " + driverSeats + " WHERE id_driver = " + driverID +
                            " AND id_time = " + TIME + " AND id_direction = " + direction + ";", function (error, rows) {
                            if (error) console.log("errorDB: couldn't decrease count of seats of driver");
                        });

                        //Говорим пассажиру, что его уже посадили
                        Var.qPassenger[direction][TIME][iPass]["booked"] = 0;
                        //console.log(Var.met[direction][TIME]);                        
                        //Если у водителя не осталось свободных мест.
                        
                        booked = 0;
                    }
                    
                }
            }
        }
    }  
}

exports.find = find;