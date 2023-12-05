'use strict';


function disconnect() {
    console.log('Usuario desconectado');
}
function joinRoom(socket, data) {
    console.log('joinRoom', data);
    console.log('socket', socket.id)
    socket.join(data.room);
    socket.to(data.room).emit('userJoined', data);
}


module.exports = { joinRoom, disconnect };