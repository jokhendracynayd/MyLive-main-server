function calculateHoursMinutesSeconds(start, end) {
  const date1 = new Date(end);
  const date2 = new Date(start);
  const distance = Math.abs(date1 - date2);
  const hours = Math.floor(distance / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);
  return { hours, minutes, seconds };
}

async function newHoursAndCoins(data) {
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      const dataToSend = {
        coins: 0,
        audio_hours: "00:00:00",
        video_hours: "00:00:00",
        eligible_hours: "00:00:00",
        days: 0,
      };
      resolve(dataToSend);
    }
    let coins = 0;
    let audioHours = 0;
    let audioMinutes = 0;
    let audioSeconds = 0;
    let videoHours = 0;
    let videoMinutes = 0;
    let videoSeconds = 0;
    let eligibleHours = 0;
    let eligibleMinutes = 0;
    let eligibleSeconds = 0;
    let days = 0;

    data.forEach((e) => {
      let isOneDay = true;
      e.data.forEach((ele) => {
        if (
          ele.live_streaming_end_time !== undefined &&
          ele.live_streaming_start_time !== undefined
        ) {
          const { hours, minutes, seconds } = calculateHoursMinutesSeconds(
            ele.live_streaming_start_time,
            ele.live_streaming_end_time
          );
          if (ele.live_streaming_type === "live_audio_party") {
            audioHours += hours;
            audioMinutes += minutes;
            audioSeconds += seconds;

            if (audioMinutes >= 60) {
              audioHours++;
              audioMinutes -= 60;
            } else if (audioSeconds >= 60) {
              audioMinutes++;
              audioSeconds -= 60;
            }
          } else if (ele.live_streaming_type === "live") {
            if (hours >= 1) {
              if (isOneDay) {
                days++;
                isOneDay = false;
              }
            }
            videoHours += hours;
            videoMinutes += minutes;
            videoSeconds += seconds;
            if (videoMinutes >= 60) {
              videoHours++;
              videoMinutes -= 60;
            } else if (videoSeconds >= 60) {
              videoMinutes++;
              videoSeconds -= 60;
            }
          }
          eligibleHours += hours;
          eligibleMinutes += minutes;
          eligibleSeconds += seconds;
          if (eligibleMinutes >= 60) {
            eligibleHours++;
            eligibleMinutes -= 60;
          } else if (eligibleSeconds >= 60) {
            eligibleMinutes++;
            eligibleSeconds -= 60;
          }
          coins += ele.coins;
        }
      });
    });
    const formatTime = (h, m, s) =>
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    const dataToSend = {
      coins,
      audio_hours: formatTime(audioHours, audioMinutes, audioSeconds),
      video_hours: formatTime(videoHours, videoMinutes, videoSeconds),
      eligible_hours: formatTime(
        eligibleHours,
        eligibleMinutes,
        eligibleSeconds
      ),
      days,
    };
    resolve(dataToSend);
  });
}

function hoursAndCoins(data) {
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      const dataToSend = { coins: 0, durations: "00:00:00", days: 0 };
      resolve(dataToSend);
    } else {
      let coin = 0;
      let totalHours = 0;
      let totalMinutes = 0;
      let totalSeconds = 0;
      let days = 0;
      data.forEach((ele) => {
        if (
          ele.live_streaming_end_time !== undefined &&
          ele.live_streaming_start_time !== undefined
        ) {
          const date1 = new Date(ele.live_streaming_end_time);
          const date2 = new Date(ele.live_streaming_start_time);
          const distance = Math.abs(date1 - date2);
          const hours = Math.floor(distance / 3600000);
          const minutes = Math.floor((distance % 3600000) / 60000);
          const seconds = Math.floor((distance % 60000) / 1000);
          if (hours >= 1) {
            days++;
          }
          totalHours += hours;
          totalMinutes += minutes;
          totalSeconds += seconds;
          if (totalMinutes >= 60) {
            totalHours++;
            totalMinutes -= 60;
          } else if (totalSeconds >= 60) {
            totalMinutes++;
            totalSeconds -= 60;
          }
          coin += ele.coins;
        }
      });
      const dataToSend = {
        coins: coin,
        durations: `${totalHours.toString().padStart(2, "0")}:${totalMinutes
          .toString()
          .padStart(2, "0")}:${totalSeconds.toString().padStart(2, "0")}`,
        days: days,
      };
      resolve(dataToSend);
    }
  });
}

function PrevstartAndendDate(getDays) {
  return new Promise((resolve, reject) => {
    let startDay = new Date().toISOString();
    let time1 = startDay.split("T");
    let time2 = time1[0].split("-");
    time2[2] = "01";
    let newTime2 = time2.join("-");
    time1[0] = newTime2;
    startDay = time1.join("T");
    let lastDay;
    if (getDays == 15) {
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "15";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    } else if (getDays == 30) {
      startDay = new Date().toISOString();
      let time11 = startDay.split("T");
      let time22 = time11[0].split("-");
      // time22[2]="01";
      time22[1] = "02";
      // console.log(time22)
      let newTime12 = time22.join("-");
      time11[0] = newTime12;
      startDay = time11.join("T");
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "15";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    } else if (getDays == "monthly") {
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "30";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    }
    let days = { startDay, lastDay };
    resolve(days);
  });
}

function startAndendDate(getDays) {
  return new Promise((resolve, reject) => {
    let startDay = new Date().toISOString();
    let time1 = startDay.split("T");
    let time2 = time1[0].split("-");
    time2[2] = "01";
    let newTime2 = time2.join("-");
    time1[0] = newTime2;
    startDay = time1.join("T");
    let lastDay;
    if (getDays == 15) {
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "15";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    } else if (getDays == 30) {
      startDay = new Date().toISOString();
      let time11 = startDay.split("T");
      let time22 = time11[0].split("-");
      time22[2] = "15";
      let newTime12 = time22.join("-");
      time11[0] = newTime12;
      startDay = time11.join("T");
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "30";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    } else if (getDays == "monthly") {
      lastDay = new Date().toISOString();
      let time1 = startDay.split("T");
      let time2 = time1[0].split("-");
      time2[2] = "30";
      let newTime2 = time2.join("-");
      time1[0] = newTime2;
      lastDay = time1.join("T");
    }
    let days = { startDay, lastDay };
    resolve(days);
  });
}

function basicPayPercentage(value, percentage) {
  // return 50% of value
  return Math.floor((value * percentage) / 100);
}

function getNewTotal_salary(balance, data) {
  return new Promise((resolve, reject) => {
    let temp = 100;
    let day = Number(data.total_days);
    let hours = Number(data.total_hours.split(":")[0]);
    if (balance < 100000) {
      data.basic_pay_coins = 0;
      data.basic_pay_bdt = 0;
      data.day_time_bonus = 0;
      data.day_time_bonus_bdt = 0;
      data.extra_coins = 0;
      data.extra_coin_bdt = 0;
      data.extra_coin_agency_bdt = 0;
      data.agency_commision = 0;
      data.host_total_bonus_salary = 0;
      data.total_agency_commision = 0;
      data.total_salary = 0;
      resolve(data);
    } else if (balance >= 100000 && balance < 200000) {
      let basic_pay_coins = basicPayPercentage(100000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 100000;
      // data.day_time_bonus_bdt = Math.floor((balance/temp));
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(100000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(100000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 200000 && balance < 400000) {
      let basic_pay_coins = basicPayPercentage(200000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 200000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(200000 / temp),
        32
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(200000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 400000 && balance < 800000) {
      let basic_pay_coins = basicPayPercentage(400000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 400000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(400000 / temp),
        33
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(400000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 800000 && balance < 1200000) {
      let basic_pay_coins = basicPayPercentage(800000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 800000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(800000 / temp),
        33
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(800000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 1200000 && balance < 1800000) {
      let basic_pay_coins = basicPayPercentage(1200000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 1200000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(1200000 / temp),
        33
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(1200000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 1800000 && balance < 2500000) {
      let basic_pay_coins = basicPayPercentage(1800000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 1800000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(1800000 / temp),
        33
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(1800000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 2500000 && balance < 3500000) {
      let basic_pay_coins = basicPayPercentage(2500000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 2500000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(2500000 / temp),
        34
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }
      // else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(2500000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 3500000 && balance < 4500000) {
      let basic_pay_coins = basicPayPercentage(3500000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 3500000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(3500000 / temp),
        34
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(3500000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      // data.total_salary=basic_pay_bdt + data.extra_coin_bdt + data.extra_coin_agency_bdt + data.day_time_bonus_bdt + agency_commision;
      resolve(data);
    } else if (balance >= 4500000 && balance < 6500000) {
      let basic_pay_coins = basicPayPercentage(4500000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 4500000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(4500000 / temp),
        34
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=5 && hours>=10){
      // }
      // else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(4500000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 6500000 && balance < 8500000) {
      let basic_pay_coins = basicPayPercentage(6500000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 6500000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(6500000 / temp),
        34
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus=0;
      //   data.day_time_bonus_bdt=0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(6500000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 8500000 && balance < 11000000) {
      let basic_pay_coins = basicPayPercentage(8500000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 8500000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(8500000 / temp),
        34
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(8500000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 11000000 && balance < 14000000) {
      let basic_pay_coins = basicPayPercentage(11000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 11000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(11000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(11000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 14000000 && balance < 18000000) {
      let basic_pay_coins = basicPayPercentage(14000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 14000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(14000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(14000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 18000000 && balance < 23000000) {
      let basic_pay_coins = basicPayPercentage(18000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 18000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(18000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(18000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 23000000 && balance < 28000000) {
      let basic_pay_coins = basicPayPercentage(23000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 23000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(23000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(23000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 28000000 && balance < 50000000) {
      let basic_pay_coins = basicPayPercentage(28000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 28000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(28000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(28000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 50000000 && balance < 100000000) {
      let basic_pay_coins = basicPayPercentage(50000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 50000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(50000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(Math.floor(50000000 / temp), 9);
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 100000000 && balance < 150000000) {
      let basic_pay_coins = basicPayPercentage(100000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 100000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(100000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(
        Math.floor(100000000 / temp),
        9
      );
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else if (balance >= 150000000 && balance < 200000000) {
      let basic_pay_coins = basicPayPercentage(150000000, 50);
      data.basic_pay_coins = basic_pay_coins;
      let basic_pay_bdt = Math.floor(basic_pay_coins / temp);
      data.basic_pay_bdt = basic_pay_bdt;
      let extra_coin = balance - 150000000;
      data.day_time_bonus_bdt = basicPayPercentage(
        Math.floor(150000000 / temp),
        35
      );
      // data.day_time_bonus_bdt = Math.floor((basic_pay_bdt/temp));
      // if(day>=4 && hours>=8){
      // }
      // else{
      //   data.day_time_bonus = 0;
      //   data.day_time_bonus_bdt = 0;
      // }
      data.extra_coins = extra_coin;
      data.extra_coin_bdt = Math.floor(
        basicPayPercentage(extra_coin, 50) / temp
      );
      data.extra_coin_agency_bdt = Math.floor(
        basicPayPercentage(extra_coin, 15) / temp
      );
      let agency_commision = basicPayPercentage(
        Math.floor(150000000 / temp),
        9
      );
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay_bdt + data.extra_coin_bdt + data.day_time_bonus_bdt;
      data.total_agency_commision =
        agency_commision + data.extra_coin_agency_bdt;
      data.total_salary =
        data.host_total_bonus_salary + data.total_agency_commision;
      resolve(data);
    } else {
      resolve(data);
    }
  });
}

function getTotal_salary(balance, data) {
  return new Promise((resolve, reject) => {
    let tk1 = 0.00485;
    let tk2 = 0.0097;
    let temp = 970;
    let day = Number(data.total_days);
    let hours = Number(data.total_hours.split(":")[0]);
    if (balance < 350000) {
      data.basic_pay = 0;
      data.day_time_bonus = 0;
      data.extra_coins = 0;
      data.extra_coin_host = 0;
      data.extra_coin_agency = 0;
      data.agency_commision = 0;
      data.host_total_bonus_salary = 0;
      data.total_agency_commision = 0;
      data.total_salary = 0;
      resolve(data);
    } else if (balance >= 350000 && balance < 550000) {
      let basic_pay = Math.floor(3.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 350000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 350000) * tk2 * 0.2);
      let agency_commision = Math.floor(3.5 * temp * 0.0958);
      data.basic_pay = basic_pay;
      if (day >= 8 && hours >= 10) {
        data.day_time_bonus = Math.floor(3.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 350000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 550000 && balance < 750000) {
      let basic_pay = Math.floor(5.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 550000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 550000) * tk2 * 0.2);
      let agency_commision = Math.floor(5.5 * temp * 0.0958);
      data.basic_pay = basic_pay;
      if (day >= 8 && hours >= 10) {
        data.day_time_bonus = Math.floor(5.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 550000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 750000 && balance < 1150000) {
      let basic_pay = Math.floor(7.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 750000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 750000) * tk2 * 0.2);
      let agency_commision = Math.floor(7.5 * temp * 0.0958);
      data.basic_pay = basic_pay;
      if (day >= 8 && hours >= 10) {
        data.day_time_bonus = Math.floor(7.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 750000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 1150000 && balance < 1650000) {
      let basic_pay = Math.floor(11.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 1150000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 1150000) * tk2 * 0.2);
      let agency_commision = Math.floor(11.5 * temp * 0.12);
      data.basic_pay = basic_pay;
      if (day >= 8 && hours >= 10) {
        data.day_time_bonus = Math.floor(11.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 1150000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 1650000 && balance < 2250000) {
      let basic_pay = Math.floor(16.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 1650000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 1650000) * tk2 * 0.2);
      let agency_commision = Math.floor(16.5 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 7 && hours >= 8) {
        data.day_time_bonus = Math.floor(16.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 1650000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 2250000 && balance < 2850000) {
      let basic_pay = Math.floor(22.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 2250000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 2250000) * tk2 * 0.2);
      let agency_commision = Math.floor(22.5 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 7 && hours >= 8) {
        data.day_time_bonus = Math.floor(22.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 2250000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 2850000 && balance < 3500000) {
      let basic_pay = Math.floor(28.5 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 2850000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 2850000) * tk2 * 0.2);
      let agency_commision = Math.floor(28.5 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 7 && hours >= 8) {
        data.day_time_bonus = Math.floor(28.5 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 2850000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 3500000 && balance < 4500000) {
      let basic_pay = Math.floor(35.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 3500000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 3500000) * tk2 * 0.2);
      let agency_commision = Math.floor(35.0 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 7 && hours >= 8) {
        data.day_time_bonus = Math.floor(35.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 3500000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 4500000 && balance < 5500000) {
      let basic_pay = Math.floor(45.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 4500000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 4500000) * tk2 * 0.2);
      let agency_commision = Math.floor(45.0 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 7 && hours >= 7) {
        data.day_time_bonus = Math.floor(45.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 4500000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 5500000 && balance < 7000000) {
      let basic_pay = Math.floor(55.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 5500000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 5500000) * tk2 * 0.2);
      let agency_commision = Math.floor(55.0 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 6 && hours >= 7) {
        data.day_time_bonus = Math.floor(55.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 5500000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 7000000 && balance < 8500000) {
      let basic_pay = Math.floor(70.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 7000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 7000000) * tk2 * 0.2);
      let agency_commision = Math.floor(70.0 * temp * 0.14);
      data.basic_pay = basic_pay;
      if (day >= 6 && hours >= 7) {
        data.day_time_bonus = Math.floor(70.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 7000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 8500000 && balance < 11000000) {
      let basic_pay = Math.floor(85.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 8500000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 8500000) * tk2 * 0.2);
      let agency_commision = Math.floor(85.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 6 && hours >= 6) {
        data.day_time_bonus = Math.floor(85.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 8500000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 11000000 && balance < 13500000) {
      let basic_pay = Math.floor(110.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 11000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 11000000) * tk2 * 0.2);
      let agency_commision = Math.floor(110.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 6 && hours >= 6) {
        data.day_time_bonus = Math.floor(100.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 11000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 13500000 && balance < 17000000) {
      let basic_pay = Math.floor(135.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 13500000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 13500000) * tk2 * 0.2);
      let agency_commision = Math.floor(135.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 3 && hours >= 5) {
        data.day_time_bonus = Math.floor(135.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 13500000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 17000000 && balance < 21000000) {
      let basic_pay = Math.floor(170.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 17000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 17000000) * tk2 * 0.2);
      let agency_commision = Math.floor(170.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 3 && hours >= 5) {
        data.day_time_bonus = Math.floor(170.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 17000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 21000000 && balance < 25000000) {
      let basic_pay = Math.floor(210.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 21000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 21000000) * tk2 * 0.2);
      let agency_commision = Math.floor(210.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 2 && hours >= 4) {
        data.day_time_bonus = Math.floor(210.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 21000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 25000000 && balance < 50000000) {
      let basic_pay = Math.floor(250.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 25000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 25000000) * tk2 * 0.2);
      let agency_commision = Math.floor(250.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 2 && hours >= 4) {
        data.day_time_bonus = Math.floor(250.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 25000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 50000000 && balance < 100000000) {
      let basic_pay = Math.floor(500.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 50000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 50000000) * tk2 * 0.2);
      let agency_commision = Math.floor(500.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 1 && hours >= 3) {
        data.day_time_bonus = Math.floor(500.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 50000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else if (balance >= 100000000 && balance < 200000000) {
      let basic_pay = Math.floor(1000.0 * temp * 0.53);
      let extra_coin_host = Math.floor((balance - 100000000) * tk2 * 0.5);
      let extra_coin_agency = Math.floor((balance - 100000000) * tk2 * 0.2);
      let agency_commision = Math.floor(1000.0 * temp * 0.16);
      data.basic_pay = basic_pay;
      if (day >= 1 && hours >= 2) {
        data.day_time_bonus = Math.floor(1000.0 * temp * 0.21);
      } else {
        data.day_time_bonus = 0;
      }
      data.extra_coins = balance - 100000000;
      data.extra_coin_host = extra_coin_host;
      data.extra_coin_agency = extra_coin_agency;
      data.agency_commision = agency_commision;
      data.host_total_bonus_salary =
        basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision = agency_commision + extra_coin_agency;
      data.total_salary =
        basic_pay +
        extra_coin_host +
        extra_coin_agency +
        400 +
        data.day_time_bonus +
        agency_commision;
      resolve(data);
    } else {
      resolve(data);
    }
  });
}

module.exports = {
  hoursAndCoins,
  startAndendDate,
  getTotal_salary,
  getNewTotal_salary,
  PrevstartAndendDate,
  newHoursAndCoins,
};
