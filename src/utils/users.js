const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!username || !room ){
        return {error: "You must provide a name and a room!"}
    }
    const existingUser = users.find((user) => {
        return username === user.username && room === user.room;
    });
    if(existingUser){
        return {error: "User name already exists!"}
    }
    const user = {id, username, room}
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {        // -1 if we didn't find a match
        return user.id === id;
    });
    if(index !== -1){
        return users.splice(index, 1)[0];       // returning the user removed from the users array
    }
};

const getUser = (id) => {
    return users.find((user) => {        
        return user.id === id;
    });
};

const getUsersInRoom = (room) => {
    room = room.trim().toString();
    return users.filter((user) => {
        return user.room === room;
    });
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
