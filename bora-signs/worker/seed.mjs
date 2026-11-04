// Starting users of the panel. Each one is asked to choose a new password at the first sign-in;
// from the first password change on, the users are kept in Cloudflare KV and this list no longer applies.
// Only salted PBKDF2 hashes are here, never the passwords.
export default [
  {
    "username": "carlos",
    "name": "Carlos Cardoso",
    "salt": "Du5eHgHxKdhb60WF6dQnpg==",
    "iterations": 20000,
    "hash": "ra69dDgBixQdv1OZpMDagcLnrr8jH3tt9j8W3WU1aAo=",
    "v": 0,
    "mustChange": true
  },
  {
    "username": "lucas",
    "name": "Lucas",
    "salt": "d9o27b0LY6oNm4E/trxPFg==",
    "iterations": 20000,
    "hash": "flZe7n+hvixAucYt4y8C9qL/JJSGr5SiNL7QDF0RWXo=",
    "v": 0,
    "mustChange": true
  }
];
