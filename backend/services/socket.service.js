
const roomService = require('./room.service')
const userService = require('./user.service')
var gRooms = []

function connectSocket(io) {
    io.on('connection', (socket) => {
        var userRoom;
        socket.on('chatRoomJoined', (room) => {
            
            var idx = gRooms.findIndex(currRoom => currRoom._id === room._id)
            gRooms.push(room)
            console.log('conected', gRooms)
            if(idx === -1){
                io.emit('setCurrTime', 0)
                console.log('first')
            }else{
                socket.emit('joined')
                console.log('secend')
            }
            userRoom = room
            socket.join(userRoom._id)
            updateRoomCount(io, userRoom._id)
        })
        socket.on('roomClose', () => {
            var idx = gRooms.findIndex(currRoom => currRoom._id === userRoom._id)
            console.log(idx)
            gRooms.splice(idx,1)
            console.log('disconected',gRooms)
            if (!userRoom) return
            socket.leave(userRoom._id)
            updateRoomCount(io, userRoom._id)
        })
        socket.on('sendMsg', (newMsg) => {
            if (userRoom._id) {
                io.to(userRoom._id).emit('setNewMsg', newMsg)
            }
        })
        socket.on('getRoomList', () => {
            return roomService.query()
                .then(rooms => {
                    socket.emit('setRoomList', rooms)
                })
        })
        socket.on('getRoomById', (roomId) => {
            return roomService.getById(roomId)
                .then(room => {
                    socket.emit('setRoom', room)
                })
        })
        socket.on('createRoom', (newRoom) => {
            return roomService.addRoom(newRoom)
                .then(newRoom => {
                    socket.emit('setNewRoom', newRoom.ops[0])
                })
        })
        socket.on('getTime', () => {
            if (!userRoom) return
            socket.broadcast.to(userRoom._id).emit('getStatusTime');
        })
        socket.on('setStatusTime', (time) => {
            io.emit('setCurrTime', time)
        })
        socket.on('searchRoom', (filter) => {
            roomService.query(filter)
                .then(filteredRooms => {
                    socket.emit('setRoomsFilter', filteredRooms)
                })
        })
        socket.on('getRoomsByGenre', (genre) => {
            var filter = {
                byName: '',
                byType: genre
            }
            roomService.query(filter)
                .then(filteredRooms => {
                    socket.emit('setRoomsFilter', filteredRooms)
                })
        })
        socket.on('updatePlaylist', (roomId, updatedPlaylist) => {
            roomService.updatePlaylist(roomId, updatedPlaylist)
                .then(() => {
                    return roomService.query()
                        .then(rooms => {
                            io.emit('setRoomList', rooms)
                        })
                })
        })
        socket.on('modifyPlaylist', (roomId, updatedPlaylist) => {
            roomService.updatePlaylist(roomId, updatedPlaylist)
                .then(() => {
                    io.to(userRoom._id).emit('loadPlaylist', updatedPlaylist)
                })
        })
        socket.on('updateRoomsCreatedUser', (user, roomId) => {
            userService.updateRoomsCreatedUser(user, roomId)

        })
        socket.on('updateLiked', ({ room, user }) => {
            userService.updateRoomLikes(room, user)
                .then(currUser => {
                    socket.emit('updateUser', currUser)
                })
            roomService.updateRoomLikes(room, user)
                .then(currRoom => {
                    socket.emit('setRoom', currRoom)
                })
        })
        socket.on('getUserById', (userId) => {
            userService.getUserRooms(userId)
                .then(user => {
                    user[0].password = null
                    socket.emit('setUserProfile', user)
                })

        })
        socket.on('getRoomCounts', () => {
            updateRoomCounts(io)
        })
        socket.on('followUser', ({ follower, following }) => {
            userService.followUser(follower, following)
                .then(currUser => {
                    socket.emit('updateUser', currUser)
                })
        })
        socket.on('disconnect', () => {
            var idx = gRooms.findIndex(currRoom => currRoom._id === userRoom._id)
            console.log(idx)
            console.log('disconected',gRooms)
            gRooms.splice(idx,1)
            if (!userRoom) return
            socket.leave(userRoom._id)
            updateRoomCount(io, userRoom._id)
        })

    })
}

function updateRoomCount(io, roomId) {
    updateRoomCounts(io)
    const ioRoom = io.sockets.adapter.rooms[roomId]
    if (!ioRoom) return
    io.to(roomId).emit('updateRoomCount', ioRoom.length)
}

function updateRoomCounts(io) {
    const rooms = io.sockets.adapter.rooms
    const roomCounts = Object.keys(rooms)
        .filter(key => key.length === 24)
        .reduce((countMap, key) => {
            countMap[key] = rooms[key].length
            return countMap
        }, {})
    io.emit('updateRoomCounts', roomCounts)
}


module.exports = connectSocket