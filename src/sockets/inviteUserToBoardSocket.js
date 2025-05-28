// Param socket nhan duoc tu thu vien socket.io
export const inviteUserToBoardSocket = (socket) => {
  // Lang nghe su kien ma client emit len co ten la FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Emit nguoc lai mot su kien ve cho moi client khac (ngoai tru thang client gui req len), roi de phia FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
