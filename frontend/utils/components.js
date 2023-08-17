Ractive.components["fileupload-c"] = Ractive.extend({
  // this will be applied to all Slideshow instances
  template: `<coral-fileupload name="file" async="" id="fileUpload" 
    multiple="">
    <div coral-fileupload-dropzone="" class="fileUpload-dropZone">Перетащите файл...</div>
    <button style="width:100%" coral-fileupload-select="" is="coral-button">Выбрать файл...</button>
    <div id="added_photo">
        {{#each files }}
            <div style="display:flex; padding: 10px; border: 1px dashed rgb(150, 150, 150);margin-top:10px;flex-direction: column;justify-content: center;align-items: center;">
             <img style="width:25vw; height: fit-content; border:1px solid black" src="{{this.src}}">
             <div style="padding:1rem">
                    <label for="fieldLabelExample2-lifestory" class="coral-FormGroup-itemLabel coral-FieldLabel--left">Комментарии к фото:  </label>
                    <textarea  style="width:100%;resize: none;" rows=4 id="fieldLabelExample2-lifestory" placeholder="Комментарий..." value={{this.description}}  is="coral-textarea"></textarea>
                <div>
                    <coral-checkbox on-change="@this.selectChanged(@event , this)" >По умолчанию дата фото - текущая дата. Редактировать дату фото?</coral-checkbox>
                    <h3> Дата добавления (yyyy-mm-dd)  </h3>
                    <h3> {{this.time}}</h3>
                    <div style="min-height:3rem">
                    {{#if this.isCusomDate}}    
                        <label id="label1" class="coral-Form-fieldlabel">Выберете дату </label>
                        <coral-datepicker on-change="@this.datepickerChange(@event , this)" value={{this.time}} style="width:100%" labelledby="label1"></coral-datepicker>
                    {{/if}}  
                    </div>
                </div>    
             </div>   
            <button style="width:100%" on-click="@this.deletePhoto(@index)" is="coral-button" aria-label="home" 	icon="closeCircle"> Удалить фото </button>                    
            </div>
        {{/each}}
    </div>
</coral-fileupload>`,

  selectChanged(event, value) {
    event.stopPropagation();
    value.isCusomDate = event.target.checked;
    this.update();
  },
  datepickerChange(event, value) {
    value.time = event.target.value;
    this.update();
  },
  deletePhoto(index) {
    this.splice("files", index, 1);
  },

  oncomplete: function () {
    var self = this;
    window.files = this;
    if (Array.isArray(self.get("files"))) {
      self.set("files", []);
    }

    this.padTo2Digits = (num) => {
      return num.toString().padStart(2, "0");
    };

    this.formatDate = (date) => {
      return [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join("-");
    };

    window.addEventListener("load", function () {
      var fileUpload = document.getElementById("fileUpload");
      // Listen to XHR events
      var xhrEventNames = [
        "loadstart",
        "readystatechange",
        "progress",
        "timeout",
        "load",
        "loadend",
        "error",
        "abort",
        "dragenter",
        "dragover",
        "dragleave",
        "drop",
      ];

      xhrEventNames.forEach(function (name) {
        fileUpload.on("coral-fileupload:" + name, function (event) {
          console.log(name);
          if (event.detail && event.detail.item) {
            console.log(event.detail.item);
          }
        });
      });

      // Listen to fileupload events
      fileUpload.on("coral-fileupload:fileadded", function (event) {
        var reader = new FileReader();
        reader.readAsDataURL(event.detail.item.file);
        reader.onload = function () {
          self.push("files", {
            file: event.detail.item.file,
            src: reader.result,
            time: self.formatDate(new Date()),
            isCusomDate: false,
          });
        };
      });
    });
  },
});

Ractive.components["table-c"] = Ractive.extend({
  data: {
    columns: [{ title: "name", rowsTemplate: "{{name}} {{last_name}}" }],
    rows: [{ name: "aaaa", date_of_birth: "aaaaaaxxxx" }],
  },
  template: `  <table is="coral-table" variant="quiet">
        <thead is="coral-table-head">
          <tr is="coral-table-row">
            {{#each columns}}
            <th is="coral-table-headercell">{{this.title}}</th>
            {{/each}}
            <th is="coral-table-headercell">Actions</th>
          </tr>
        </thead>
        <tbody is="coral-table-body">
        {{#each rows as row}}
          <tr is="coral-table-row">
          {{#each columns as column}}
            <td is="coral-table-cell" role="rowheader">
            {{#if this['rowsTemplate']}}
                {{>{template : this['rowsTemplate'] }}}
            {{else}}
                {{row[column.title]}}
            {{/if}}
          
            </td>
          {{/each}}
            <td is="coral-table-cell" role="rowheader">
            
           <coral-splitbutton variant="cta">
            <button type="button" is="coral-button" coral-splitbutton-action="">Выберете действие</button> 
            <button id="index{{@index}}" type="button" is="coral-button" icon="ChevronDown" coral-splitbutton-trigger=""></button>
          </coral-splitbutton>
          <coral-popover target="#index{{@index}}" placement="bottom">
            <coral-buttonlist>
              <button on-click="@this.actionChanged('details' ,  this)" is="coral-buttonlist-item">Подробнее</button>
              <button on-click="@this.actionChanged('edit' , this)" is="coral-buttonlist-item">Pедактировать</button>
              <button on-click="@this.actionChanged('add_photo' , this)" is="coral-buttonlist-item">Добавить фото</button>
              <button on-click="@this.actionChanged('details' ,  this)" is="coral-buttonlist-item">Добавить сеанс</button>
              <button on-click="@this.actionChanged('delete' ,  this)" is="coral-buttonlist-item">Удалить</button>
            </coral-buttonlist>
          </coral-popover>
            </td>  
          </tr>
        {{/each}}  
        </tbody>
      </table>`,

  actionChanged(action, record) {
    window.bla = this;
    if (action == "details") {
      // console.log("DETAILS", record);
      this.get("details")(record);
    }
    if (action == "edit") {
      this.get("edit")(record);
    }
    if (action == "delete") {
      this.get("delete")(record);
    }
    if (action == "add_session") {
      this.get("addSession")(record);
    }
    if (action == "add_photo") {
      this.get("addPhotos")(record);
    }
  },
});

Ractive.components["header-c"] = Ractive.extend({
  data: { path: "./" },
  template: `<div style="background-color: white;display: flex;border-bottom: 1px solid;" >
   <div>
        <img style="height:8vh" src="{{path + 'assets/Mediamodifier-Design-Template (2).png'}}">
    </div>
   
</div>    
`,
});

Ractive.components["nav-c"] = Ractive.extend({
  template: `        
  <nav class="navbar navbar-expand-lg" style="background-color: #e3f2fd;">
  <div class="container-fluid">
  <button class="btn btn-outline-success me-2" type="button" onclick="history.back()" ><a class="nav-link active" aria-current="page" >Назад</a></button>
   {{#each fields}}
      <button class="btn btn-outline-success me-2" type="button"><a class="nav-link active" aria-current="page" href={{this.href}}>{{this.title}}</a></button>  
   {{/each}}
   <button  on-click="@this.exitApp()"   class="btn btn-outline-success me-2" type="button"><a class="nav-link active" aria-current="page" href="/">Выйти</a></button>
  </div>
</nav> 
`,
  exitApp() {
    window.localStorage.removeItem("user");
  },

  data: {
    fields: [{ title: "На главную страницу", href: "/main_page_render" }],
  },
});

Ractive.components["card-c"] = Ractive.extend({
  data: { src: "", description: "", timestamp: "time", modalOpened: false },
  switchModal: function () {
    console.log("CLICKED!!");
    //this.set("modalOpened", this.get("modalOpened"));
    this.set("modalOpened", true);
  },
  oncomplete: function () {
    this.set("modal_id", Math.random().toString(36).slice(-8));
  },
  template: `      

<!-- MODAL -->

<!-- Button trigger modal -->


<!-- Modal FULL SCREEN -->
<div class="modal fade modal-xl" id={{modal_id}} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-body">
        <img style="width:100%; height: fit-content; border:1px solid black" src="{{this.src}}">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
       <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
      </div>
    </div>
  </div>
</div>

<!-- MODAL DELETE -->
<div class="modal fade modal-xl" id={{modal_id +  "_delete"}} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
          <div class="modal-header">
          <h5 class="modal-title" >Вы уверены что хотите удалить данное фото ?  </h5> 
      </div>
      <div class="modal-body">
        <img style="width:100%; height: fit-content; border:1px solid black" src="{{this.src}}">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
        <button type="button" class="btn btn-primary" on-click="@this.deletePhoto()" >Удалить</button> 
      </div>
    </div>
  </div>
</div>



  <div id="added_photo">
            <div style="display:flex; padding: 10px; border: 1px dashed rgb(150, 150, 150);margin-top:10px;flex-direction: column;justify-content: center;align-items: center;">
            <img style="width:50%; height: fit-content; border:1px solid black" src="{{this.src}}">
             <button style="width:50%" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#{{modal_id}}">
                Увеличить
              </button>
              <!-- TODO FINISH -->
             <!--  <button style="width:50%" type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#{{modal_id + '_delete'}}">
                Удалить
              </button> -->
             
             <div style="padding:1rem">
                    <label for="fieldLabelExample2-lifestory" class="coral-FormGroup-itemLabel coral-FieldLabel--left">Комментарии к фото:  </label>
                    <textarea  style="width:100%;resize: none;" rows=4 id="fieldLabelExample2-lifestory" placeholder="Комментарий..." value={{this.description}}  is="coral-textarea"></textarea>
                <div>
                    <h3> Дата добавления (yyyy-mm-dd)  </h3>
                    <h3> {{this.timestamp}}</h3>
                </div>    
             </div>                      
            </div>
    </div>
`,
});

Ractive.components["calendar-c"] = Ractive.extend({
  data: {
    fieldName: "date-of-birth",
    placeholder: "",

    label: "Дата рождения",
  },
  template: `
    <label class="coral-FormGroup-itemLabel coral-FieldLabel--left" for="fieldLabelExample2-emailaddress">Дата
            рождения:</label>

       <input id="calendar-input"  is="coral-textfield" aria-invalid="false" type="text" placeholder={{placeholder}} name={{fieldName}}>
       <button id="calendar-btn" type="button" is="coral-button" class=" _coral-InputGroup-button _coral-FieldButton"  aria-label="home" icon="calendar"></button>
`,
  onrender: function () {
    let defaultOptions = {
      autoClose: true,
      isMobile: true,
      autoClose: true,
    };
    let options = defaultOptions;
    let datepicker = new AirDatepicker("#calendar-input", options);
    let btnPicker = this.find("#calendar-btn");
    btnPicker.addEventListener("click", () => {
      datepicker.show();
    });
  },
});
