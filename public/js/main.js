var firebaseConfig = {
  apiKey: "AIzaSyDSFsrSAuaHaaWZbC0JE4Yd8OYSAXWDu-Y",
  authDomain: "memowebapp-dc813.firebaseapp.com",
  databaseURL: "https://memowebapp-dc813.firebaseio.com",
  projectId: "memowebapp-dc813",
  storageBucket: "memowebapp-dc813.appspot.com",
  messagingSenderId: "185094081787",
  appId: "1:185094081787:web:a855575d8a93c3da6af45e",
};

firebase.initializeApp(firebaseConfig);
let auth = firebase.auth();
let database = firebase.database();
let userInfo, selectedKey;
let authProvider = new firebase.auth.GoogleAuthProvider();

let txtArea = document.querySelector(".textarea");

auth
  .setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(function () {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("success");
        userInfo = user;
        get_memo_list();
      } else {
        auth.signInWithPopup(authProvider);
      }
    });
  })
  .catch(function (error) {
    let errorCode = error.code;
    let errorMsg = error.message;
    console.log(`error code : ${errorCode}, msg : ${errorMsg}`);
  });

function get_memo_list() {
  let memoRef = database.ref("memos/" + userInfo.uid);
  memoRef.on("child_added", on_child_added);
  memoRef.on("child_changed", (data) => {
    let txt = data.val().txt;
    let title = txt.substr(0, txt.indexOf("\n"));
    let firstTxt = txt.substr(0, 1);

    let newtxt = document.querySelector(`#${data.key} > .txt`);
    let newtitle = document.querySelector(`#${data.key} > .title`);
    let newi = document.querySelector(`#${data.key} > i`);
    newtitle.innerText = title;
    newtxt.innerText = txt;
    newi.innerText = firstTxt;
  });
}

function on_child_added(data) {
  //   console.log(data);
  let key = data.key;
  let memoData = data.val();
  //   console.log(memoData);
  let txt = memoData.txt;
  let title = txt.substr(0, txt.indexOf("\n"));
  let firstTxt = txt.substr(0, 1);

  let html = `<li id='${key}' class="collection-item avatar" onclick="fn_get_data_one(this.id)">
    <i class="material-icons circle red">
    ${firstTxt}
    </i>
    <span class="title">
    ${title}
    </span>
    <p class='txt'>
    ${txt}
    <br>
    </p>
    <a href="#" onclick="fn_delete_data('${key}')" class="secondary-content">
    <i class="material-icons">grade</i>
    </a>
    </li>`;

  let collection = document.querySelector(".collection");
  collection.insertAdjacentHTML("beforeend", html);
}

function fn_get_data_one(key) {
  selectedKey = key;
  let memoRef = database
    .ref("memos/" + userInfo.uid + "/" + key)
    .once("value")
    .then(function (snapshot) {
      txtArea.value = snapshot.val().txt;
    });
}

function fn_delete_data(key) {
  if (!confirm("do you really want to delete?")) {
    return;
  }
  let memoRef = database.ref("memos/" + userInfo.uid + "/" + key);
  let delli = document.querySelector(`#${key}`);
  memoRef.remove();
  delli.remove();
  initMemo();
}

function save_data() {
  let memoRef = database.ref("memos/" + userInfo.uid);
  let txt = txtArea.value;
  if (txt == "") {
    return;
  }
  if (selectedKey) {
    let rememoRef = database.ref("memos/" + userInfo.uid + "/" + selectedKey);
    rememoRef.set({
      txt: txt,
      createDate: new Date().getTime(),
      updateDate: new Date().getTime(),
    });
  } else {
    memoRef.push({
      txt: txt,
      createDate: new Date().getTime(),
    });
  }
}

function initMemo() {
  txtArea.value = "";
  selectedKey = null;
}

txtArea.addEventListener("blur", function () {
  save_data();
});
