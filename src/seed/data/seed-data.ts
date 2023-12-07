import * as bcrypt from 'bcrypt';

export const users = [
  {
    curp: bcrypt.hashSync('asdasdasdasdasdas9', 10),
    fullName: 'test seed',
    email: 'seed@gmail.com',
    password: bcrypt.hashSync('Pass123', 10),
    phone: '5548895659',
    userType: 'admin',
    isActive: false,
    urlImgProfile: 'http://localhost:3000/test.png',
  },
  {
    curp: 'asdasdasdasdasda10',
    fullName: 'test seed',
    email: 'seed2@gmail.com',
    password: 'Pass123',
    phone: '5548895659',
    userType: 'minorista',
    isActive: false,
    urlImgProfile: 'http://localhost:3000/test.png',
  },
  {
    curp: 'asdasdasdasdasda11',
    fullName: 'test seed',
    email: 'seed3@gmail.com',
    password: 'Pass123',
    phone: '5548895659',
  },
];
