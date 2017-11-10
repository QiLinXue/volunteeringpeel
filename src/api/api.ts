/* tslint:disable:no-console no-var-requires */
import * as bcrypt from 'bcrypt';
import * as Promise from 'bluebird';
import * as Express from 'express';
import * as session from 'express-session';
import * as mysql from 'promise-mysql';

import user from './user';

const passwordsJson = require('../passwords.json');

// Initialize API
const api = Express.Router();

// Setup MySQL
const pool = mysql.createPool({
  database: 'volunteeringpeel',
  host: 'localhost',
  user: 'volunteeringpeel',
  password: passwordsJson.mysql.password,
  charset: 'utf8mb4',
});

if (process.env.NODE_ENV !== 'production') {
  api.use((req, res, next) => {
    console.log(`Request: ${req.originalUrl} (${req.method})`);
    next();
  });
}

// Success/error functions
api.use((req, res, next) => {
  res.error = (status, error, details) => {
    res
      .status(status)
      .json({ error, details: details || 'No further information', status: 'error' });
  };
  res.success = data => {
    if (data) res.status(200).json({ data, status: 'success' });
    else res.status(200).json({ status: 'success' });
  };

  // Store pool connection inside of req for access by other API files
  req.pool = pool;
  next();
});

api.use('/user', user);

// FAQ's
api.get('/faq', (req, res) => {
  let db: mysql.PoolConnection;
  pool
    .getConnection()
    .then(conn => {
      db = conn;
      return db.query('SELECT question, answer FROM faq ORDER BY priority');
    })
    .then(faqs => {
      res.success(faqs);
      db.release();
    })
    .catch(error => {
      if (db && db.end) db.release();
      res.error(500, 'Database error', error);
    });
});

// Execs
api.get('/execs', (req, res) => {
  let db: mysql.PoolConnection;
  pool
    .getConnection()
    .then(conn => {
      db = conn;
      return db.query('SELECT first_name, last_name, bio FROM user WHERE role_id = 3');
    })
    .then(execs => {
      res.success(execs);
      db.release();
    })
    .catch(error => {
      if (db && db.end) db.release();
      res.error(500, 'Database error', error);
    });
});

// Sponsors
api.get('/sponsors', (req, res) => {
  let db: mysql.PoolConnection;
  pool
    .getConnection()
    .then(conn => {
      db = conn;
      return db.query('SELECT name, image, website FROM sponsor ORDER BY priority');
    })
    .then(execs => {
      res.success(execs);
      db.release();
    })
    .catch(error => {
      if (db && db.end) db.release();
      res.error(500, 'Database error', error);
    });
});

// Events
api.get('/events', (req, res) => {
  let db: mysql.PoolConnection;
  const out: VPEvent[] = [];
  pool
    .getConnection()
    .then(conn => {
      db = conn;
      return db.query('SELECT event_id, name, address, transport, description FROM event');
    })
    .then(events => {
      const promises = events.map((event: VPEvent) => {
        const query = req.session.userData
          ? // Query if logged in
            `SELECT
              s.shift_id, s.shift_num,
              s.date, s.start_time, s.end_time,
              s.meals, s.max_spots, s.spots_taken, s.notes,
              (CASE WHEN us.user_id IS NULL THEN 0 ELSE 1 END) AS signed_up
            FROM vw_shift s
            JOIN user u
            LEFT JOIN user_shift us ON us.shift_id = s.shift_id AND us.user_id = u.user_id
            WHERE s.event_id = ? AND u.user_id = ?`
          : // Query if not logged in
            `SELECT
              s.shift_id, s.shift_num,
              s.date, s.start_time, s.end_time,
              s.meals, s.max_spots, s.spots_taken, s.notes,
              0 signed_up
            FROM vw_shift s
            WHERE s.event_id = ? AND ?`;
        const userID = req.session.userData ? req.session.userData.user_id : -1;
        return db.query(query, [event.event_id, userID]).then(shifts => {
          return out.push({
            ...event,
            shifts: shifts.map((shift: any) => ({
              ...shift,
              meals: shift.meals.split(','),
              // Deal with booleans
              signed_up: !!shift.signed_up,
            })),
          });
        });
      });
      return Promise.all(promises);
    })
    .then(events => {
      res.success(out);
      db.release();
    })
    .catch(error => {
      if (db && db.end) db.release();
      res.error(500, 'Database error', error);
    });
});

// Signup
api.post('/signup', (req, res) => {
  if (!req.session.userData) return res.error(401, 'Not logged in');
  let db: mysql.PoolConnection;
  pool
    .getConnection()
    .then(conn => {
      db = conn;
      const values = (req.body.shifts as number[]).map(shift => [
        req.session.userData.user_id,
        shift,
      ]);
      return db.query('INSERT INTO user_shift (user_id, shift_id) VALUES ?', [values]);
    })
    .then(execs => {
      res.success('Signed up successfully');
      db.release();
    })
    .catch(error => {
      if (db && db.end) db.release();
      res.error(500, 'Database error', error);
    });
});

// 404
api.get('*', (req, res) => {
  res.error(404, 'Unknown endpoint');
});

export default api;