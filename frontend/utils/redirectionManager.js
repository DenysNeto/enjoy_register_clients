window.RedirectionManager = {
  checkUserExists: function (role) {
    console.log("CHECK_USER_EXISTS_CALLED");
    let user = localStorage.getItem("user");
    if (role && user.role !== role) {
      window.location.href = `/`;
    }
    if (!user) {
      window.location.href = `/`;
    } else {
      try {
        fetch("/login", {
          method: "POST",
          headers: {},
          body: user, //formData
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data.status != 200) window.location.href = `/`;
          });
      } catch (err) {
        window.location.href = `/`;
      }
    }
  },
};
