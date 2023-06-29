const Ajv = require("ajv");

const ajv = new Ajv.default({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
const AjvErrors = require("ajv-errors");

AjvErrors(ajv);

window.AJVManager = {
  ajv,
  buildSchema: (schema) => {
    const ERROR_REQUIRED = "Поле объязательно для заполнения";
    const ERROR_TYPE = "Неверный формат ввода";

    let errorMessage = {
      required: ERROR_REQUIRED,
      properties: {},
    };

    let propertiesError = {};
    Object.keys(schema.properties).forEach((key) => {
      propertiesError[key] = ERROR_TYPE;
    });

    errorMessage.properties = propertiesError;
    schema.errorMessage = errorMessage;
    return schema;
  },
  addErrors: (formId, errors) => {
    let formEl = document.forms[formId];
    let formData = new FormData(formEl);
    let allFields = [];
    let allDivs = [];

    function insertAfter(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    for (const pair of formData.entries()) {
      allFields.push(pair[0]);
    }

    // REMOVE ALL
    let errorsLabels = formEl.querySelectorAll(".errors-div");
    errorsLabels.forEach((el) => el.remove());

    allFields.forEach((field) => {
      let elem = formEl.querySelector(`[name=${field}]`);
      if (elem) {
        elem.removeAttribute("invalid");
      }
    });

    // ADD ERRORS

    function getErrorField(error) {
      if (error.keyword == "required") {
        return error.params.missingProperty;
      }
      if (error.keyword == "type") {
        return error.instancePath || error.dataPath;
      }
      return "";
    }

    errors.forEach((error) => {
      let errorName = getErrorField(error).replace("/", "");
      //  if (allFields.includes(errorName)) {
      let elem = formEl.querySelector(`[name=${errorName}]`);
      if (elem) {
        elem.setAttribute("invalid", "");
        let newNode = document.createElement("div");
        newNode.classList.add("errors-div");
        newNode.style.color = "red";
        newNode.innerHTML = error.message;
        insertAfter(elem, newNode);
      }

      // }
    });
  },
  checkFormAndBuildErrors: (schema, data, formId) => {
    let buildedSchema = window.AJVManager.buildSchema(schema);

    const validate = window.AJVManager.ajv.compile(buildedSchema);
    const valid = validate(data);
    if (!valid) {
      //BUILD ERRORS
      let errorsObj = [];
      validate.errors.forEach((error) => {
        let tempError = error.params.errors;
        tempError = tempError.map((el) => {
          el.message = error.message;
          return el;
        });
        errorsObj = errorsObj.concat(tempError);
      });

      console.log("ERROR_OBJECT", errorsObj);
      window.AJVManager.addErrors(formId, errorsObj);
      return false;
    }
    window.AJVManager.addErrors(formId, []);
    return true;
  },
};
