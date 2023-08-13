window.ApiManager = {
  getCustomerDataById: async (customerId) => {
    if (!customerId) {
      console.log("CUSTOMER ID DOES NOT SPRCIFIED");
      return undefined;
    }
    let path = "/customer/" + customerId;
    const response = await fetch(path, {
      method: "GET",
    });
    return await response.json();
  },
  putCustomerPhoto: async (customerId, formData) => {
    let path = "/add_customer_photos/" + customerId;
    const response = await fetch(path, {
      method: "POST",
      headers: {},
      body: formData,
    });
    return await response.json();
  },
};
