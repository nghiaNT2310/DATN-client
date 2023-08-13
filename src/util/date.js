import moment from 'moment';

function formatTime(datestring) {
  const date = new Date(datestring);
  //return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  return moment(datestring).format('YYYY-MM-DD HH:mm:ss');
}

function formatTimeToHM(datestring) {
  const date = new Date(datestring);
  //return `${date.getHours()}:${date.getMinutes()}  `;
  return moment(datestring).format('HH:mm');
}

export default { formatTime, formatTimeToHM };
//module.exports = { formatTime, formatTimeToHM };
