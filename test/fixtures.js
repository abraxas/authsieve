var Apps = {
  test: { name: "Test" },
  test2: { name: "Test2" },
}

var AppUsers = {
  test_user: {
    App: "test",
    username: "test_user",
    password: "test_hash"
  },
  foobar: {
    App: "test",
    username: "foobar",
    password: "test_hash"
  },
  test2_user: {
    App: "test2",
    username: "test_user",
    password: "test_hash"
  },
}

module.exports = {
  App: Apps,
  AppUser: AppUsers,
}
