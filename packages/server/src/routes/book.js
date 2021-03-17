const express = require('express');
const router = express.Router();
const { isLibraryManager } = require('../utils/auth');
const { User, Book, BookLoan } = require('../models/');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

router.get('/all', async (req, res) => {
  let books = [];
  if (req.query.include == 'deaccessed') {
    books = await Book.findAll();
  } else {
    books = await Book.findAll({
      where: {
        deaccessYear: {
          [Op.eq]: null,
        },
      },
    });
  }
  return res.json(books);
});

router.get('/new', async (req, res) => {
  books = await Book.findAll({
    limit: 6,
    where: {
      deaccessYear: {
        [Op.eq]: null,
      },
    },
    order: [['id', 'DESC']],
  });
  return res.json(books);
});

router.get('/:book', async (req, res) => {
  if (
    req.params.book &&
    req.query.podle &&
    ['isbn', 'id'].includes(req.query.podle.toLowerCase())
  ) {
    let book = await Book.findOne({
      where: {
        [Op.or]: [
          {
            isbn: req.params.book,
          },
          {
            id: parseInt(req.params.book),
          },
        ],
      },
    });
    return res.json(book);
  } else {
    return res.sendStatus(400);
  }
});

router.post('/create', asyncHandler(isLibraryManager), async (req, res) => {
  let {
    isbn,
    name,
    authorFamilyName,
    authorGivenName,
    genre,
    coverUrl,
    annotation,
    publicationYear,
    publisher,
    registrationYear,
    deaccessYear,
    origin,
    purchasePrice,
  } = req.body.data;
  console.log({
    isbn,
    name,
    authorFamilyName,
    authorGivenName,
    genre,
    coverUrl,
    annotation,
    publicationYear,
    publisher,
    registrationYear,
    deaccessYear,
    origin,
    purchasePrice,
  });
  if (
    (isbn,
    name,
    authorFamilyName,
    authorGivenName,
    genre,
    coverUrl,
    annotation,
    publicationYear,
    publisher,
    registrationYear,
    deaccessYear,
    origin,
    purchasePrice)
  ) {
    Book.findOrCreate({
      where: {
        isbn,
      },
      defaults: {
        name,
        authorFamilyName,
        authorGivenName,
        genre,
        coverUrl,
        annotation,
        publicationYear,
        publisher,
        registrationYear,
        deaccessYear,
        origin,
        purchasePrice,
      },
    }).then((book, created) => {
      console.log(created);
      return res.json(book);
    });
  } else {
    return res.sendStatus(400);
  }
});

router.post('/delete', async (req, res) => {
  const { id } = req.body;

  if (id) {
    let book = await Book.destroy({
      where: {
        id: parseInt(id),
      },
    });
    return res.sendStatus(200);
  } else {
    return res.status(400).json({
      error: 'INVALID_QUERY',
    });
  }
});

router.post('/loan', isLibraryManager, async (req, res) => {
  const { borrowerEmail, bookId } = req.body;

  if (borrowerEmail && bookId) {
    const borrower = await User.findOne({
      where: {
        email: borrowerEmail,
      },
    });

    if (borrower) {
      const book = await Book.findOne({
        where: {
          id: bookId,
        },
      });

      if (book) {
        BookLoan.create({
          borrower: borrower.id,
          book: book.id,
          borrowDate: new Date(),
          returnDate: new Date(Date.now() + 2629743830),
          returned: false,
        }).then(async (bookLoan) => {
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

          await transporter.sendMail({
            from: 'Studentský portál​ <20GKovacevicM@student.panska.cz>',
            to: borrowerEmail,
            subject: `Výpůjčka č. ${bookLoan.id}`,
            text: `Tento email slouží jako potvrzení o úspěšné výpůjčce z školní knihovny. Přehled svých výpůjček můžete po přihlášení najít i na portal.panska.cz.\n\n${
              (await Book.findOne({ where: { id: bookLoan.book } })).name
            }, půjčené do ${bookLoan.returnDate.toLocaleDateString(
              'cs-CZ'
            )}\n\nToto je automaticky generovaný e-mail.\nV případě jakýchkoliv dotazů se obracejte na vedoucí školní knihovny Mgr. Honců Hana.`,
          });

          return res.json(bookLoan);
        });
      } else {
        return res.status(400).json({
          error: 'INVALID_BOOK_ID',
        });
      }
    } else {
      return res.status(400).json({
        error: 'INVALID_USER_EMAIL',
      });
    }
  } else {
    return res.status(400).json({
      error: 'MISSING_BODY_KEY',
    });
  }
});

router.post('/return', async (req, res) => {
  const { borrowerEmail, bookId } = req.body;

  if (borrowerEmail && bookId) {
    const borrower = await User.findOne({
      where: {
        email: borrowerEmail,
      },
    });

    if (borrower) {
      const book = await Book.findOne({
        where: {
          id: bookId,
        },
      });

      if (book) {
        const bookLoan = await BookLoan.findOne({
          where: {
            book: bookId,
            borrower: borrower.id,
          },
        });
        bookLoan.returned = true;
        bookLoan.returnedDate = new Date();
        await bookLoan.save();
        return res.sendStatus(200);
      } else {
        return res.status(400).json({
          error: 'INVALID_BOOK_ID',
        });
      }
    } else {
      return res.status(400).json({
        error: 'INVALID_USER_EMAIL',
      });
    }
  } else {
    return res.status(400).json({
      error: 'MISSING_BODY_KEY',
    });
  }
});

router.get('/loan/all', async (req, res) => {
  let bookLoans = await BookLoan.findAll({
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
  return res.json(bookLoans);
});

module.exports = router;
