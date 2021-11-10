const express = require('express');
const router = express.Router();
const { isLibraryManager } = require('../utils/auth');
const { User, Book, BookLoan } = require('../models/');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

router.get(
  '/all',
  asyncHandler(async (req, res) => {
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
  })
);

router.get(
  '/new',
  asyncHandler(async (req, res) => {
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
  })
);

router.get(
  '/:book',
  asyncHandler(async (req, res) => {
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
  })
);

router.post(
  '/create',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
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
      graduationReading,
    } = req.body.data;
    if (
      (isbn,
      name,
      authorFamilyName,
      authorGivenName,
      publicationYear,
      publisher)
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
          graduationReading,
        },
      }).then(([book, created]) => {
        if (!created) {
          return res.sendStatus(409);
        }
        return res.json(book);
      });
    } else {
      return res.sendStatus(400);
    }
  })
);

router.post(
  '/delete',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (id) {
      let book = await Book.findOne({
        where: {
          id: parseInt(id),
        },
      });

      if (!book) {
        return res.sendStatus(400);
      }

      await book.destroy();
      return res.sendStatus(200);
    } else {
      return res.sendStatus(400);
    }
  })
);

router.post(
  '/edit',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
    let {
      id,
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
      graduationReading,
    } = req.body.data;

    if (id) {
      let book = await Book.findOne({
        where: {
          [Op.or]: [
            {
              isbn: id,
            },
            {
              id: parseInt(id),
            },
          ],
        },
      });

      if (!book) {
        return res.sendStatus(400);
      }

      book.isbn = isbn;
      book.name = name;
      book.authorFamilyName = authorFamilyName;
      book.authorGivenName = authorGivenName;
      book.genre = genre;
      book.coverUrl = coverUrl;
      book.annotation = annotation;
      book.publicationYear = publicationYear;
      book.publisher = publisher;
      book.registrationYear = registrationYear;
      book.deaccessYear = deaccessYear;
      book.origin = origin;
      book.purchasePrice = purchasePrice;
      book.graduationReading = graduationReading;
      await book.save();

      return res.json(book);
    } else {
      return res.sendStatus(400);
    }
  })
);

router.post(
  '/loan',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
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
              from: 'Knihovna <knihovna@panska.cz>',
              to: borrowerEmail,
              subject: `Výpůjčka č. ${bookLoan.id}`,
              text: `Tento email slouží jako potvrzení o úspěšné výpůjčce z školní knihovny. Přehled svých výpůjček můžete po přihlášení najít i na https://knihovna.panska.cz\n\n${
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
  })
);

router.post(
  '/return',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
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
  })
);

router.put(
  '/loan',
  asyncHandler(isLibraryManager),
  asyncHandler(async (req, res) => {
    const { id, period } = req.body.data;
    const bookLoan = await BookLoan.findOne({
      where: {
        id,
      },
    });
    extendedDate = new Date(bookLoan.returnDate);
    extendedDate.setDate(extendedDate.getDate() + parseInt(period));
    bookLoan.returnDate = extendedDate;
    bookLoan.save().then(() => {
      res.sendStatus(200);
    });
  })
);

router.get(
  '/loan/all',
  asyncHandler(async (req, res) => {
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
  })
);

module.exports = router;
