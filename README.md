# site-verifier

This is a conformance test suite for test sites. It catches common issues to ensure all pages are identical.

## Install

The test suite requires:

- An installed copy of NodeJS
- An installed copy of Chrome

Dependencies are installed with this command:

```sh
npm install
```

## Test

Start the server for your website.

Go to the `.env` file and update `SITE_URL` to match the URL the server is listening on.

Run the following command:

```sh
npm run test
```
