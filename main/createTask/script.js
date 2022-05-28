const modal = document.querySelector(".modal-container");
const tbody = document.querySelector("tbody");
const sname = document.querySelector("#m-name");
const sdescription = document.querySelector("#m-description");
const sdate = document.querySelector("#m-date");
const btnSalvar = document.querySelector("#btncreate");

let itens;
let id;

function openModal(edit = false, index = 0) {
  modal.classList.add("active");

  modal.onclick = (e) => {
    if (e.target.className.indexOf("modal-container") !== -1) {
      modal.classList.remove("active");
    }
  };

  if (edit) {
    sname.value = itens[index].name;
    sdescription.value = itens[index].description;
    sdate.value = itens[index].date;
    id = index;
  } else {
    sname.value = "";
    sdescription.value = "";
    sdate.value = "";
  }
}

function editItem(index) {
  openModal(true, index);
}

function deleteItem(index) {
  itens.splice(index, 1);
  setItensBD();
  loadItens();
}

function insertItem(item, index) {
  let tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.name}</td>
    <td>${item.description}</td>
    <td> ${item.date}</td>
    <td class="action">
      <button onclick="editItem(${index})"><i class='bx bx-edit' ></i></button>
    </td>
    <td class="action">
      <button type="submit" onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

btnSalvar.onclick = (e) => {
  if (sname.value == "" || sdescription.value == "" || sdate.value == "") {
    return;
  }

  // e.preventDefault();

  if (id !== undefined) {
    itens[id].name = sname.value;
    itens[id].description = sdescription.value;
    itens[id].date = sdate.value;
  } else {
    itens.push({
      name: sname.value,
      description: sdescription.value,
      date: sdate.value,
    });
  }

  setItensBD();

  modal.classList.remove("active");
  loadItens();
  id = undefined;

  window.location.href = "./index.html";
};

function loadItens() {
  itens = getItensBD();
  tbody.innerHTML = "";
  itens.forEach((item, index) => {
    insertItem(item, index);
  });
}

const getItensBD = () => JSON.parse(localStorage.getItem("dbfunc")) ?? [];
const setItensBD = () => localStorage.setItem("dbfunc", JSON.stringify(itens));

loadItens();
