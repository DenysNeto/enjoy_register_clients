window.UtilsManager = {
  generateRandomLogin: () => {
    var randomstring = Math.random().toString(36).slice(-8);
    return randomstring;
  },
  buildObjectFromFormData: (formData) => {
    let objData = {};
    for (const pair of formData.entries()) {
      if (pair[1] != "") {
        objData[pair[0]] = pair[1];
      }
    }
    return objData;
  },
  injectScripts: () => {},
};
