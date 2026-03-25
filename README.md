# site-verifier

This is a conformance test suite for test sites. It catches common issues to ensure all pages are identical.

It is NOT a replacement for manual tests and inspection. This is especially true for style-related bugs, as the tests mainly focus on structure and logic.

## Install

The test suite requires:

- An installed copy of NodeJS
- An installed copy of Chrome

Dependencies are installed with this command:

```sh
npm install
```

## Test

Start the database and server for your website.

Go to the `.env` file and:

- Update `SITE_URL` to match the URL the server is listening on.
- Update `DATABASE_URL` with the connection string for the database.

Run the following command:

```sh
npm run test
```
