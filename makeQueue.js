var Var = require('./variables.js');
var sql = require('./sql.js');

//встречаем людей
var mainF = function main() {
    //Заглушка на далекое будущее
    return;
    //Через каждые 10 секунд
    setTimeout(main, 5*1000);
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
            sql.main("SELECT id, id_driver, seats, id_time, id_direction, date FROM qdriver WHERE date = " + DATE + ";", function (error, rows) {
                if (error) {
                    console.log(error)
                    return;
                }
                var Drivers = [];
                for (row in rows)
                    Drivers.push({
                        "idDB": rows[row].id,
                        "id_driver": rows[row].id_driver, 
                        "id_time": rows[row].id_time,
                        "id_direction": rows[row].id_direction,
                        "seats": rows[row].seats,
                        "date": rows[row].date
                    });
                    
                //Загружаем пассажиров
                sql.main("SELECT id, id_passenger, booked, id_time, id_direction, date FROM qpassenger WHERE date = " + DATE + ";", function (error, rows) {
                    if (error) {
                        console.log(error)
                        return;
                    }
                    var Passengers = [];
                    for (row in rows)
                        Passengers.push({
                            "idDB": rows[row].id,
                            "id_passenger": rows[row].id_passenger, 
                            "id_time": rows[row].id_time,
                            "id_direction": rows[row].id_direction,
                            "booked": rows[row].booked,
                            "date": rows[row].date
                        });
                    makeQueueNoDB(Drivers, Passengers);
                });
                //Загрузили пассажиров
            });
            //Загрузили водителей
        });
        //end: Цикл по дням, в очереди которых есть кто-либо    
    });
    //sql.main - Выбор дней, где есть народ
}

//Собрали весь очередь за конкретный день.
function makeQueueNoDB(Drivers, Passengers)
{
    //Вот эти аргументы хранят в себе всех пассажиров/водителей в перемешку.
    if (Drivers.length * Passengers.length == 0)
        return;

    if (Drivers[0].date != Passengers[0].date) {
        console.log("ERROR!");
        return;
    }
    var DATE = Drivers[0].date;
    //Инициализация новых массивов, с которыми непосредственно будем работать
    var qPassenger = [], qDriver = [];
    
    for (var i = Var.directionMin; i <= Var.directionMax; i++) {
        qPassenger[i] = [];
        qDriver[i] = [];
        for (var j = 0; j <= 8; j++) {
            qPassenger[i][j] = [];
            qDriver[i][j] = [];
        }
    }

    //Раскидываем по универсальным массивам, 3-мерным.
    for (var i = 0; i < Drivers.length; i++) {
        var element = {
            "idDB": Drivers[i].idDB,
            "id": Drivers[i].id_driver,
            "seats": Drivers[i].seats
        };
        var direction = Drivers[i].id_direction;
        var time = Drivers[i].id_time;

        qDriver[direction][time].push(element);
    }
    for (var i = 0; i < Passengers.length; i++) {
        var direction = Passengers[i].id_direction;
        var time = Passengers[i].id_time;
        var id_passenger = Passengers[i].id_passenger;
        var idDB = Passengers[i].idDB;
        var booked = Passengers[i].booked;
        qPassenger[direction][time].push({ "idDB": idDB, "id": id_passenger, "booked": booked});
    }

    //Цикл по всем направлениям.
    for (var direction = Var.directionMin; direction <= Var.directionMax; direction++) {
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
						console.log(new Date().toLocaleTimeString(), ', /makeQueue, found!');
                        sql.main("INSERT INTO met(id_driver, id_passenger, id_direction, id_time, date, booked)" +
                                        "VALUES(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ", " + DATE + ", " + booked + ");", function (error, rows) {
                            if (error) {
                                console.log("errorDB: adding driver after meeting to met");
                            }
                        });
                        
                        //Уменьшаем количество свободных мест в машине.
                        qDriver[direction][TIME][iDrive]["seats"] = driverSeats - booked;
                        driverSeats -= booked;
                        
                        //Изменяем запись в Базе Данных: уменьшаем кол-во мест в машине
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
    
}

exports.main = mainF;