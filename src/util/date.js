function formatTime(datestring) {
  const date = new Date(datestring);
  return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

function formatTimeToHM(datestring) {
  const date = new Date(datestring);
  return `${date.getHours()}:${date.getMinutes()}  `;
}
module.exports = { formatTime, formatTimeToHM };
