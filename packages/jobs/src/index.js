require('dotenv').config();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const db = require('../../server/src/models/index');
const { User, Book, BookLoan } = require('../../server/src/models');

db.sequelize
  .authenticate()
  .then(() => console.log('DATABASE CONNECTED'))
  .catch((err) => console.log(err));

let transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const reminders = schedule.scheduleJob('0 8 * * *', async () => {
  let start = new Date();
  start.setDate(new Date().getDate() + 4);
  start.setHours(23, 0, 0, 0);
  let end = new Date();
  end.setDate(new Date().getDate() + 5);
  end.setHours(22, 59, 59, 999);

  let bookLoans = await BookLoan.findAll({
    where: {
      returnDate: {
        [Sequelize.Op.between]: [start, end],
      },
    },
    include: [
      {
        model: User,
        as: User.id,
      },
      {
        model: Book,
        as: Book.id,
      },
    ],
  });

  for (user of bookLoans.filter(
    (bookLoan, index) =>
      bookLoans.findIndex((i) => i.User.email == bookLoan.User.email) == index
  )) {
    await transporter.sendMail({
      from: 'Studentský portál​ <20GKovacevicM@student.panska.cz>',
      to: user.User.email,
      subject: 'Upozornění na konec výpůjční lhůty',
      text: `Vážený/á studente/tko,\nblíží se konec výpůjční lhůty u následujících titulů:\n\n${bookLoans
        .filter((bookLoan) => bookLoan.User.email == user.User.email)
        .map(
          (bookLoan) =>
            `${
              bookLoan.Book.name
            }, půjčené do ${bookLoan.returnDate.toLocaleDateString('cs-CZ')}`
        )
        .join(
          '\n'
        )}\n\nToto je automaticky generovaný e-mail.\nV případě jakýchkoliv dotazů se obracejte na vedoucí školní knihovny Mgr. Honců Hana.`,
    });
  }
});
