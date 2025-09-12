const bcrypt = require('bcrypt');

const password = 'password123';
bcrypt.hash(password, 12, (err, newHash) => {
    console.log('NUEVO HASH:', newHash);
    console.log('LONGITUD:', newHash.length);
});