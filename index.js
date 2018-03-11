/*Список команд задаётся в настройках ботового аккаунта у @BotFather.
Для этого отправьте ему команду /setcommands,
затем выберите вашего бота и введите новый список в таком формате
(без слэшей в начале).*/

/*Номера листів - факультети*/
/*  0 - ФМФ
    1 - БХ
    2 - ГОЕ
    3 - ДТО
    4 - УМЛ
    5 - ХУДГРАФ
*/
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('./schedule_google_table');

const faculty = 0;
var group = 'ФІ-17';
var day = 'Понеділок';
var time = '';
var subject = '', subject2 = '', subject3 = '', subject4 = '', weekCh = '', weekZn = '', groupOne = '', groupTwo = '', times;

const TOKEN = '404700036:AAGfvVRqH2TDZ3DDKgd-w8kmNqy_iW-5ZiM';//KDPU

const bot = new TelegramBot(TOKEN, {
    polling: true
});

const KB = {
    first: 'Перший',
    second: 'Другий',
    third: 'Третій',
    fourth: 'Четвертий',
    five: 'П\'ятий'
};

bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
});

bot.onText(/\/start/, msg =>{
    sendGreeting(msg)
});

bot.on('message', msg => {
    switch (msg.text){
        case KB.first:
            selectGroup(msg.chat.id, 17);
            break;
        case KB.second:
            selectGroup(msg.chat.id, 16);
            break;
        case KB.third:
            selectGroup(msg.chat.id, 15);
            break;
        case KB.fourth:
            selectGroup(msg.chat.id, 14);
            break;
        case KB.five:
            selectGroup(msg.chat.id, 13);
            break;
    }
});

function selectGroup(chatId, num) {
    bot.sendMessage(chatId, `Оберіть групу`, {
        reply_markup:{
            inline_keyboard:[
                [
                    {
                        text: 'ФІ-' + num,
                        callback_data: 'ФІ-' + num
                    },
                    {
                        text: 'МІ-' + num,
                        callback_data: 'МІ-' + num
                    },
                    {
                        text: 'І-' + num,
                        callback_data: 'І-' + num
                    }
                ]
            ]
        }
    });
}

bot.on('callback_query', query => {

    if (query.message.text === 'Оберіть групу') {
        group = query.data;
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            text: `Вибрано ${group}`
        });
        //console.log("group ", group);
        getDay(query.message.chat.id);
    }
    if (query.message.text === 'Оберіть день тижня') {
        day = query.data;
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            text: `Вибрано ${day}`
        });
        getTime(query.message.chat.id);
        //console.log("callback_query ", query.message.text + " " + group + " " + day)
    }
    if (query.message.text === 'Оберіть пару') {
        time = query.data;
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            text: `Вибрано ${time}`
        });
        getSchedule(query.message.chat.id, group, day, time);
        //console.log("time ", query);
        console.log("Колбэк выбора пары\n", query.message.text + "\n" + group + "\n" + day + "\n" + time)
    }
});

function getDay(chatId) {
    bot.sendMessage(chatId, `Оберіть день тижня`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Пн',
                        callback_data: 'Понеділок'
                    },
                    {
                        text: 'Вт',
                        callback_data: 'Вівторок'
                    },
                    {
                        text: 'Ср',
                        callback_data: 'Середа'
                    },
                    {
                        text: 'Чт',
                        callback_data: 'Четвер'
                    },
                    {
                        text: 'Пт',
                        callback_data: 'П\'ятниця'
                    }
                ]
            ]
        }
    });
};

function getTime(chatId) {
    bot.sendMessage(chatId, `Оберіть пару`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Перша',
                        callback_data: '9.00 - 10.20'
                    },
                    {
                        text: 'Друга',
                        callback_data: '10.40 - 12.00'
                    }
                ],
                [
                    {
                        text: 'Третя',
                        callback_data: '12.10 - 13.30'
                    },
                    {
                        text: 'Четверта',
                        callback_data: '13.50 - 15.10'
                    }
                ],
                [
                    {
                        text: 'П\'ята',
                        callback_data: '15.20 - 16.40'
                    }
                ]
            ]
        }
    });
};

function getSchedule(chatId, group, day, time) {
    bot.sendMessage(chatId, `<b>Завантажую розклад</b>` + "\n" + `<b>Група: </b><pre>${group}</pre>` +
        '\n' + `<b>День: </b><pre>${day}</pre>` + '\n' + `<b>Час: </b><pre>${time}</pre>`, {
        parse_mode: 'HTML'
    });
    schedule.getRozklad(faculty)
        .then(
            function (cells) {
                subject = '';
                subject2 = '';
                subject3 = '';
                subject4 = '';
                weekCh = '';
                weekZn = '';
                groupOne = '';
                groupTwo = '';
                for (var k = 0; k < cells.length; k++) {
                    if (cells[k].value === group) {//выбираем группу
                        var column = cells[k].col;//первая колонка

                        for (var i = 0; i < cells.length; i++) {
                            if (cells[i].value === day) {//выбираем день недели
                                var dayRows = cells[i].row;

                                for (var t = 0; t < cells.length; t++) {//выбираем пару
                                    if (cells[t].value === time) {
                                        var timeRows = cells[t].row
                                        for (var sch = 0; sch < cells.length; sch++) {
                                            if ((cells[sch].col === column || cells[sch].col === column + 1) && cells[sch].row >= dayRows && cells[sch].row <= (dayRows + 9) && cells[sch].row >= timeRows && cells[sch].row <= (timeRows + 1)) {
                                                times = `<pre>${time}</pre>`;
                                                if (cells[sch].col % 2 !== 0) {
                                                    groupOne = `<b>Перша</b>`;
                                                    if (cells[sch].row % 2 !== 0) {
                                                            weekCh = `<b>Чисельник</b>`;
                                                            subject = `<i>${cells[sch].value}</i>`;
                                                    }
                                                    if (cells[sch].row % 2 === 0) {
                                                            weekZn = `<b>Знаменник</b>`;
                                                            subject2 = `<i>${cells[sch].value}</i>`;
                                                    }
                                                }
                                                if (cells[sch].col % 2 === 0){
                                                    groupTwo = `<b>Друга</b>`;
                                                    if (cells[sch].row % 2 !== 0) {
                                                            weekCh = `<b>Чисельник</b>`;
                                                            subject3 = `<i>${cells[sch].value}</i>`;
                                                    }
                                                    if (cells[sch].row % 2 === 0) {
                                                            weekZn = `<b>Знаменник</b>`;
                                                            subject4 = `<i>${cells[sch].value}</i>`;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if(subject === subject2 && subject === subject3 && subject === subject4) {
                    bot.sendMessage(chatId, times + '\n' + `<b>Щотижня, усі разом</b>` + '\n' + subject, {
                        parse_mode: 'HTML'
                    });
                }
                else if (subject === subject3 && subject2 === subject4) {
                    bot.sendMessage(chatId, times + '\n' + `<b>Разом</b>` + '\n' + weekCh + '\n' + subject + '\n' + weekZn + '\n' + subject4, {
                        parse_mode: 'HTML'
                    });
                }
                else if(subject === subject2 && subject3 === subject4){
                    bot.sendMessage(chatId, times + '\n' + `<b>Щотижня</b>` + '\n' + groupOne + '\n' + subject + '\n' + groupTwo + '\n' + subject3, {
                        parse_mode: 'HTML'
                    });
                }
                else {
                    if(subject) {
                        bot.sendMessage(chatId, times + '\n' + groupOne + '\n' + weekCh + '\n' + subject, {
                            parse_mode: 'HTML'
                        });
                    }
                    if(subject2) {
                        bot.sendMessage(chatId, times + '\n' + groupOne + '\n' + weekZn + '\n' + subject2, {
                            parse_mode: 'HTML'
                        });
                    }
                    if(subject3) {
                        bot.sendMessage(chatId, times + '\n' + groupTwo + '\n' + weekCh + '\n' + subject3, {
                            parse_mode: 'HTML'
                        });
                    }
                    if(subject4) {
                        bot.sendMessage(chatId, times + '\n' + groupTwo + '\n' + weekZn + '\n' + subject4, {
                            parse_mode: 'HTML'
                        });
                    }
                }
                console.log(chatId, times + '\n' + subject + subject2 + subject3 + subject4)
            }
        );
};

function sendGreeting(msg, sayHello = true) {
    const text = sayHello
        ? `Вітаю, ${msg.from.first_name}!\nБудь-ласка, вкажіть на якому курсі Ви навчаєтесь`
        : `Будь-ласка, вкажіть на якому курсі Ви навчаєтесь`;
        //console.log(text);
    bot.sendMessage(msg.chat.id, text, {
        reply_markup: JSON.stringify({
            one_time_keyboard: true,
            keyboard: [
                [KB.first, KB.second],
                [KB.third, KB.fourth, KB.five]
            ]
        })
    })
}